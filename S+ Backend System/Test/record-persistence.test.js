const test = require("node:test");
const assert = require("node:assert/strict");

const RadarModel = require("../API/Radar/Model/Radar/RadarModel");

test("radar model accepts explicit acquisition and physics fields", () => {
  const doc = new RadarModel({
    event: "burst",
    source: "mock",
    mode: "mock",
    initialized: true,
    streaming: true,
    sensorId: 7,
    config: {
      chirpsPerBurst: 16,
      samplesPerChirp: 64,
      channelsCount: 2,
      bitsPerSample: 16,
    },
    acquisition: {
      chirp_period_us: 50,
      lower_freq_mhz: 77000,
      upper_freq_mhz: 77200,
      adc_sampling_hz: 2000000,
      txMask: 3,
      rxMask: 3,
    },
    physics: {
      peakSampleIndex: 8,
      peakAmplitude: 2048,
      noiseFloor: 128,
      snrDb: 22.5,
      rangeResolutionMeters: 0.75,
      lower_freq_mhz: 77000,
      upper_freq_mhz: 77200,
      chirp_period_us: 50,
      adc_sampling_hz: 2000000,
    },
    format: {
      sequence_number: 1,
      max_sample_value: 4095,
      bits_per_sample: 16,
      samples_per_chirp: 64,
      channels_count: 2,
      chirps_per_burst: 16,
      config_id: 0,
      is_channels_interlieved: true,
      is_big_endian: false,
      burst_data_crc: 0,
      timestamp_ms: Date.now(),
    },
    read_bytes: 8,
    data_base64: Buffer.alloc(8).toString("base64"),
    payload: {
      sampleCount: 4,
    },
  });

  const validationError = doc.validateSync();

  assert.equal(validationError, undefined);
  assert.equal(doc.acquisition.chirp_period_us, 50);
  assert.equal(doc.physics.peakSampleIndex, 8);
});
