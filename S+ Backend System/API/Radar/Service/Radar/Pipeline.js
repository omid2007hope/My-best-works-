const distanceService = require("./Distance");
const speedService = require("./Speed");
const { identifyPlanes } = require("./Identification");

const DistanceModel = require("../../Model/Distance/DistanceModel");
const SpeedModel = require("../../Model/Speed/SpeedModel");
const IdentificationModel = require("../../Model/Identification/IdentificationModel");
const TargetModel = require("../../Model/Target/TargetModel");

// Speed history window size per target (number of most-recent distance records used).
const SPEED_WINDOW = 10;

class PipelineService {
  // Run the full burst-to-identification pipeline for all detected targets.
  // Returns { targetCount, detections, distanceRecords, speedResults, identResults }.
  processOneBurst = async (burstPayload, options = {}) => {
    const topN = options.topN ?? 10;
    const peakOptions = options.peakOptions ?? {};

    // 1. Extract one distance record per detected peak (multi-target).
    const detections = distanceService.getMultiTargetDistances(
      burstPayload,
      peakOptions,
    );

    if (!detections.length) {
      return {
        targetCount: 0,
        detections: [],
        distanceRecords: [],
        speedResults: [],
        identResults: [],
      };
    }

    // 2. Persist a distance record and upsert the track entry for each detection.
    const distanceRecords = await Promise.all(
      detections
        .filter((d) => d.distanceMeters != null)
        .map(async (d) => {
          const targetId = `t${d.targetIndex}`;
          const now = new Date();

          const doc = await new DistanceModel({
            targetId,
            distanceMeters: d.distanceMeters,
            computationSource: d.computationSource,
            peakSampleIndex: d.peakSampleIndex,
            snrDb: d.snrDb,
            timestamp: now,
          }).save();

          // Upsert the lightweight target track summary.
          await TargetModel.findOneAndUpdate(
            { targetId },
            {
              $set: { lastSeen: now, lastDistanceMeters: d.distanceMeters },
              $inc: { detectionCount: 1 },
              $setOnInsert: { firstSeen: now },
            },
            { upsert: true, new: true },
          );

          return doc;
        }),
    );

    // 3. Per-target speed: derive from recent timestamp-ordered distance history.
    const speedResults = (
      await Promise.all(
        distanceRecords.map(async (dr) => {
          const history = await DistanceModel.find({ targetId: dr.targetId })
            .sort({ timestamp: -1 })
            .limit(SPEED_WINDOW)
            .lean();

          if (history.length < 2) return null;

          // Reverse to ascending time order for correct delta direction.
          const ordered = [...history].reverse();

          try {
            const summary = speedService.summarizeDistanceLogs(ordered);
            const doc = await new SpeedModel({
              targetId: dr.targetId,
              speedKmh: summary.relativeSpeedKmh,
              distanceDecreasePerMinuteMeters:
                summary.avgDistanceDecreasePerMinute,
              inputWindowCount: ordered.length,
              timestampOrdered: true,
              timestamp: new Date(),
            }).save();

            await TargetModel.findOneAndUpdate(
              { targetId: dr.targetId },
              { $set: { lastSpeedKmh: summary.relativeSpeedKmh } },
            );

            return doc;
          } catch (_) {
            return null;
          }
        }),
      )
    ).filter(Boolean);

    // 4. Per-target identification using the latest computed speed.
    const identResults = (
      await Promise.all(
        distanceRecords.map(async (dr) => {
          const latestSpeed = await SpeedModel.findOne({
            targetId: dr.targetId,
          })
            .sort({ timestamp: -1 })
            .lean();

          if (!latestSpeed) return null;

          const observation = { speedKmh: latestSpeed.speedKmh };
          const candidates = identifyPlanes(observation, undefined, topN);

          const doc = await new IdentificationModel({
            targetId: dr.targetId,
            observation,
            candidates,
            computationSource: "pipeline",
            timestamp: new Date(),
          }).save();

          await TargetModel.findOneAndUpdate(
            { targetId: dr.targetId },
            { $set: { lastIdentificationCandidates: candidates.slice(0, 3) } },
          );

          return doc;
        }),
      )
    ).filter(Boolean);

    return {
      targetCount: detections.length,
      detections,
      distanceRecords,
      speedResults,
      identResults,
    };
  };
}

module.exports = new PipelineService();
