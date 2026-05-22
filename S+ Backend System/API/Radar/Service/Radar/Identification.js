const planeCatalog = require("../../Data/Plane");

function identifyPlanes(observation, planes = planeCatalog, topN = 5) {
  if (!observation || !Array.isArray(planes)) {
    return [];
  }

  const { speedKmh, durationHours, trajectoryProfile } = observation;
  const speedReference = Math.max(Math.abs(Number(speedKmh) || 0), 1);
  const durationReference = Math.max(Math.abs(Number(durationHours) || 0), 1);

  const ranked = planes
    .map((plane) => {
      const speedDelta = Math.abs(Number(plane.maxSpeedKmh) - Number(speedKmh));
      const speedScore = Math.max(0, 1 - speedDelta / speedReference);

      const durationDelta = Math.abs(
        Number(plane.sustainedHighSpeedHours) - Number(durationHours),
      );
      const durationScore = Math.max(0, 1 - durationDelta / durationReference);

      const trajectoryScore =
        plane.trajectoryProfile === trajectoryProfile ? 1 : 0;

      const confidence =
        speedScore * 0.7 + durationScore * 0.2 + trajectoryScore * 0.1;

      return {
        ...plane,
        speedDeltaKmh: speedDelta,
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
