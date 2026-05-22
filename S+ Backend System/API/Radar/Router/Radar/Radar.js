const express = require("express");
const router = express.Router();

const {
  getStatus,
  initialize,
  startStreaming,
  stopStreaming,
  readBurst,
  shutdown,
} = require("../../Controller/Radar/Radar");

router.get("/status", getStatus);
router.post("/init", initialize);
router.post("/start", startStreaming);
router.post("/stop", stopStreaming);
router.get("/burst", readBurst);
router.post("/shutdown", shutdown);

module.exports = router;
