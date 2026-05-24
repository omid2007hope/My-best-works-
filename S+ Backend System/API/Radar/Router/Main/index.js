const express = require("express");
const router = express.Router();

const Radar = require("../Radar/Gateway/Index");
const Distance = require("../Distance/Gateaway/Index");
const Identification = require("../Identification/Gateway/Index");
const Speed = require("../Speed/Gateway/Index");

const versionOneRouteGroups = [Radar, Distance, Identification, Speed];

versionOneRouteGroups.forEach((featureRouter) => {
  router.use(featureRouter);
});

module.exports = router;
