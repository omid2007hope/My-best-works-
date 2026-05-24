const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");

const Distance = require("../../Model/Distance/DistanceModel");
const Speed = require("../../Model/Speed/SpeedModel");
const Identification = require("../../Model/Identification/IdentificationModel");
const Radar = require("../../Model/Radar/RadarModel");

const identificationController =
  new (class IdentificationController extends Status {
    listIdentification = asyncHandler(async (req, res) => {
      const records = await Identification.find().sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    createIdentification = asyncHandler(async (req, res) => {
      const record = await Identification.create(req.body || {});
      res.status(this.created).json(record);
    });
  })();

module.exports = {
  listIdentification: identificationController.listIdentification,
  createIdentification: identificationController.createIdentification,
};
