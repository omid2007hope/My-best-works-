const express = require("express");
const router = express.Router();

const computeIdentificationRouter = require("../Compute_Identification");
const getIdentificationRouter = require("../Get_Identification");

router.use("/identification/compute", computeIdentificationRouter);
router.use("/identification", getIdentificationRouter);

module.exports = router;
