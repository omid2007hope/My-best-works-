const express = require("express");
const router = express.Router();

const { listDistance } = require("../../Controller/Calculator/Distance");

router.get("/", listDistance);

module.exports = router;
