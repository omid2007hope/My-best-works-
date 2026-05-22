const express = require("express");
const {
  listDistance,
  createDistance,
  listSpeed,
  createSpeed,
  listIdentification,
  createIdentification,
  listRadar,
  createRadar,
} = require("../../Controller/Radar/Records");

const router = express.Router();

router.route("/distance").get(listDistance).post(createDistance);

router.route("/speed").get(listSpeed).post(createSpeed);

router
  .route("/identification")
  .get(listIdentification)
  .post(createIdentification);

router.route("/radar").get(listRadar).post(createRadar);

module.exports = router;
