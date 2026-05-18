const cors = require("cors");
const express = require("express");
const net = require("net");
const app = express();

const PORTS = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];

// Helper to check if a port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => {
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
}

async function findAvailablePort() {
  for (const port of PORTS) {
    if (await checkPort(port)) return port;
  }
  throw new Error("No available ports found");
}

module.exports = { checkPort, findAvailablePort };
