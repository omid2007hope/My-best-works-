const express = require("express");
const router = express.Router();

const { listSpeed } = require("../../Controller/Calculator/Speed");

router.get("/", listSpeed);

module.exports = router;
