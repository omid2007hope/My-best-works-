const express = require("express");
const router = express.Router();

const getTargetRouter = require("../Get_Target");
const getAllTargetsRouter = require("../Get_All_Targets");

router.use("/targets", getAllTargetsRouter);
router.use("/target", getTargetRouter);

module.exports = router;
