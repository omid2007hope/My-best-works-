const cors = require("cors");
const express = require("express");
const net = require("net");
const app = express();

const { findAvailablePort } = require("./Spy");

export const portSwitch = (async () => {
  return process.env.PORT ? process.env.PORT : await findAvailablePort();
})();
