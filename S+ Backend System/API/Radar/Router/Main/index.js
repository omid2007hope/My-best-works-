const express = require("express");
const router = express.Router();

const Radar = require("../Radar/Gateway/Index");
const Distance = require("../Distance/Gateaway/index");

const versionOneRouteGroups = [Radar, Distance];

versionOneRouteGroups.forEach((featureRouter) => {
  router.use(featureRouter);
});

module.exports = router;
