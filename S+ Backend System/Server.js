const cors = require("cors");
const express = require("express");
const net = require("net");
const app = express();

const { portSwitch } = require("./Tools/Server/PortSwitch");

const isListeningTo = `http://localhost:${portSwitch}`;
app.listen(portSwitch, () => {
  console.log(`Server listening on ${isListeningTo}`);
});
Ser;
