const speedOfLight = 299792458; // in meters per second
const fraquency = 1000000000; // in Hz for example
const actualFrequency = null; // in Hz for example

// !  Calculate the wave length of the radar signal using the formula: wavelength = speed of light / frequency

if (actualFrequency !== null) {
  const actualWavelength = speedOfLight / actualFrequency; // in meters
  console.log(
    `The actual wavelength of the radar signal is ${actualWavelength} meters.`,
  );
} else if (actualFrequency === null) {
  const wavelength = speedOfLight / fraquency; // in meters
  console.log(
    `The wavelength of the radar signal is ${wavelength} meters for test.`,
  );
}

const time = 15; // in seconds for the radar signal to travel to the target and back for example
const actualTime = null; // in seconds for the radar signal to travel to the target and back for example

if (actualTime !== null) {
  const actualDistance = (speedOfLight * actualTime) / 2; // in meters
  console.log(
    `The actual distance to the target is ${actualDistance} meters based on the actual time of travel.`,
  );
} else if (actualTime === null) {
  const distance = (speedOfLight * time) / 2; // in meters
  console.log(
    `The distance to the target is ${distance} meters based on the time of travel for test.`,
  );
}

// ! Normalize all speed units through km/h so matching results stay consistent.
const SPEED_UNITS = {
  KMH: "km/h",
  MPS: "m/s",
  MPM: "m/min",
  KNOT: "knot",
  MPH: "mph",
};

function toKmh(value, unit) {
  switch (unit) {
    case SPEED_UNITS.KMH:
      return value;
    case SPEED_UNITS.MPS:
      return value * 3.6;
    case SPEED_UNITS.MPM:
      return (value * 60) / 1000;
    case SPEED_UNITS.KNOT:
      return value * 1.852;
    case SPEED_UNITS.MPH:
      return value * 1.60934;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}

// ! get Radar burst once per minute and calculate relative target speed.
const distanceLogs = [
  { id: 1, time: "12:00", distanceMeters: 1000 },
  { id: 2, time: "12:01", distanceMeters: 900 },
  { id: 3, time: "12:02", distanceMeters: 790 },
  { id: 4, time: "12:03", distanceMeters: 680 },
];

const distanceDecrementsMetersPerMinute = [];

distanceLogs.forEach((log, index) => {
  if (index > 0) {
    const decrement =
      distanceLogs[index - 1].distanceMeters - log.distanceMeters;
    distanceDecrementsMetersPerMinute.push(decrement);
  }
});

const avgDistanceDecreasePerMinute =
  distanceDecrementsMetersPerMinute.reduce((sum, val) => sum + val, 0) /
  distanceDecrementsMetersPerMinute.length;

const relativeSpeedKmh = toKmh(avgDistanceDecreasePerMinute, SPEED_UNITS.MPM);

console.log(
  `Average distance decrease per minute: ${avgDistanceDecreasePerMinute} m/min`,
);
console.log(`Relative speed from radar trend: ${relativeSpeedKmh} km/h`);

const actualDistanceDecreasePerMinute =
  distanceLogs === undefined ? null : avgDistanceDecreasePerMinute;

const planeCatalog = [
  {
    id: 1,
    name: "SR-71 Blackbird",
    cruiseSpeedKmh: 3200,
    maxSpeedKmh: 3529,
    trajectoryProfile: "straight-high-altitude",
    sustainedHighSpeedHours: 1.5,
  },
  {
    id: 2,
    name: "MiG-25 Foxbat",
    cruiseSpeedKmh: 2500,
    maxSpeedKmh: 3494,
    trajectoryProfile: "high-speed-intercept",
    sustainedHighSpeedHours: 0.7,
  },
  {
    id: 3,
    name: "MiG-31 Foxhound",
    cruiseSpeedKmh: 2300,
    maxSpeedKmh: 3000,
    trajectoryProfile: "intercept",
    sustainedHighSpeedHours: 0.9,
  },
  {
    id: 4,
    name: "F-22 Raptor",
    cruiseSpeedKmh: 1960,
    maxSpeedKmh: 2410,
    trajectoryProfile: "agile-fighter",
    sustainedHighSpeedHours: 0.6,
  },
  {
    id: 5,
    name: "F-15 Eagle",
    cruiseSpeedKmh: 1650,
    maxSpeedKmh: 2655,
    trajectoryProfile: "fighter",
    sustainedHighSpeedHours: 0.6,
  },
  {
    id: 6,
    name: "Eurofighter Typhoon",
    cruiseSpeedKmh: 1900,
    maxSpeedKmh: 2495,
    trajectoryProfile: "fighter",
    sustainedHighSpeedHours: 0.5,
  },
  {
    id: 7,
    name: "Dassault Rafale",
    cruiseSpeedKmh: 1912,
    maxSpeedKmh: 2222,
    trajectoryProfile: "fighter",
    sustainedHighSpeedHours: 0.5,
  },
  {
    id: 8,
    name: "Su-57 Felon",
    cruiseSpeedKmh: 1900,
    maxSpeedKmh: 2600,
    trajectoryProfile: "stealth-fighter",
    sustainedHighSpeedHours: 0.6,
  },
  {
    id: 9,
    name: "Concorde",
    cruiseSpeedKmh: 2179,
    maxSpeedKmh: 2333,
    trajectoryProfile: "straight-high-altitude",
    sustainedHighSpeedHours: 3,
  },
  {
    id: 10,
    name: "Tu-144",
    cruiseSpeedKmh: 2000,
    maxSpeedKmh: 2430,
    trajectoryProfile: "straight-high-altitude",
    sustainedHighSpeedHours: 1.5,
  },
  {
    id: 11,
    name: "B-1B Lancer",
    cruiseSpeedKmh: 900,
    maxSpeedKmh: 1335,
    trajectoryProfile: "bomber",
    sustainedHighSpeedHours: 2,
  },
  {
    id: 12,
    name: "B-2 Spirit",
    cruiseSpeedKmh: 900,
    maxSpeedKmh: 1010,
    trajectoryProfile: "stealth-bomber",
    sustainedHighSpeedHours: 4,
  },
  {
    id: 13,
    name: "C-130 Hercules",
    cruiseSpeedKmh: 540,
    maxSpeedKmh: 670,
    trajectoryProfile: "transport",
    sustainedHighSpeedHours: 6,
  },
  {
    id: 14,
    name: "MQ-9 Reaper",
    cruiseSpeedKmh: 310,
    maxSpeedKmh: 482,
    trajectoryProfile: "uav",
    sustainedHighSpeedHours: 14,
  },
];

function identifyPlanes(observation, planes, topN = 5) {
  const { speedKmh, durationHours, trajectoryProfile } = observation;

  const ranked = planes
    .map((plane) => {
      const speedDelta = Math.abs(plane.maxSpeedKmh - speedKmh);
      const speedScore = Math.max(0, 1 - speedDelta / Math.max(speedKmh, 1));

      const durationDelta = Math.abs(
        plane.sustainedHighSpeedHours - durationHours,
      );
      const durationScore = Math.max(
        0,
        1 - durationDelta / Math.max(durationHours, 1),
      );

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

const observedFlight = {
  speedKmh: 3529,
  durationHours: 1,
  trajectoryProfile: "straight-high-altitude",
};

const likelyPlanes = identifyPlanes(observedFlight, planeCatalog);

const observedFromRadarTrend = {
  speedKmh: relativeSpeedKmh,
  durationHours: 1,
  trajectoryProfile: "straight-high-altitude",
};

const likelyPlanesFromRadarTrend = identifyPlanes(
  observedFromRadarTrend,
  planeCatalog,
);

console.log("Normalized observed speed:", `${observedFlight.speedKmh} km/h`);
console.log("Top matching plane candidates:", likelyPlanes);
console.log(
  "Top matching candidates from radar trend speed:",
  likelyPlanesFromRadarTrend,
);
