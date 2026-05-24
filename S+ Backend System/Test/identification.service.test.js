const test = require("node:test");
const assert = require("node:assert/strict");

const {
  identifyPlanes,
  planeCatalog,
} = require("../API/Radar/Service/Radar/Identification");

test("plane catalog now contains expanded entries", () => {
  assert.ok(Array.isArray(planeCatalog));
  assert.ok(planeCatalog.length >= 24);
});

test("identification accepts durationSeconds and ranks high-speed profiles", () => {
  const ranked = identifyPlanes(
    {
      speedKmh: 2100,
      durationSeconds: 120,
      trajectoryProfile: "straight-high-altitude",
    },
    planeCatalog,
    5,
  );

  assert.ok(Array.isArray(ranked));
  assert.ok(ranked.length > 0);
  assert.equal(ranked[0].name, "Concorde");
  assert.ok(ranked[0].confidence >= 95);
  assert.ok(ranked.every((entry) => typeof entry.confidence === "number"));
});
