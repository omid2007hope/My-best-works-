const distanceController = require("../Calculator/Distance");
const speedController = require("../Calculator/Speed");
const identificationController = require("../Identification/Identification");
const radarController = require("./Radar");

module.exports = {
  listDistance: distanceController.listDistance,
  createDistance: distanceController.createDistance,
  computeDistance: distanceController.computeDistance,
  listSpeed: speedController.listSpeed,
  createSpeed: speedController.createSpeed,
  computeSpeed: speedController.computeSpeed,
  listIdentification: identificationController.listIdentification,
  createIdentification: identificationController.createIdentification,
  computeIdentification: identificationController.computeIdentification,
  listRadar: radarController.listRadar,
  createRadar: radarController.createRadar,
};
