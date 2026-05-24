const express = require("express");
const router = express.Router();

const { process } = require("../../Controller/Radar/Pipeline");

router.post("/", process);

module.exports = router;
