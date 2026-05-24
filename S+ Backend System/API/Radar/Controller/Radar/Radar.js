const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");
const radarService = require("../../Service/Radar/Radar");
const pipelineService = require("../../Service/Radar/Pipeline");

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

    // Automatically run the full pipeline (distance → speed → identification per target).
    let pipeline = null;
    if (burst && burst.data_base64) {
      try {
        pipeline = await pipelineService.processOneBurst(burst, {
          topN: Number(req.query.topN) || 10,
        });
      } catch (err) {
        // Pipeline failure must never suppress the burst response.
        pipeline = { error: err.message };
      }
    }

    res.status(this.success).json({ burst, pipeline });
  });

  shutdown = asyncHandler(async (req, res) => {
    const status = await radarService.shutdown();
    res.status(this.success).json(status);
  });
})();

module.exports = {
  getStatus: radarController.getStatus,
  initialize: radarController.initialize,
  startStreaming: radarController.startStreaming,
  stopStreaming: radarController.stopStreaming,
  readBurst: radarController.readBurst,
  shutdown: radarController.shutdown,
};
