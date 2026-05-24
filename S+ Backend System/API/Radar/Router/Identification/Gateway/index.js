const express = require("express");
const router = express.Router();

const computeIdentificationRouter = require("../Compute_Identification");
const getIdentificationRouter = require("../Get_Identification");
const postIdentificationRouter = require("../Post_Identification");

router.use("/identification ", postIdentificationRouter);
router.use("/identification", computeIdentificationRouter);
router.use("/identification", getIdentificationRouter);

module.exports = router;
