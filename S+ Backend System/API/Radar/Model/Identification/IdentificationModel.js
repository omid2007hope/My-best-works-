const mongoose = require("mongoose");

const identificationSchema = new mongoose.Schema(
  {
    targetId: {
      type: String,
      default: null,
    },
    observation: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    candidates: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    computationSource: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

module.exports =
  mongoose.models.RadarIdentificationRecord ||
  mongoose.model("RadarIdentificationRecord", identificationSchema);
