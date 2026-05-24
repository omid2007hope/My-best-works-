const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");
const pipelineService = require("../../Service/Radar/Pipeline");

const pipelineController = new (class PipelineController extends Status {
  // POST /pipeline/process — accepts a radar burst payload and runs the full pipeline.
  process = asyncHandler(async (req, res) => {
    if (!req.body || !req.body.data_base64) {
      return res.status(422).json({
        message: "data_base64 is required in the request body.",
      });
    }

    const result = await pipelineService.processOneBurst(req.body, {
      topN: Number(req.query.topN) || 10,
    });

    res.status(this.created).json(result);
  });
})();

module.exports = {
  process: pipelineController.process,
};
