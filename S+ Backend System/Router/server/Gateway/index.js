const Health = require("../Health");
const Port = require("../Port");
const Radar = require("../../../API/Radar/Router/Radar/Radar");

const express = require("express");
const router = express.Router();

router.use("/health", Health);
router.use("/port", Port);
router.use("/radar", Radar);

module.exports = router;
