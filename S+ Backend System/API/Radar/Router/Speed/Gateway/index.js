const express = require("express");
const router = express.Router();

const computeSpeedRouter = require("../Compute_Speed");
const postSpeedRouter = require("../Post_Speed");
const getSpeedRouter = require("../Get_Speed");

router.use("/speed", postSpeedRouter);
router.use("/speed", computeSpeedRouter);
router.use("/speed", getSpeedRouter);

module.exports = router;
