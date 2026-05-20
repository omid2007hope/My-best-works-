const express = require("express");
const router = express.Router();

const Server = require("../server/Gateway/index");

const versionOneRouteGroups = [Server];

versionOneRouteGroups.forEach((featureRouter) => {
  router.use(featureRouter);
});

module.exports = router;
