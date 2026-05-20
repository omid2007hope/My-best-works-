const Health = require("../Health");
const Port = require("../Port");

const express = require("express");
const router = express.Router();

router.use("/health", Health);
router.use("/port", Port);

module.exports = router;
