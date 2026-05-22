const express = require("express");
const { startStreaming } = require("../../Controller/Radar/Radar");
const router = express.Router();

router.post("/", startStreaming);

module.exports = router;
