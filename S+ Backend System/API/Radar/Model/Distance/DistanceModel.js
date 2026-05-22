const mongoose = require("mongoose");

const distanceSchema = new mongoose.Schema(
  {
    distanceMeters: {
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
  mongoose.models.RadarDistanceRecord ||
  mongoose.model("RadarDistanceRecord", distanceSchema);
