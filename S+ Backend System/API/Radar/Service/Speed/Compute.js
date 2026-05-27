const BaseService = require("../BaseService");

const logs_Sample = [
  { id: 1, distance: 400000, timeStamp: "12pm" },

  {
    id: 2,
    distance: 300000,
    timeStamp: "1pm",
  },
  {
    id: 3,
    distance: 200000,
    timeStamp: "2pm",
  },
];
module.exports = new (class ComputeSpeedService extends BaseService {
  calculateDiffrence = (logs = []) => {
    const diffrence = logs.map((log, index) => {
      if (index === 0) return 0;
      return log.distance - logs[index - 1].distance;
    });
    return diffrence;
  };
})();
