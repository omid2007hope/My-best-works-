const Health = require("../Health");
const Port = require("../Port");
const Radar = require("../../../API/Radar/Router/Main/index");
const { initialize } = require("../../../API/Radar/Controller/Radar/Radar");

const express = require("express");
const router = express.Router();

router.use("/health", Health);
router.use("/port", Port);
router.use("/radar", Radar);
router.post("/radar/init", initialize);

module.exports = router;
