const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");
const TargetModel = require("../../Model/Target/TargetModel");

const targetController = new (class TargetController extends Status {
  // GET /targets — list all known target tracks.
  listTargets = asyncHandler(async (req, res) => {
    const targets = await TargetModel.find().sort({ lastSeen: -1 });
    res.status(this.success).json(targets);
  });

  // GET /targets/:targetId — fetch a single track summary.
  getTarget = asyncHandler(async (req, res) => {
    const target = await TargetModel.findOne({ targetId: req.params.targetId });
    if (!target) {
      return res.status(404).json({ message: "Target not found." });
    }
    res.status(this.success).json(target);
  });
})();

module.exports = {
  listTargets: targetController.listTargets,
  getTarget: targetController.getTarget,
};
