const express = require("express");
const { getStatus } = require("../../Controller/Radar/Radar");
const router = express.Router();

router.get("/", getStatus);

module.exports = router;
