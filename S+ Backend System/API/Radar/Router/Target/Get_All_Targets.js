const express = require("express");
const router = express.Router();

const { listTargets } = require("../../Controller/Radar/Target");

router.get("/", listTargets);

module.exports = router;
