const { findAvailablePort } = require("./Spy");

async function portSwitch() {
  return process.env.PORT
    ? Number(process.env.PORT)
    : await findAvailablePort();
}

module.exports = { portSwitch };
