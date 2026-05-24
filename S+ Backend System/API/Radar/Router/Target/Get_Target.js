const express = require("express");
const router = express.Router();

const { getTarget } = require("../../Controller/Radar/Target");

router.get("/", getTarget);

module.exports = router;
