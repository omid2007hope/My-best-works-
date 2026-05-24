const speedOfLight = 299792458; // in meters per second

const waveBounceBackDurationSeconds = 20; // example value for Exp(20) seconds
const waveBounceBackDurationMs = 20000; // equivalent in milliseconds
const timeOfFlightSeconds = 20; // alternate time-of-flight field name

const distanceMeters = 2997924580; // direct distance estimate
const estimatedDistanceMeters = 2997924580; // fallback direct estimate
const rangeMeters = 2997924580; // same physical range value
const rangeResolutionMeters = 10; // example range resolution
const peakSampleIndex = 5; // example peak sample index

const lower_freq_mhz = 77000;
const upper_freq_mhz = 77200;
const chirp_period_us = 50;
const adc_sampling_hz = 2000000;
const samplesPerChirp = 64;

const burstFormat = {
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
  timestamp_ms: 0,
};

const rawBurstBase64 = "AAECAwQFBgc="; // base64 of 8 arbitrary bytes

const fakeBurstPayload = {
  waveBounceBackDurationSeconds,
  waveBounceBackDurationMs,
  timeOfFlightSeconds,
  distanceMeters,
  estimatedDistanceMeters,
  rangeMeters,
  rangeResolutionMeters,
  peakSampleIndex,
  lower_freq_mhz,
  upper_freq_mhz,
  chirp_period_us,
  adc_sampling_hz,
  format: burstFormat,
  data_base64: rawBurstBase64,
  read_bytes: 8,
};

module.exports = {
  speedOfLight,
  waveBounceBackDurationSeconds,
  waveBounceBackDurationMs,
  timeOfFlightSeconds,
  distanceMeters,
  estimatedDistanceMeters,
  rangeMeters,
  rangeResolutionMeters,
  peakSampleIndex,
  lower_freq_mhz,
  upper_freq_mhz,
  chirp_period_us,
  adc_sampling_hz,
  samplesPerChirp,
  burstFormat,
  rawBurstBase64,
  fakeBurstPayload,
};
