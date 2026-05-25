const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");
const Distance = require("../../Model/Distance/DistanceModel");
const { simpleDistanceCompute } = require("../../Service/Distance/Compute");

const distanceController = new (class DistanceController extends Status {
  computeDistance = asyncHandler(async (req, res) => {
    try {
      const result = await simpleDistanceCompute();
      return res.status(this.created).json(result);
    } catch (error) {
      console.error(error, "could't compute the distance");
      return res.status(this.error);
    }
  });
})();

module.exports = distanceController;
