const express = require("express");
const router = express.Router();

const {
  computeIdentification,
} = require("../../Controller/Identification/Identification");

router.post("/", computeIdentification);

module.exports = router;
