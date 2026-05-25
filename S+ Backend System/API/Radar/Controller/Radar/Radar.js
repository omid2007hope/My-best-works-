const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");
const radarService = require("../../Service/Radar/Radar");
const Radar = require("../../Model/Radar/RadarModel");

const radarController = new (class RadarController extends Status {
  getStatus = asyncHandler(async (req, res) => {
    res.status(this.success).json(radarService.getStatus());
  });

  initialize = asyncHandler(async (req, res) => {
    const status = await radarService.initialize(req.body || {});
    res.status(this.success).json(status);
  });

  startStreaming = asyncHandler(async (req, res) => {
    const status = await radarService.startStreaming(req.body || {});
    res.status(this.success).json(status);
  });

  stopStreaming = asyncHandler(async (req, res) => {
    const status = await radarService.stopStreaming();
    res.status(this.success).json(status);
  });

  readBurst = asyncHandler(async (req, res) => {
    const burst = await radarService.readBurst();
    res.status(this.success).json({ burst });
  });

  shutdown = asyncHandler(async (req, res) => {
    const status = await radarService.shutdown();
    res.status(this.success).json(status);
  });

  // ── Radar ─────────────────────────────────────────────────────────────────

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
  getStatus: radarController.getStatus,
  initialize: radarController.initialize,
  startStreaming: radarController.startStreaming,
  stopStreaming: radarController.stopStreaming,
  readBurst: radarController.readBurst,
  shutdown: radarController.shutdown,
  listRadar: radarController.listRadar,
  createRadar: radarController.createRadar,
};
