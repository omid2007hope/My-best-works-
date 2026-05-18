const cors = require("cors");
const express = require("express");
const app = express();

const { portSwitch } = require("./Tools/Server/PortSwitch");

async function startServer() {
  const selectedPort = await portSwitch();
  const isListeningTo = `http://localhost:${selectedPort}`;

  app.listen(selectedPort, () => {
    console.log(`Server listening on ${isListeningTo}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
