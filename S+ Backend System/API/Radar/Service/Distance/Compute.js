const BaseService = require("../BaseService");
const { waveReflectionDuration } = require("../../Data/Test_Data");

module.exports = new (class ComputeDistanceService extends BaseService {
  normalizeData = waveReflectionDuration.forEach((items) => {
    const result = this.miliSecondToSecond(
      (data = {
        id: items.id,
        value: items.value,
        unit: items.unit,
        timeStamp: items.timestamp,
      }),
    );
    return result;
  });

  miliSecondToSecond = (data) => {
    if (data.unit !== null && data.unit === "ms") {
      const waveReflectionDurationInSecond = data.value / 1000;
      const result = this.simpleDistanceCompute(waveReflectionDurationInSecond);
      return result;
    }
  };

  simpleDistanceCompute = (waveReflectionDurationInSecond) => {
    const speedOfLight = 299792458; // in meters per second
    const distance = (waveReflectionDurationInSecond * speedOfLight) / 2;
    return this.simplePost(distance);
  };
})();
