const express = require("express");
const router = express.Router();

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
