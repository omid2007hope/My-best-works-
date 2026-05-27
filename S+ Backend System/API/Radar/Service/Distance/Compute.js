const BaseService = require("../BaseService");
const { waveReflectionDuration } = require("../../Data/Test_Data");

module.exports = new (class ComputeDistanceService extends BaseService {
  normalizeData = async () => {
    return Promise.all(
      waveReflectionDuration.map(async (items) => {
        const data = {
          id: items.id,
          value: items.value,
          unit: items.unit,
          timeStamp: items.timestamp,
        };
        return this.miliSecondToSecond(data);
      }),
    );
  };

  miliSecondToSecond = (data) => {
    if (data.unit !== null && data.unit === "ms") {
      const waveReflectionDurationInSecond = data.value / 1000;
      return this.simpleDistanceCompute(waveReflectionDurationInSecond);
    }
    return data;
  };

  simpleDistanceCompute = (waveReflectionDurationInSecond) => {
    const speedOfLight = 299792458; // in meters per second
    const distance = (waveReflectionDurationInSecond * speedOfLight) / 2;
    return this.simplePost(distance);
  };

  getDistanceLogs = () => {
    return this.simpleGet();
  };
})();
