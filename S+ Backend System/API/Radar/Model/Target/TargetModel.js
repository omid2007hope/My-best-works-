const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema(
  {
    targetId: {
      type: String,
      required: true,
      unique: true,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    detectionCount: {
      type: Number,
      default: 1,
    },
    lastDistanceMeters: {
      type: Number,
      default: null,
    },
    lastSpeedKmh: {
      type: Number,
      default: null,
    },
    lastIdentificationCandidates: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    versionKey: false,
  },
);

module.exports =
  mongoose.models.RadarTarget || mongoose.model("RadarTarget", targetSchema);
