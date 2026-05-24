const express = require("express");
const router = express.Router();

const { computeDistance } = require("../../Controller/Calculator/Distance");

router.post("/", computeDistance);

module.exports = router;
