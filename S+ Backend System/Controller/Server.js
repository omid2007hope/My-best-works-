const express = require("express");
const asyncHandler = require("../Tools/Handler/Async");
const Status = require("./Share/Status");

const server = new (class Server extends Status {
  getHealth = asyncHandler(async (req, res) => {
    try {
      res.status(this.success).json({ status: "ok" });
    } catch (error) {
      console.error("Health check failed:", error.message);
      res
        .status(this.error)
        .json({ status: "error", message: "Health check failed" });
    }
  });

  getPort = asyncHandler(async (req, res) => {
    try {
      const runtimePort = req.app.get("port");
      const envPort = Number(process.env.PORT);
      const port = Number.isFinite(runtimePort)
        ? runtimePort
        : Number.isFinite(envPort)
          ? envPort
          : "unknown";

      res.status(this.success).json({ port });
    } catch (error) {
      console.error("Port check failed:", error.message);
      res
        .status(this.error)
        .json({ status: "error", message: "Port check failed" });
    }
  });
})();

module.exports = {
  getHealth: server.getHealth,
  getPort: server.getPort,
};
