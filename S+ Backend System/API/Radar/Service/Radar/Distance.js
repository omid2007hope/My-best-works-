const BaseService = require("../BaseService/index");

module.exports = new (class DistanceService extends BaseService {
  CalculateAndPost = async (waveBounceBackDuration) => {
    const speedOfLight = 299792458; // in meters per second

    try {
      if (waveBounceBackDuration != null) {
        const actualDistanceMeters =
          (speedOfLight * waveBounceBackDuration) / 2; // in meters
        console.log(
          `The actual distance to the target is ${actualDistanceMeters} meters based on the actual time of travel.`,
        );

        return this.simplePost({
          distanceMeters: actualDistanceMeters,
          timestamp: new Date(),
        });
      } else {
        throw new Error(
          "Wave bounce back duration is null. Cannot calculate distance.",
        );
      }
    } catch (error) {
      console.error(error, "Could not calculate the distance to the target");
      throw error;
    }
  };
})();
