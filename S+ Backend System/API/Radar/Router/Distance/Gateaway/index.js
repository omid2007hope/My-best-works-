const express = require("express");
const router = express.Router();

const getDistance = require("../Get_Distance");
const computeDistance = require("../Compute_Distance");

router.use("/distance/compute", computeDistance);
router.use("/distance", getDistance);

module.exports = router;
