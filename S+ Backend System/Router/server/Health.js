const express = require("express");
const router = express.Router();

const { getHealth } = require("../../Controller/Server");

//! ================================================================
//! ROUTE: /health - Server Health Check
//! ================================================================

router.get("/", getHealth);

module.exports = router;
