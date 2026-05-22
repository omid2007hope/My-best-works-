const express = require("express");
const { initialize } = require("../../Controller/Radar/Radar");
const router = express.Router();

router.post("/", initialize);

module.exports = router;
