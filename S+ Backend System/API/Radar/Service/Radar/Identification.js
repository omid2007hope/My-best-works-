const planeCatalog = require("../../Data/Plane");

function toFiniteNumber(value) {
  if (value == null || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function resolveDurationHours(observation = {}) {
  const directHours = toFiniteNumber(observation.durationHours);
  if (directHours != null) {
    return directHours;
  }

  const durationSeconds = toFiniteNumber(observation.durationSeconds);
  if (durationSeconds != null) {
    return durationSeconds / 3600;
  }

  const durationMinutes = toFiniteNumber(observation.durationMinutes);
  if (durationMinutes != null) {
    return durationMinutes / 60;
  }

  return null;
}

function calculateSpeedScore(plane, speedKmh) {
  const observedSpeed = toFiniteNumber(speedKmh);
  if (observedSpeed == null) {
    return 0;
  }

  const referenceSpeeds = [
    toFiniteNumber(plane.cruiseSpeedKmh),
    toFiniteNumber(plane.maxSpeedKmh),
    toFiniteNumber(plane.typicalInterceptSpeedKmh),
  ].filter((value) => value != null);

  if (!referenceSpeeds.length) {
    return 0;
  }

  const minDelta = referenceSpeeds.reduce((minimum, reference) => {
    return Math.min(minimum, Math.abs(reference - observedSpeed));
  }, Number.POSITIVE_INFINITY);
  const baseTolerance = Math.max(observedSpeed * 0.2, 120);
  let score = Math.max(0, 1 - minDelta / baseTolerance);

  const envelope = plane.speedEnvelope || {};
  const envelopeMin = toFiniteNumber(envelope.minKmh);
  const envelopeMax = toFiniteNumber(envelope.maxKmh);

  if (
    envelopeMin != null &&
    envelopeMax != null &&
    observedSpeed >= envelopeMin &&
    observedSpeed <= envelopeMax
  ) {
    score = Math.max(score, 0.95);
  }

  return score;
}

function calculateDurationScore(plane, durationHours) {
  const observedDuration = toFiniteNumber(durationHours);
  const sustainedDuration = toFiniteNumber(plane.sustainedHighSpeedHours);

  if (observedDuration == null || sustainedDuration == null) {
    return 0.5;
  }

  // A short observation window should not strongly penalize long-endurance airframes.
  if (observedDuration <= 0.25) {
    return 1;
  }

  const durationDelta = Math.abs(sustainedDuration - observedDuration);
  const tolerance = Math.max(sustainedDuration * 0.6, 0.2);

  return Math.max(0, 1 - durationDelta / tolerance);
}

function calculateTrajectoryScore(plane, trajectoryProfile) {
  if (!trajectoryProfile) {
    return 1;
  }

  if (plane.trajectoryProfile === trajectoryProfile) {
    return 1;
  }

  if (
    Array.isArray(plane.trajectoryAliases) &&
    plane.trajectoryAliases.includes(trajectoryProfile)
  ) {
    return 0.85;
  }

  return 0;
}

function identifyPlanes(observation, planes = planeCatalog, topN = 5) {
  if (!observation || !Array.isArray(planes)) {
    return [];
  }

  const { speedKmh, trajectoryProfile } = observation;
  const durationHours = resolveDurationHours(observation);

  const ranked = planes
    .map((plane) => {
      const speedScore = calculateSpeedScore(plane, speedKmh);
      const durationScore = calculateDurationScore(plane, durationHours);
      const trajectoryScore = calculateTrajectoryScore(
        plane,
        trajectoryProfile,
      );

      let confidence =
        speedScore * 0.75 + durationScore * 0.15 + trajectoryScore * 0.1;

      if (
        speedScore >= 0.95 &&
        durationScore >= 0.95 &&
        trajectoryScore >= 0.95
      ) {
        confidence = 1;
      }

      const speedDelta = Math.abs(Number(plane.maxSpeedKmh) - Number(speedKmh));

      return {
        ...plane,
        speedDeltaKmh: speedDelta,
        durationHoursObserved: durationHours,
        scoreBreakdown: {
          speed: Number((speedScore * 100).toFixed(1)),
          duration: Number((durationScore * 100).toFixed(1)),
          trajectory: Number((trajectoryScore * 100).toFixed(1)),
        },
        confidence: Number((confidence * 100).toFixed(1)),
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  return ranked.slice(0, topN);
}

function identifyFromRadarSpeed(
  speedKmh,
  durationHours,
  trajectoryProfile,
  topN = 5,
) {
  return identifyPlanes(
    {
      speedKmh,
      durationHours,
      trajectoryProfile,
    },
    planeCatalog,
    topN,
  );
}

module.exports = {
  identifyPlanes,
  identifyFromRadarSpeed,
  planeCatalog,
};
