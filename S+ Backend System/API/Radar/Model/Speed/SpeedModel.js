const mongoose = require("mongoose");

const speedSchema = new mongoose.Schema(
  {
    targetId: {
      type: String,
      default: null,
    },
    speedKmh: {
      type: Number,
      required: true,
    },
    distanceDecreasePerMinuteMeters: {
      type: Number,
      required: true,
    },
    inputWindowCount: {
      type: Number,
      default: null,
    },
    timestampOrdered: {
      type: Boolean,
      default: false,
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
  mongoose.models.RadarSpeedRecord ||
  mongoose.model("RadarSpeedRecord", speedSchema);
