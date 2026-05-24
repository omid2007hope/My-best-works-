const express = require("express");
const router = express.Router();

const postDistance = require("../Post_Distance");
const getDistance = require("../Get_Distance");
const computeDistance = require("../Compute_Distance");

router.use("/distance", postDistance);
router.use("/distance/compute", computeDistance);
router.use("/distance", getDistance);

module.exports = router;
