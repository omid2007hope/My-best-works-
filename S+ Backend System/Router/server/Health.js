const express = require("express");
const app = express();

express.Router = express.Router();
const router = express.Router();

const { checkPort } = require("../../Tools/Server/Spy");

//! ================================================================
//! ROUTE: /health - Server Health Check
//! ================================================================

router.get("/health", (req, res) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

//! ================================================================
// ! Checks the Server's current port
//! ================================================================

router.get("/port", (req, res) => {
  try {
    const port = process.env.PORT ? Number(process.env.PORT) : checkPort();
    res.status(200).json({ port: port ? port : "unknown" });
  } catch (error) {
    console.error("Port check failed:", error.message);
    res.status(500).json({ status: "error", message: "Port check failed" });
  }
});

module.exports = router;
