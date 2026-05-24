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

    const canUseFmcw =
      fmcwInputs.lower_freq_mhz != null &&
      fmcwInputs.upper_freq_mhz != null &&
      fmcwInputs.chirp_period_us != null &&
      fmcwInputs.adc_sampling_hz != null &&
      fmcwInputs.peakSampleIndex != null &&
      fmcwInputs.samples_per_chirp != null;

    if (canUseFmcw && durationSeconds == null && directDistanceMeters == null) {
      try {
        estimatedFromFmcw = this.calculateDistanceFromFmcwBurst(fmcwInputs);
      } catch (_) {
        estimatedFromFmcw = null;
      }
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

  // Find local maxima in a flat sample array above `threshold` with `minSpacing` sample separation.
  extractPeaks = (samples = [], options = {}) => {
    const threshold = options.threshold ?? 200;
    const minSpacing = options.minSpacing ?? 3;
    const peaks = [];

    for (let i = 1; i < samples.length - 1; i += 1) {
      const v = samples[i];
      if (v < threshold) continue;
      if (v <= samples[i - 1] || v < samples[i + 1]) continue;

      if (peaks.length > 0 && i - peaks[peaks.length - 1].index < minSpacing) {
        if (v > peaks[peaks.length - 1].amplitude) {
          peaks[peaks.length - 1] = { index: i, amplitude: v };
        }
        continue;
      }

      peaks.push({ index: i, amplitude: v });
    }

    return peaks.sort((a, b) => b.amplitude - a.amplitude);
  };

  // Derive a distance record per detected peak in a burst.
  // Returns an array of { targetIndex, peakSampleIndex, peakAmplitude, distanceMeters, computationSource, snrDb }.
  getMultiTargetDistances = (burstPayload = {}, options = {}) => {
    const payload =
      burstPayload.payload && typeof burstPayload.payload === "object"
        ? burstPayload.payload
        : {};
    const hasRawBurstData =
      typeof burstPayload.data_base64 === "string" &&
      burstPayload.data_base64.length > 0;

    if (!hasRawBurstData) {
      const single = this.getValuesFromRadarBurst(burstPayload);
      if (single.estimatedDistanceMeters != null) {
        return [
          {
            targetIndex: 0,
            peakSampleIndex: single.peakSampleIndex,
            peakAmplitude: null,
            distanceMeters: single.estimatedDistanceMeters,
            computationSource: single.distanceComputationSource,
            snrDb: null,
          },
        ];
      }
      return [];
    }

    const burstValues = radarService.getBurstValues(burstPayload);

    // Build a coherently-averaged range profile by summing ch0 across all
    // chirps and dividing by chirp count. This collapses the full interleaved
    // buffer (chirps × samples × channels) into a single 64-bin array where
    // each index IS the beat-frequency bin — suitable for calculateDistanceFromFmcwBurst.
    const firstChirpCh0 =
      burstValues.samplesByChirp[0]?.channels[0]?.samples ?? [];
    const binsPerChirp = firstChirpCh0.length;
    const rangeProfile = new Array(binsPerChirp).fill(0);
    for (const chirp of burstValues.samplesByChirp) {
      const ch0 = chirp.channels[0]?.samples ?? [];
      for (let i = 0; i < binsPerChirp; i += 1) {
        rangeProfile[i] += ch0[i] ?? 0;
      }
    }
    const chirpCount = burstValues.samplesByChirp.length || 1;
    for (let i = 0; i < binsPerChirp; i += 1) {
      rangeProfile[i] = Math.round(rangeProfile[i] / chirpCount);
    }

    const topN = options.topN ?? 10;
    const peaks = this.extractPeaks(rangeProfile, options).slice(0, topN);
    if (!peaks.length) return [];

    const lowerFreqMhz = this.pickFirstFiniteNumber(
      burstPayload.lower_freq_mhz,
      payload.lower_freq_mhz,
      burstPayload.acquisition?.lower_freq_mhz,
      burstPayload.physics?.lower_freq_mhz,
    );
    const upperFreqMhz = this.pickFirstFiniteNumber(
      burstPayload.upper_freq_mhz,
      payload.upper_freq_mhz,
      burstPayload.acquisition?.upper_freq_mhz,
      burstPayload.physics?.upper_freq_mhz,
    );
    const chirpPeriodUs = this.pickFirstFiniteNumber(
      burstPayload.chirp_period_us,
      payload.chirp_period_us,
      burstPayload.acquisition?.chirp_period_us,
      burstPayload.physics?.chirp_period_us,
    );
    const adcSamplingHz = this.pickFirstFiniteNumber(
      burstPayload.adc_sampling_hz,
      payload.adc_sampling_hz,
      burstPayload.acquisition?.adc_sampling_hz,
      burstPayload.physics?.adc_sampling_hz,
    );
    const samplesPerChirp =
      this.pickFirstFiniteNumber(
        burstPayload.format?.samples_per_chirp,
        payload.format?.samples_per_chirp,
        burstValues.format?.samples_per_chirp,
      ) ?? binsPerChirp;

    const canUseFmcw =
      lowerFreqMhz != null &&
      upperFreqMhz != null &&
      chirpPeriodUs != null &&
      adcSamplingHz != null &&
      samplesPerChirp != null;

    const noiseFloor = this.pickFirstFiniteNumber(
      burstPayload.noiseFloor,
      burstPayload.physics?.noiseFloor,
      payload.physics?.noiseFloor,
    );

    return peaks.map((peak, idx) => {
      let distanceMeters = null;
      let computationSource = null;

      if (canUseFmcw) {
        try {
          distanceMeters = this.calculateDistanceFromFmcwBurst({
            lower_freq_mhz: lowerFreqMhz,
            upper_freq_mhz: upperFreqMhz,
            chirp_period_us: chirpPeriodUs,
            adc_sampling_hz: adcSamplingHz,
            peakSampleIndex: peak.index,
            samples_per_chirp: samplesPerChirp,
          });
          computationSource = "fmcw";
        } catch (_) {
          distanceMeters = null;
        }
      }

      const snrDb =
        noiseFloor != null && noiseFloor > 0
          ? Number((20 * Math.log10(peak.amplitude / noiseFloor)).toFixed(1))
          : null;

      return {
        targetIndex: idx,
        peakSampleIndex: peak.index,
        peakAmplitude: peak.amplitude,
        distanceMeters,
        computationSource,
        snrDb,
      };
    });
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
