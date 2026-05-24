const test = require("node:test");
const assert = require("node:assert/strict");

const distanceService = require("../API/Radar/Service/Radar/Distance");

const buildRawBurst = (overrides = {}) => {
  return {
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
    ...overrides,
  };
};

test("distance service computes time-of-flight distance when available", () => {
  const burstValues = distanceService.getValuesFromRadarBurst({
    waveBounceBackDurationSeconds: 0.000001,
  });

  const expected = (299792458 * 0.000001) / 2;
  assert.ok(Math.abs(burstValues.estimatedDistanceMeters - expected) < 1e-9);
  assert.equal(burstValues.distanceComputationSource, "time_of_flight");
});

test("distance service computes direct distance fallback", () => {
  const burstValues = distanceService.getValuesFromRadarBurst({
    distanceMeters: 1234.5,
  });

  assert.equal(burstValues.estimatedDistanceMeters, 1234.5);
  assert.equal(burstValues.distanceComputationSource, "direct_distance");
});

test("distance service computes FMCW distance from required metadata", () => {
  const burst = buildRawBurst({
    lower_freq_mhz: 77000,
    upper_freq_mhz: 77200,
    chirp_period_us: 50,
    adc_sampling_hz: 2000000,
    peakSampleIndex: 8,
  });

  const burstValues = distanceService.getValuesFromRadarBurst(burst);

  assert.equal(burstValues.distanceComputationSource, "fmcw");
  assert.ok(Number.isFinite(burstValues.estimatedDistanceMeters));
  assert.ok(burstValues.estimatedDistanceMeters > 0);
});

test("distance service fails early when FMCW required fields are missing", () => {
  const burst = buildRawBurst({
    lower_freq_mhz: 77000,
    upper_freq_mhz: 77200,
    chirp_period_us: 50,
    peakSampleIndex: 8,
  });

  assert.throws(() => {
    distanceService.getValuesFromRadarBurst(burst);
  }, /Missing required burst physics fields for FMCW distance/);
});
