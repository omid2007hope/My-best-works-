export const speedOfLight = 299792458; // in meters per second

export const waveBounceBackDurationSeconds = 20; // example value for Exp(20) seconds
export const waveBounceBackDurationMs = 20000; // equivalent in milliseconds
export const timeOfFlightSeconds = 20; // alternate time-of-flight field name

export const distanceMeters = 2997924580; // direct distance estimate
export const estimatedDistanceMeters = 2997924580; // fallback direct estimate
export const rangeMeters = 2997924580; // same physical range value
export const rangeResolutionMeters = 10; // example range resolution
export const peakSampleIndex = 5; // example peak sample index

export const lower_freq_mhz = 77000;
export const upper_freq_mhz = 77200;
export const chirp_period_us = 50;
export const adc_sampling_hz = 2000000;
export const samplesPerChirp = 64;

export const burstFormat = {
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

export const rawBurstBase64 = "AAECAwQFBgc="; // base64 of 8 arbitrary bytes

export const fakeBurstPayload = {
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
