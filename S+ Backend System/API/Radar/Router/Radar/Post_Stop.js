const express = require("express");
const { stopStreaming } = require("../../Controller/Radar/Radar");
const router = express.Router();

router.post("/", stopStreaming);

module.exports = router;
