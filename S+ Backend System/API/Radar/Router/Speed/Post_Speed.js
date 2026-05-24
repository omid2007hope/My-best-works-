const express = require("express");
const router = express.Router();

const { createSpeed } = require("../../Controller/Calculator/Speed");

router.post("/", createSpeed);

module.exports = router;
