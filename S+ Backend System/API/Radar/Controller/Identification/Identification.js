const asyncHandler = require("../../../../Tools/Handler/Async");
const Status = require("../../../../Controller/Share/Status");
const { identifyPlanes } = require("../../Service/Radar/Identification");

const Identification = require("../../Model/Identification/IdentificationModel");

const identificationController =
  new (class IdentificationController extends Status {
    // ── Identification ────────────────────────────────────────────────────────

    listIdentification = asyncHandler(async (req, res) => {
      const filter = req.query.targetId ? { targetId: req.query.targetId } : {};
      const records = await Identification.find(filter).sort({ timestamp: -1 });
      res.status(this.success).json(records);
    });

    // Compute-first — runs identification scoring and persists top-N candidates.
    computeIdentification = asyncHandler(async (req, res) => {
      const { speedKmh, durationHours, trajectoryProfile, topN, targetId } =
        req.body || {};
      if (speedKmh == null) {
        return res.status(422).json({ message: "speedKmh is required." });
      }
      const observation = { speedKmh, durationHours, trajectoryProfile };
      const candidates = identifyPlanes(observation, undefined, topN ?? 10);
      const record = await Identification.create({
        targetId: targetId ?? null,
        observation,
        candidates,
        computationSource: "computed",
        timestamp: new Date(),
      });
      res.status(this.created).json(record);
    });
  })();

module.exports = {
  listIdentification: identificationController.listIdentification,
  createIdentification: identificationController.createIdentification,
  computeIdentification: identificationController.computeIdentification,
};
