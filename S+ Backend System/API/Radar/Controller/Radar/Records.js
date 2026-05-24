const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");

const Distance = require("../../Model/Distance/DistanceModel");
const Speed = require("../../Model/Speed/SpeedModel");
const Identification = require("../../Model/Identification/IdentificationModel");
const Radar = require("../../Model/Radar/RadarModel");

const distanceService = require("../../Service/Radar/Distance");
const speedService = require("../../Service/Radar/Speed");
const { identifyPlanes } = require("../../Service/Radar/Identification");

const radarRecordsController =
  new (class RadarRecordsController extends Status {
    // ── Distance ──────────────────────────────────────────────────────────────

    listDistance = asyncHandler(async (req, res) => {
      const filter = req.query.targetId ? { targetId: req.query.targetId } : {};
      const records = await Distance.find(filter).sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    // Raw backfill — stores posted fields directly without any computation.
    createDistance = asyncHandler(async (req, res) => {
      const record = await Distance.create(req.body || {});
      res.status(this.created).json(record);
    });

    // Compute-first — calculates distanceMeters from burst payload or TOF field.
    computeDistance = asyncHandler(async (req, res) => {
      const record = await distanceService.CalculateAndPost(req.body);
      res.status(this.created).json(record);
    });

    // ── Speed ─────────────────────────────────────────────────────────────────

    listSpeed = asyncHandler(async (req, res) => {
      const filter = req.query.targetId ? { targetId: req.query.targetId } : {};
      const records = await Speed.find(filter).sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    // Raw backfill — stores posted fields directly without any computation.
    createSpeed = asyncHandler(async (req, res) => {
      const record = await Speed.create(req.body || {});
      res.status(this.created).json(record);
    });

    // Compute-first — derives speedKmh from a distanceLogs array (min 2 entries).
    computeSpeed = asyncHandler(async (req, res) => {
      const { distanceLogs, unit, targetId } = req.body || {};
      if (!Array.isArray(distanceLogs) || distanceLogs.length < 2) {
        return res.status(422).json({
          message: "distanceLogs array with at least 2 entries is required.",
        });
      }
      const record = await speedService.calculateAndPost(distanceLogs, unit, {
        targetId: targetId ?? null,
      });
      res.status(this.created).json(record);
    });

    // ── Identification ────────────────────────────────────────────────────────

    listIdentification = asyncHandler(async (req, res) => {
      const filter = req.query.targetId ? { targetId: req.query.targetId } : {};
      const records = await Identification.find(filter).sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    // Raw backfill — stores posted fields directly without any computation.
    createIdentification = asyncHandler(async (req, res) => {
      const record = await Identification.create(req.body || {});
      res.status(this.created).json(record);
    });

    // Compute-first — runs identification scoring and persists top-N candidates.
    computeIdentification = asyncHandler(async (req, res) => {
      const { speedKmh, durationHours, trajectoryProfile, topN, targetId } =
        req.body || {};
      if (speedKmh == null) {
        return res.status(422).json({ message: "speedKmh is required." });
      }
      const observation = { speedKmh, durationHours, trajectoryProfile };
      const candidates = identifyPlanes(observation, undefined, topN ?? 10);
      const record = await Identification.create({
        targetId: targetId ?? null,
        observation,
        candidates,
        computationSource: "computed",
        timestamp: new Date(),
      });
      res.status(this.created).json(record);
    });

    // ── Radar ─────────────────────────────────────────────────────────────────

    listRadar = asyncHandler(async (req, res) => {
      const records = await Radar.find().sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    createRadar = asyncHandler(async (req, res) => {
      const record = await Radar.create(req.body || {});
      res.status(this.created).json(record);
    });
  })();

module.exports = {
  listDistance: radarRecordsController.listDistance,
  createDistance: radarRecordsController.createDistance,
  computeDistance: radarRecordsController.computeDistance,
  listSpeed: radarRecordsController.listSpeed,
  createSpeed: radarRecordsController.createSpeed,
  computeSpeed: radarRecordsController.computeSpeed,
  listIdentification: radarRecordsController.listIdentification,
  createIdentification: radarRecordsController.createIdentification,
  computeIdentification: radarRecordsController.computeIdentification,
  listRadar: radarRecordsController.listRadar,
  createRadar: radarRecordsController.createRadar,
};
