const BaseService = require("../BaseService/index");
const SpeedModel = require("../../Model/Speed/SpeedModel");
const radarService = require("./Radar");

const SPEED_UNITS = Object.freeze({
  KMH: "KMH",
  MPS: "MPS",
  MPM: "MPM",
  KNOT: "KNOT",
  MPH: "MPH",
});

module.exports = new (class SpeedService extends BaseService {
  constructor() {
    super();
    this.model = SpeedModel;
  }

  toKmh = (value, unit = SPEED_UNITS.KMH) => {
    switch (String(unit).toUpperCase()) {
      case SPEED_UNITS.KMH:
        return value;
      case SPEED_UNITS.MPS:
        return value * 3.6;
      case SPEED_UNITS.MPM:
        return (value * 60) / 1000;
      case SPEED_UNITS.KNOT:
        return value * 1.852;
      case SPEED_UNITS.MPH:
        return value * 1.60934;
      default:
        throw new Error(`Unsupported unit: ${unit}`);
    }
  };

  summarizeDistanceLogs = (distanceLogs = [], unit = SPEED_UNITS.MPM) => {
    if (!Array.isArray(distanceLogs) || distanceLogs.length < 2) {
      throw new Error(
        "At least two distance logs are required to calculate speed.",
      );
    }

    const distanceDecrementsMetersPerMinute = [];

    distanceLogs.forEach((log, index) => {
      if (index > 0) {
        const previousDistanceMeters = Number(
          distanceLogs[index - 1].distanceMeters ??
            distanceLogs[index - 1].distance ??
            0,
        );
        const currentDistanceMeters = Number(
          log.distanceMeters ?? log.distance ?? 0,
        );
        const decrement = previousDistanceMeters - currentDistanceMeters;
        distanceDecrementsMetersPerMinute.push(decrement);
      }
    });

    const avgDistanceDecreasePerMinute =
      distanceDecrementsMetersPerMinute.reduce((sum, val) => sum + val, 0) /
      distanceDecrementsMetersPerMinute.length;

    return {
      distanceDecrementsMetersPerMinute,
      avgDistanceDecreasePerMinute,
      relativeSpeedKmh: this.toKmh(avgDistanceDecreasePerMinute, unit),
    };
  };

  getValuesFromRadarBurst = (burstPayload = {}, unit = SPEED_UNITS.MPM) => {
    const burstValues = radarService.getBurstValues(burstPayload);
    const distanceLogs = Array.isArray(burstPayload.distanceLogs)
      ? burstPayload.distanceLogs
      : Array.isArray(burstPayload.distanceMetersByChirp)
        ? burstPayload.distanceMetersByChirp.map((distanceMeters) => ({
            distanceMeters,
          }))
        : [];

    if (distanceLogs.length < 2) {
      return {
        ...burstValues,
        distanceLogs,
        speedKmh: null,
        distanceDecreasePerMinuteMeters: null,
        calculationReady: false,
      };
    }

    const summary = this.summarizeDistanceLogs(distanceLogs, unit);

    return {
      ...burstValues,
      distanceLogs,
      speedKmh: summary.relativeSpeedKmh,
      distanceDecreasePerMinuteMeters: summary.avgDistanceDecreasePerMinute,
      calculationReady: true,
    };
  };

  calculateAndPost = async (
    distanceLogsOrBurst = [],
    unit = SPEED_UNITS.MPM,
  ) => {
    const distanceLogs = Array.isArray(distanceLogsOrBurst)
      ? distanceLogsOrBurst
      : this.getValuesFromRadarBurst(distanceLogsOrBurst, unit).distanceLogs;
    const { avgDistanceDecreasePerMinute, relativeSpeedKmh } =
      this.summarizeDistanceLogs(distanceLogs, unit);

    console.log(
      `Average distance decrease per minute: ${avgDistanceDecreasePerMinute} m/min`,
    );
    console.log(`Relative speed from radar trend: ${relativeSpeedKmh} km/h`);

    // ! Normalize all speed units through km/h so matching results stay consistent.
    return this.simplePost({
      speedKmh: relativeSpeedKmh,
      distanceDecreasePerMinuteMeters: avgDistanceDecreasePerMinute,
      timestamp: new Date(),
    });
  };
})();
