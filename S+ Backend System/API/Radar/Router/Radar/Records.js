const express = require("express");
const {
  listDistance,
  createDistance,
  computeDistance,
  listSpeed,
  createSpeed,
  computeSpeed,
  listIdentification,
  createIdentification,
  computeIdentification,
  listRadar,
  createRadar,
} = require("../../Controller/Radar/Records");

const router = express.Router();

// Compute-first routes — invoke service computation before persisting.
router.route("/distance/compute").post(computeDistance);
router.route("/speed/compute").post(computeSpeed);
router.route("/identification/compute").post(computeIdentification);

// Standard CRUD routes — raw backfill and listing (supports ?targetId= filter on GET).
router.route("/distance").get(listDistance).post(createDistance);
router.route("/speed").get(listSpeed).post(createSpeed);
router
  .route("/identification")
  .get(listIdentification)
  .post(createIdentification);
router.route("/radar").get(listRadar).post(createRadar);

module.exports = router;
