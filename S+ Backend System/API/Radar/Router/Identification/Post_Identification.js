const express = require("express");
const router = express.Router();

const {
  createIdentification,
} = require("../../Controller/Identification/Identification");

router.post("/", createIdentification);

module.exports = router;
