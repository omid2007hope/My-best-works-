const express = require("express");
const { readBurst } = require("../../Controller/Radar/Radar");
const router = express.Router();

router.get("/", readBurst);

module.exports = router;
