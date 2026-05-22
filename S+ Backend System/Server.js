const cors = require("cors");
const express = require("express");
const app = express();

const { portSwitch } = require("./Tools/Server/PortSwitch");

const healthRouter = require("./Router/Main/index");

app.use(cors());
app.use(express.json());
app.use("/server", healthRouter);

async function startServer() {
  const selectedPort = await portSwitch();
  app.set("port", selectedPort);
  const isListeningTo = `http://localhost:${selectedPort}`;

  app.listen(selectedPort, () => {
    console.log(`Server listening on ${isListeningTo}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
