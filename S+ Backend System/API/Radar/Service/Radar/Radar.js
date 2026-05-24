const BaseService = require("../BaseService/index");
const RadarModel = require("../../Model/Radar/RadarModel");

class RadarService extends BaseService {
  constructor() {
    super();
    this.model = RadarModel;
    this.native = this.#loadNativeModule();
    this.mode = this.native ? "native" : "mock";
    this.initialized = false;
    this.streaming = false;
    this.sensorId = null;
    this.sequenceNumber = 0;
    this.config = {
      chirpsPerBurst: 16,
      samplesPerChirp: 64,
      channelsCount: 2,
      bitsPerSample: 16,
    };
  }

  #loadNativeModule() {
    try {
      return require("../../build/Release/radar_addon.node");
    } catch (error) {
      return null;
    }
  }

  #assertNotImplemented(result) {
    if (!result || result.ok !== false || result.code !== "NOT_IMPLEMENTED") {
      return;
    }

    throw new Error(result.message || "Native Radar SDK is not linked yet");
  }

  #runNative(method, ...args) {
    if (!this.native || typeof this.native[method] !== "function") {
      throw new Error(`Native method ${method} is unavailable`);
    }

    const result = this.native[method](...args);
    this.#assertNotImplemented(result);
    return result;
  }

  #readSampleValue(buffer, offset, sampleBytes, isBigEndian) {
    if (sampleBytes === 1) {
      return buffer.readUInt8(offset);
    }

    if (sampleBytes === 2) {
      return isBigEndian
        ? buffer.readUInt16BE(offset)
        : buffer.readUInt16LE(offset);
    }

    if (sampleBytes === 4) {
      return isBigEndian
        ? buffer.readUInt32BE(offset)
        : buffer.readUInt32LE(offset);
    }

    throw new Error(`Unsupported bits_per_sample: ${sampleBytes * 8}`);
  }

  #toFiniteNumber(value) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  #pickFirstFiniteNumber(...values) {
    for (const value of values) {
      const numericValue = this.#toFiniteNumber(value);
      if (numericValue != null) {
        return numericValue;
      }
    }

    return null;
  }

  #getPeakSampleIndex(samples = []) {
    if (!Array.isArray(samples) || samples.length === 0) {
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
  }

  #buildPhysicsContext(rawBurst = {}, decodedBurst = {}) {
    const payload =
      rawBurst.payload && typeof rawBurst.payload === "object"
        ? rawBurst.payload
        : {};
    const config =
      rawBurst.config && typeof rawBurst.config === "object"
        ? rawBurst.config
        : this.config;

    const physics = {
      lower_freq_mhz: this.#pickFirstFiniteNumber(
        rawBurst.lower_freq_mhz,
        payload.lower_freq_mhz,
        config.lower_freq_mhz,
      ),
      upper_freq_mhz: this.#pickFirstFiniteNumber(
        rawBurst.upper_freq_mhz,
        payload.upper_freq_mhz,
        config.upper_freq_mhz,
      ),
      chirp_period_us: this.#pickFirstFiniteNumber(
        rawBurst.chirp_period_us,
        payload.chirp_period_us,
        config.chirp_period_us,
      ),
      adc_sampling_hz: this.#pickFirstFiniteNumber(
        rawBurst.adc_sampling_hz,
        payload.adc_sampling_hz,
        config.adc_sampling_hz,
      ),
      peakSampleIndex: this.#pickFirstFiniteNumber(
        rawBurst.peakSampleIndex,
        payload.peakSampleIndex,
        decodedBurst.peakSampleIndex,
        this.#getPeakSampleIndex(decodedBurst.samples),
      ),
      peakAmplitude: this.#pickFirstFiniteNumber(
        rawBurst.peakAmplitude,
        payload.peakAmplitude,
        decodedBurst.maxSample,
      ),
      noiseFloor: this.#pickFirstFiniteNumber(
        rawBurst.noiseFloor,
        payload.noiseFloor,
      ),
      snrDb: this.#pickFirstFiniteNumber(rawBurst.snrDb, payload.snrDb),
      rangeResolutionMeters: this.#pickFirstFiniteNumber(
        rawBurst.rangeResolutionMeters,
        payload.rangeResolutionMeters,
      ),
      txMask: rawBurst.txMask ?? payload.txMask ?? config.txMask ?? null,
      rxMask: rawBurst.rxMask ?? payload.rxMask ?? config.rxMask ?? null,
    };

    return physics;
  }

  getBurstValues = (burstPayload = {}) => {
    if (!burstPayload || typeof burstPayload !== "object") {
      throw new Error("Radar burst payload must be an object.");
    }

    const format = burstPayload.format || {};
    const bitsPerSample = Number(
      format.bits_per_sample ?? this.config.bitsPerSample,
    );
    const samplesPerChirp = Number(
      format.samples_per_chirp ?? this.config.samplesPerChirp,
    );
    const channelsCount = Number(
      format.channels_count ?? this.config.channelsCount,
    );
    const chirpsPerBurst = Number(
      format.chirps_per_burst ?? this.config.chirpsPerBurst,
    );
    const sampleBytes = Math.max(1, Math.ceil(bitsPerSample / 8));
    const isBigEndian = Boolean(format.is_big_endian);
    const isChannelsInterleaved = Boolean(format.is_channels_interlieved);
    const dataBase64 = String(burstPayload.data_base64 || "");
    const buffer = Buffer.from(dataBase64, "base64");

    if (!dataBase64) {
      throw new Error("Radar burst payload is missing data_base64.");
    }

    const samples = [];
    const sampleCount = Math.floor(buffer.length / sampleBytes);

    for (let index = 0; index < sampleCount; index += 1) {
      const offset = index * sampleBytes;
      samples.push(
        this.#readSampleValue(buffer, offset, sampleBytes, isBigEndian),
      );
    }

    const expectedSampleCount =
      chirpsPerBurst * samplesPerChirp * channelsCount;
    const samplesByChirp = [];

    for (let chirpIndex = 0; chirpIndex < chirpsPerBurst; chirpIndex += 1) {
      const chirpStart = chirpIndex * samplesPerChirp * channelsCount;
      const chirpSlice = samples.slice(
        chirpStart,
        chirpStart + samplesPerChirp * channelsCount,
      );
      const channels = [];

      for (
        let channelIndex = 0;
        channelIndex < channelsCount;
        channelIndex += 1
      ) {
        const channelSamples = [];

        for (
          let sampleIndex = 0;
          sampleIndex < samplesPerChirp;
          sampleIndex += 1
        ) {
          const sourceIndex = isChannelsInterleaved
            ? sampleIndex * channelsCount + channelIndex
            : channelIndex * samplesPerChirp + sampleIndex;

          channelSamples.push(chirpSlice[sourceIndex]);
        }

        const sampleTotal = channelSamples.reduce(
          (sum, value) => sum + value,
          0,
        );

        channels.push({
          channelIndex,
          samples: channelSamples,
          minSample: Math.min(...channelSamples),
          maxSample: Math.max(...channelSamples),
          averageSample: sampleTotal / channelSamples.length,
        });
      }

      samplesByChirp.push({
        chirpIndex,
        channels,
      });
    }

    const sampleTotal = samples.reduce((sum, value) => sum + value, 0);
    const maxSampleValue = Number(format.max_sample_value ?? 0);

    return {
      source: burstPayload.source || this.mode,
      format,
      readBytes: Number(burstPayload.read_bytes ?? buffer.length),
      decodedBytes: buffer.length,
      sampleBytes,
      sampleCount,
      expectedSampleCount,
      isSampleCountValid: sampleCount === expectedSampleCount,
      isReadLengthValid:
        Number(burstPayload.read_bytes ?? buffer.length) === buffer.length,
      samples,
      samplesByChirp,
      firstSample: samples[0] ?? null,
      lastSample: samples.at(-1) ?? null,
      minSample: samples.length ? Math.min(...samples) : null,
      maxSample: samples.length ? Math.max(...samples) : null,
      averageSample: samples.length ? sampleTotal / samples.length : null,
      normalizedPeakRatio:
        samples.length && maxSampleValue > 0
          ? Math.max(...samples) / maxSampleValue
          : null,
    };
  };

  initialize = async ({
    sensorId = 0,
    countryCode = "US",
    config = {},
  } = {}) => {
    this.sensorId = Number(sensorId);
    this.config = {
      ...this.config,
      ...config,
    };

    if (this.mode === "native") {
      this.#runNative("init");
      this.#runNative("create", this.sensorId);
      this.#runNative("setCountryCode", countryCode);
      this.#runNative("turnOn");
    }

    this.initialized = true;
    return this.getStatus();
  };

  startStreaming = async (initializeOptions = {}) => {
    if (!this.initialized) {
      await this.initialize(initializeOptions);
    }

    if (this.mode === "native") {
      this.#runNative("startDataStreaming");
    }

    this.streaming = true;
    return this.getStatus();
  };

  stopStreaming = async () => {
    if (!this.streaming) {
      return this.getStatus();
    }

    if (this.mode === "native") {
      this.#runNative("stopDataStreaming");
    }

    this.streaming = false;
    return this.getStatus();
  };

  shutdown = async () => {
    if (this.mode === "native") {
      this.#runNative("turnOff");
      this.#runNative("destroy");
      this.#runNative("deinit");
    }

    this.initialized = false;
    this.streaming = false;
    return this.getStatus();
  };

  getStatus = () => {
    return {
      mode: this.mode,
      initialized: this.initialized,
      streaming: this.streaming,
      sensorId: this.sensorId,
      config: this.config,
    };
  };

  readBurst = async () => {
    if (!this.streaming) {
      throw new Error("Radar stream is not active");
    }

    const rawBurst =
      this.mode === "native"
        ? {
            source: "native",
            ...(this.#runNative("readBurst") || {}),
          }
        : this.#readMockBurst();

    if (!rawBurst.data_base64) {
      return rawBurst;
    }

    const decodedBurst = this.getBurstValues(rawBurst);
    const physics = this.#buildPhysicsContext(rawBurst, decodedBurst);

    const acquisition = {
      chirp_period_us: physics.chirp_period_us,
      lower_freq_mhz: physics.lower_freq_mhz,
      upper_freq_mhz: physics.upper_freq_mhz,
      adc_sampling_hz: physics.adc_sampling_hz,
      txMask: physics.txMask,
      rxMask: physics.rxMask,
    };

    return this.simplePost({
      event: "burst",
      source: rawBurst.source || this.mode,
      mode: this.mode,
      initialized: this.initialized,
      streaming: this.streaming,
      sensorId: this.sensorId,
      config: this.config,
      acquisition,
      physics,
      format: rawBurst.format,
      read_bytes: rawBurst.read_bytes,
      data_base64: rawBurst.data_base64,
      payload: {
        ...decodedBurst,
        physics,
      },
      timestamp: new Date(rawBurst.format?.timestamp_ms ?? Date.now()),
    });
  };

  #readMockBurst() {
    this.sequenceNumber += 1;
    const { chirpsPerBurst, samplesPerChirp, channelsCount, bitsPerSample } =
      this.config;

    const sampleBytes = bitsPerSample / 8;
    const totalSamples = chirpsPerBurst * samplesPerChirp * channelsCount;
    const totalBytes = totalSamples * sampleBytes;
    const buffer = Buffer.alloc(totalBytes);

    for (let i = 0; i < totalSamples; i += 1) {
      const value = (this.sequenceNumber + i) % 4096;
      buffer.writeUInt16LE(value, i * sampleBytes);
    }

    const lowerFreqMhz = 77000;
    const upperFreqMhz = 77200;
    const chirpPeriodUs = 50;
    const adcSamplingHz = 2_000_000;
    const peakSampleIndex = Math.floor(samplesPerChirp / 4);

    return {
      source: "mock",
      format: {
        sequence_number: this.sequenceNumber,
        max_sample_value: 4095,
        bits_per_sample: bitsPerSample,
        samples_per_chirp: samplesPerChirp,
        channels_count: channelsCount,
        chirps_per_burst: chirpsPerBurst,
        config_id: 0,
        is_channels_interlieved: true,
        is_big_endian: false,
        burst_data_crc: 0,
        timestamp_ms: Date.now(),
      },
      lower_freq_mhz: lowerFreqMhz,
      upper_freq_mhz: upperFreqMhz,
      chirp_period_us: chirpPeriodUs,
      adc_sampling_hz: adcSamplingHz,
      peakSampleIndex,
      read_bytes: totalBytes,
      data_base64: buffer.toString("base64"),
    };
  }
}

module.exports = new RadarService();
