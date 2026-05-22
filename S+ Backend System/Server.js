const cors = require("cors");
const express = require("express");
const app = express();

const { portSwitch } = require("./Tools/Server/PortSwitch");

const radarRouter = require("./API/Radar/Router/Main/index");

const connectMongoDB = require("./API/Radar/DataBase/MongoDB");

const healthRouter = require("./Router/Main/index");

app.use(cors());
app.use(express.json());
app.use("/server", healthRouter);
app.use("/server/radar", radarRouter);
app.use("/radar", radarRouter);

async function startServer() {
  await connectMongoDB();

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
