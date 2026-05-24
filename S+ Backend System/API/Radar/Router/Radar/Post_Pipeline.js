const express = require("express");
const { process } = require("../../Controller/Radar/Pipeline");

const router = express.Router();

// POST /pipeline/process — full burst-to-identification pipeline for all targets.
router.route("/process").post(process);

module.exports = router;
