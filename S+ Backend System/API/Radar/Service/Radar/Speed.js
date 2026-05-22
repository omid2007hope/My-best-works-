const BaseService = require("../BaseService/index");

const SPEED_UNITS = Object.freeze({
  KMH: "KMH",
  MPS: "MPS",
  MPM: "MPM",
  KNOT: "KNOT",
  MPH: "MPH",
});

module.exports = new (class SpeedService extends BaseService {
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

  calculateAndPost = async (distanceLogs = [], unit = SPEED_UNITS.MPM) => {
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

    const relativeSpeedKmh = this.toKmh(
      avgDistanceDecreasePerMinute,
      unit,
    );

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
