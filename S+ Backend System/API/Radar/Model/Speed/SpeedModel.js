const mongoose = require("mongoose");

const speedSchema = new mongoose.Schema(
  {
    speedKmh: {
      type: Number,
      required: true,
    },
    distanceDecreasePerMinuteMeters: {
      type: Number,
      required: true,
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
