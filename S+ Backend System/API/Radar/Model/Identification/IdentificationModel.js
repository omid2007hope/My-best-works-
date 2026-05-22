const mongoose = require("mongoose");

const identificationSchema = new mongoose.Schema(
  {
    observation: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    candidates: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
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
