const express = require("express");
const router = express.Router();

const { initialize } = require("../../../Controller/Radar/Radar");
const GetBurst = require("../Get_Burst");
const GetStatus = require("../Get_Status");
const Records = require("../Records");
const PostInitialize = require("../Post_initialize");
const PostStart = require("../Post_Start");
const PostStop = require("../Post_Stop");
const PostShutdown = require("../Post_Shutdoiwn");
const PostPipeline = require("../Post_Pipeline");
const GetTargets = require("../Get_Targets");

router.use("/burst", GetBurst);
router.use("/status", GetStatus);
router.use("/records", Records);
router.post("/init", initialize);
router.use("/init", PostInitialize);
router.use("/start", PostStart);
router.use("/stop", PostStop);
router.use("/shutdown", PostShutdown);
router.use("/pipeline", PostPipeline);
router.use("/targets", GetTargets);

module.exports = router;
