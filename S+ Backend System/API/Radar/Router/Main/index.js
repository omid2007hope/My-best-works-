const express = require("express");
const router = express.Router();

const Radar = require("../Radar/Gateway/Index");
const Distance = require("../Distance/Gateaway/index");
const Identification = require("../Identification/Gateway/index");
const Speed = require("../Speed/Gateway/index");

const versionOneRouteGroups = [Radar, Distance, Identification, Speed];

versionOneRouteGroups.forEach((featureRouter) => {
  router.use(featureRouter);
});

module.exports = router;
