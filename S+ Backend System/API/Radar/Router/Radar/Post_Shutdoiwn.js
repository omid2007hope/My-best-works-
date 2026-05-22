const express = require("express");
const { shutdown } = require("../../Controller/Radar/Radar");
const router = express.Router();

router.post("/", shutdown);

module.exports = router;
