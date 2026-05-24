const mongoose = require("mongoose");

const radarFormatSchema = new mongoose.Schema(
  {
    sequence_number: {
      type: Number,
      required: true,
    },
    max_sample_value: {
      type: Number,
      required: true,
    },
    bits_per_sample: {
      type: Number,
      required: true,
    },
    samples_per_chirp: {
      type: Number,
      required: true,
    },
    channels_count: {
      type: Number,
      required: true,
    },
    chirps_per_burst: {
      type: Number,
      required: true,
    },
    config_id: {
      type: Number,
      default: 0,
    },
    is_channels_interlieved: {
      type: Boolean,
      default: true,
    },
    is_big_endian: {
      type: Boolean,
      default: false,
    },
    burst_data_crc: {
      type: Number,
      default: 0,
    },
    timestamp_ms: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const radarSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      default: "mock",
    },
    format: {
      type: radarFormatSchema,
      required: true,
    },
    read_bytes: {
      type: Number,
      required: true,
    },
    data_base64: {
      type: String,
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
  mongoose.models.RadarBurstRecord ||
  mongoose.model("RadarBurstRecord", radarSchema);
