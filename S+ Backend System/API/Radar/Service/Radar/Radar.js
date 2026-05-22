const { EventEmitter } = require("events");

class RadarService extends EventEmitter {
  constructor() {
    super();
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

    if (this.mode === "native") {
      const burst = this.#runNative("readBurst");
      return {
        source: "native",
        burst,
      };
    }

    return this.#readMockBurst();
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
      read_bytes: totalBytes,
      data_base64: buffer.toString("base64"),
    };
  }
}

module.exports = new RadarService();
