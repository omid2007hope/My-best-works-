const express = require("express");
const router = express.Router();

const {
  listIdentification,
} = require("../../Controller/Identification/Identification");

router.get("/", listIdentification);

module.exports = router;
