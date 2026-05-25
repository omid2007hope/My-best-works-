const express = require("express");
const router = express.Router();

const { initialize } = require("../../../Controller/Radar/Radar");
const GetBurst = require("../Get_Burst");
const GetStatus = require("../Get_Status");
const PostInitialize = require("../Post_initialize");
const PostStart = require("../Post_Start");
const PostStop = require("../Post_Stop");
const PostShutdown = require("../Post_Shutdoiwn");

router.use("/burst", GetBurst);
router.use("/status", GetStatus);
router.post("/init", initialize);
router.use("/init", PostInitialize);
router.use("/start", PostStart);
router.use("/stop", PostStop);
router.use("/shutdown", PostShutdown);

module.exports = router;
