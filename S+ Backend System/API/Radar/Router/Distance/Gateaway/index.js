const express = require("express");
const router = express.Router();

const computeDistance = require("../Compute_Distance");

router.use("/distance/compute", computeDistance);

module.exports = router;
