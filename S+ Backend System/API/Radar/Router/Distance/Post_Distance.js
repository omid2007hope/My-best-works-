const express = require("express");
const router = express.Router();

const { createDistance } = require("../../Controller/Calculator/Distance");

router.post("/", createDistance);

module.exports = router;
