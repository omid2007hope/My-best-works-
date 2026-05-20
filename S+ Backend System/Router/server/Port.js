const express = require("express");
const router = express.Router();

const { getPort } = require("../../Controller/Server");

//! ================================================================
// ! Checks the Server's current port
//! ================================================================

router.get("/", getPort);

module.exports = router;
