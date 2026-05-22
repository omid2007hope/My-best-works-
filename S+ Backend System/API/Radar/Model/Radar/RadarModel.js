const mongoose = require("mongoose");

const radarSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
    },
    initialized: {
      type: Boolean,
      default: false,
    },
    streaming: {
      type: Boolean,
      default: false,
    },
    sensorId: {
      type: Number,
      default: null,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
  mongoose.models.RadarStatusRecord ||
  mongoose.model("RadarStatusRecord", radarSchema);
