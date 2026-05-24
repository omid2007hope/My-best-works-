const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");
const speedService = require("../../Service/Radar/Speed");

const Speed = require("../../Model/Speed/SpeedModel");

const speedController = new (class SpeedController extends Status {
  // ── Speed ─────────────────────────────────────────────────────────────────

  listSpeed = asyncHandler(async (req, res) => {
    const filter = req.query.targetId ? { targetId: req.query.targetId } : {};
    const records = await Speed.find(filter).sort({ timestamp: -1 });
    res.status(this.success).json(records);
  });

  // Compute-first — derives speedKmh from a distanceLogs array (min 2 entries).
  computeSpeed = asyncHandler(async (req, res) => {
    const { distanceLogs, unit, targetId } = req.body || {};
    if (!Array.isArray(distanceLogs) || distanceLogs.length < 2) {
      return res.status(422).json({
        message: "distanceLogs array with at least 2 entries is required.",
      });
    }
    const record = await speedService.calculateAndPost(distanceLogs, unit, {
      targetId: targetId ?? null,
    });
    res.status(this.created).json(record);
  });
})();

module.exports = {
  listSpeed: speedController.listSpeed,
  createSpeed: speedController.createSpeed,
  computeSpeed: speedController.computeSpeed,
};
