const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");
const distanceService = require("../../Service/Radar/Distance");

const Distance = require("../../Model/Distance/DistanceModel");

const distanceController = new (class DistanceController extends Status {
  // ── Distance ──────────────────────────────────────────────────────────────

  listDistance = asyncHandler(async (req, res) => {
    const filter = req.query.targetId ? { targetId: req.query.targetId } : {};
    const records = await Distance.find(filter).sort({ timestamp: -1 });
    res.status(this.success).json(records);
  });

  // Compute-first — calculates distanceMeters from burst payload or TOF field.
  computeDistance = asyncHandler(async (req, res) => {
    const record = await distanceService.CalculateAndPost(req.body);
    res.status(this.created).json(record);
  });
})();

module.exports = {
  listDistance: distanceController.listDistance,
  createDistance: distanceController.createDistance,
  computeDistance: distanceController.computeDistance,
};
