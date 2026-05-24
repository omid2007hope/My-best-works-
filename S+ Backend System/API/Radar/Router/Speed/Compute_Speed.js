const express = require("express");
const router = express.Router();

const { computeSpeed } = require("../../Controller/Calculator/Speed");

router.post("/", computeSpeed);

module.exports = router;
