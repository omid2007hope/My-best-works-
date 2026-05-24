const mongoose = require("mongoose");

const distanceSchema = new mongoose.Schema(
  {
    targetId: {
      type: String,
      default: null,
    },
    distanceMeters: {
      type: Number,
      required: true,
    },
    computationSource: {
      type: String,
      default: null,
    },
    peakSampleIndex: {
      type: Number,
      default: null,
    },
    snrDb: {
      type: Number,
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
  mongoose.models.RadarDistanceRecord ||
  mongoose.model("RadarDistanceRecord", distanceSchema);
