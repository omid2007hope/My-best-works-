const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");

const Distance = require("../../Model/Distance/DistanceModel");
const Speed = require("../../Model/Speed/SpeedModel");
const Identification = require("../../Model/Identification/IdentificationModel");
const Radar = require("../../Model/Radar/RadarModel");

const distanceController = new (class DistanceController extends Status {
  listDistance = asyncHandler(async (req, res) => {
    const records = await Distance.find().sort({ timestamp: -1 });
    res.status(this.success).json(records);
  });

  createDistance = asyncHandler(async (req, res) => {
    const record = await Distance.create(req.body || {});
    res.status(this.created).json(record);
  });
})();

module.exports = {
  listDistance: distanceController.listDistance,
  createDistance: distanceController.createDistance,
};
