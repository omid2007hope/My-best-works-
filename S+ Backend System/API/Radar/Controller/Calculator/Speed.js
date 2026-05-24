const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");

const Distance = require("../../Model/Distance/DistanceModel");
const Speed = require("../../Model/Speed/SpeedModel");
const Identification = require("../../Model/Identification/IdentificationModel");
const Radar = require("../../Model/Radar/RadarModel");

const speedController = new (class SpeedController extends Status {
  listSpeed = asyncHandler(async (req, res) => {
    const records = await Speed.find().sort({ timestamp: -1 });
    res.status(this.success).json(records);
  });

  createSpeed = asyncHandler(async (req, res) => {
    const record = await Speed.create(req.body || {});
    res.status(this.created).json(record);
  });
})();

module.exports = {
  listSpeed: speedController.listSpeed,
  createSpeed: speedController.createSpeed,
};
