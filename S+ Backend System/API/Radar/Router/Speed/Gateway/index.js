const express = require("express");
const router = express.Router();

const computeSpeedRouter = require("../Compute_Speed");
const getSpeedRouter = require("../Get_Speed");

router.use("/speed/compute", computeSpeedRouter);
router.use("/speed", getSpeedRouter);

module.exports = router;
