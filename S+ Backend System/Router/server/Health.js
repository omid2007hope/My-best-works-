const express = require("express");
const router = express.Router();

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
    const runtimePort = req.app.get("port");
    const envPort = Number(process.env.PORT);
    const port = Number.isFinite(runtimePort)
      ? runtimePort
      : Number.isFinite(envPort)
        ? envPort
        : "unknown";

    res.status(200).json({ port });
  } catch (error) {
    console.error("Port check failed:", error.message);
    res.status(500).json({ status: "error", message: "Port check failed" });
  }
});

module.exports = router;
