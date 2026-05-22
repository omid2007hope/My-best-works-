const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");

const Distance = require("../../Model/Distance/DistanceModel");
const Speed = require("../../Model/Speed/SpeedModel");
const Identification = require("../../Model/Identification/IdentificationModel");
const Radar = require("../../Model/Radar/RadarModel");

const radarRecordsController =
  new (class RadarRecordsController extends Status {
    listDistance = asyncHandler(async (req, res) => {
      const records = await Distance.find().sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    createDistance = asyncHandler(async (req, res) => {
      const record = await Distance.create(req.body || {});
      res.status(this.created).json(record);
    });

    listSpeed = asyncHandler(async (req, res) => {
      const records = await Speed.find().sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    createSpeed = asyncHandler(async (req, res) => {
      const record = await Speed.create(req.body || {});
      res.status(this.created).json(record);
    });

    listIdentification = asyncHandler(async (req, res) => {
      const records = await Identification.find().sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    createIdentification = asyncHandler(async (req, res) => {
      const record = await Identification.create(req.body || {});
      res.status(this.created).json(record);
    });

    listRadar = asyncHandler(async (req, res) => {
      const records = await Radar.find().sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    createRadar = asyncHandler(async (req, res) => {
      const record = await Radar.create(req.body || {});
      res.status(this.created).json(record);
    });
  })();

module.exports = {
  listDistance: radarRecordsController.listDistance,
  createDistance: radarRecordsController.createDistance,
  listSpeed: radarRecordsController.listSpeed,
  createSpeed: radarRecordsController.createSpeed,
  listIdentification: radarRecordsController.listIdentification,
  createIdentification: radarRecordsController.createIdentification,
  listRadar: radarRecordsController.listRadar,
  createRadar: radarRecordsController.createRadar,
};
