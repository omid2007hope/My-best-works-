const BaseService = require("../BaseService/index");
const DistanceModel = require("../../Model/Distance/DistanceModel");
const radarService = require("./Radar");

const SPEED_OF_LIGHT_MPS = 299792458;

module.exports = new (class DistanceService extends BaseService {
  constructor() {
    super();
    this.model = DistanceModel;
  }

  toFiniteNumber = (value) => {
    if (value == null || value === "") {
      return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  };

  calculateDistanceMeters = (waveBounceBackDurationSeconds) => {
    return (SPEED_OF_LIGHT_MPS * waveBounceBackDurationSeconds) / 2;
  };

  pickFirstFiniteNumber = (...values) => {
    for (const value of values) {
      const numericValue = this.toFiniteNumber(value);
      if (numericValue != null) {
        return numericValue;
      }
    }

    return null;
  };

  getPeakSampleIndex = (samples = []) => {
    if (!Array.isArray(samples) || !samples.length) {
      return null;
    }

    let peakIndex = 0;
    let peakValue = samples[0];

    for (let index = 1; index < samples.length; index += 1) {
      if (samples[index] > peakValue) {
        peakValue = samples[index];
        peakIndex = index;
      }
    }

    return peakIndex;
  };

  getValuesFromRadarBurst = (burstPayload = {}) => {
    const payload =
      burstPayload && typeof burstPayload.payload === "object"
        ? burstPayload.payload
        : {};
    const hasRawBurstData =
      typeof burstPayload?.data_base64 === "string" &&
      burstPayload.data_base64.length > 0;
    const burstValues = hasRawBurstData
      ? radarService.getBurstValues(burstPayload)
      : payload;

    const durationSeconds = this.pickFirstFiniteNumber(
      burstPayload.waveBounceBackDurationSeconds,
      payload.waveBounceBackDurationSeconds,
      burstPayload.waveBounceBackDuration,
      payload.waveBounceBackDuration,
      burstPayload.timeOfFlightSeconds,
      payload.timeOfFlightSeconds,
      burstPayload.waveBounceBackDurationMs != null
        ? Number(burstPayload.waveBounceBackDurationMs) / 1000
        : null,
      payload.waveBounceBackDurationMs != null
        ? Number(payload.waveBounceBackDurationMs) / 1000
        : null,
    );

    const directDistanceMeters = this.pickFirstFiniteNumber(
      burstPayload.distanceMeters,
      payload.distanceMeters,
      burstPayload.estimatedDistanceMeters,
      payload.estimatedDistanceMeters,
      burstPayload.rangeMeters,
      payload.rangeMeters,
    );

    const rangeResolutionMeters = this.pickFirstFiniteNumber(
      burstPayload.rangeResolutionMeters,
      payload.rangeResolutionMeters,
    );
    const peakSampleIndex = this.pickFirstFiniteNumber(
      burstPayload.peakSampleIndex,
      payload.peakSampleIndex,
      this.getPeakSampleIndex(burstValues.samples),
    );

    const estimatedFromResolution =
      rangeResolutionMeters != null && peakSampleIndex != null
        ? rangeResolutionMeters * peakSampleIndex
        : null;

    const hasFmcwRawInputs = hasRawBurstData;
    const fmcwInputs = {
      lower_freq_mhz: this.pickFirstFiniteNumber(
        burstPayload.lower_freq_mhz,
        payload.lower_freq_mhz,
        burstPayload.acquisition?.lower_freq_mhz,
        payload.physics?.lower_freq_mhz,
        burstPayload.physics?.lower_freq_mhz,
      ),
      upper_freq_mhz: this.pickFirstFiniteNumber(
        burstPayload.upper_freq_mhz,
        payload.upper_freq_mhz,
        burstPayload.acquisition?.upper_freq_mhz,
        payload.physics?.upper_freq_mhz,
        burstPayload.physics?.upper_freq_mhz,
      ),
      chirp_period_us: this.pickFirstFiniteNumber(
        burstPayload.chirp_period_us,
        payload.chirp_period_us,
        burstPayload.acquisition?.chirp_period_us,
        payload.physics?.chirp_period_us,
        burstPayload.physics?.chirp_period_us,
      ),
      adc_sampling_hz: this.pickFirstFiniteNumber(
        burstPayload.adc_sampling_hz,
        payload.adc_sampling_hz,
        burstPayload.acquisition?.adc_sampling_hz,
        payload.physics?.adc_sampling_hz,
        burstPayload.physics?.adc_sampling_hz,
      ),
      peakSampleIndex,
      samples_per_chirp: this.pickFirstFiniteNumber(
        burstPayload.format?.samples_per_chirp,
        payload.format?.samples_per_chirp,
        burstValues.format?.samples_per_chirp,
      ),
    };

    let estimatedFromFmcw = null;

    if (
      hasFmcwRawInputs &&
      durationSeconds == null &&
      directDistanceMeters == null
    ) {
      estimatedFromFmcw = this.calculateDistanceFromFmcwBurst(fmcwInputs);
    }

    const estimatedDistanceMeters =
      durationSeconds != null
        ? this.calculateDistanceMeters(durationSeconds)
        : (directDistanceMeters ??
          estimatedFromFmcw ??
          estimatedFromResolution);

    const distanceComputationSource =
      durationSeconds != null
        ? "time_of_flight"
        : directDistanceMeters != null
          ? "direct_distance"
          : estimatedFromFmcw != null
            ? "fmcw"
            : estimatedFromResolution != null
              ? "range_resolution"
              : null;

    return {
      ...burstValues,
      waveBounceBackDurationSeconds: durationSeconds,
      directDistanceMeters,
      rangeResolutionMeters,
      peakSampleIndex,
      fmcw: {
        ...fmcwInputs,
      },
      distanceComputationSource,
      estimatedDistanceMeters,
    };
  };

  calculateDistanceFromFmcwBurst = (fmcwInputs = {}) => {
    const requiredFields = [
      "lower_freq_mhz",
      "upper_freq_mhz",
      "chirp_period_us",
      "adc_sampling_hz",
      "peakSampleIndex",
      "samples_per_chirp",
    ];

    const missingFields = requiredFields.filter((field) => {
      return this.toFiniteNumber(fmcwInputs[field]) == null;
    });

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required burst physics fields for FMCW distance: ${missingFields.join(
          ", ",
        )}.`,
      );
    }

    const lowerFreqMhz = Number(fmcwInputs.lower_freq_mhz);
    const upperFreqMhz = Number(fmcwInputs.upper_freq_mhz);
    const chirpPeriodUs = Number(fmcwInputs.chirp_period_us);
    const adcSamplingHz = Number(fmcwInputs.adc_sampling_hz);
    const peakSampleIndex = Number(fmcwInputs.peakSampleIndex);
    const samplesPerChirp = Number(fmcwInputs.samples_per_chirp);

    if (upperFreqMhz <= lowerFreqMhz) {
      throw new Error("upper_freq_mhz must be greater than lower_freq_mhz.");
    }

    if (chirpPeriodUs <= 0 || adcSamplingHz <= 0 || samplesPerChirp <= 0) {
      throw new Error(
        "chirp_period_us, adc_sampling_hz, and samples_per_chirp must be greater than zero.",
      );
    }

    if (peakSampleIndex < 0) {
      throw new Error("peakSampleIndex must be non-negative.");
    }

    const bandwidthHz = (upperFreqMhz - lowerFreqMhz) * 1_000_000;
    const chirpPeriodSeconds = chirpPeriodUs / 1_000_000;
    const chirpSlopeHzPerSecond = bandwidthHz / chirpPeriodSeconds;
    const beatFrequencyHz = (peakSampleIndex * adcSamplingHz) / samplesPerChirp;

    return (SPEED_OF_LIGHT_MPS * beatFrequencyHz) / (2 * chirpSlopeHzPerSecond);
  };

  CalculateAndPost = async (waveBounceBackDurationOrBurst) => {
    let waveBounceBackDuration = waveBounceBackDurationOrBurst;

    try {
      if (
        waveBounceBackDurationOrBurst &&
        typeof waveBounceBackDurationOrBurst === "object"
      ) {
        const burstValues = this.getValuesFromRadarBurst(
          waveBounceBackDurationOrBurst,
        );

        if (Number.isFinite(burstValues.estimatedDistanceMeters)) {
          return this.simplePost({
            distanceMeters: burstValues.estimatedDistanceMeters,
            timestamp: new Date(),
          });
        }

        waveBounceBackDuration = burstValues.waveBounceBackDurationSeconds;
      }

      if (waveBounceBackDuration != null) {
        const actualDistanceMeters = this.calculateDistanceMeters(
          Number(waveBounceBackDuration),
        );
        console.log(
          `The actual distance to the target is ${actualDistanceMeters} meters based on the actual time of travel.`,
        );

        return this.simplePost({
          distanceMeters: actualDistanceMeters,
          timestamp: new Date(),
        });
      } else {
        throw new Error(
          "Distance inputs are missing. Provide one of: waveBounceBackDurationSeconds, distanceMeters/rangeMeters, or (rangeResolutionMeters + peakSampleIndex).",
        );
      }
    } catch (error) {
      console.error(error, "Could not calculate the distance to the target");
      throw error;
    }
  };
})();
