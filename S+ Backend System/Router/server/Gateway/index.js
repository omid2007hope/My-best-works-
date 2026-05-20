const Health = require("../Health");

const express = require("express");
const router = express.Router();

router.use("/health", Health);

module.exports = router;
