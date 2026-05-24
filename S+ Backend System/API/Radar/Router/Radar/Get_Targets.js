const express = require("express");
const { listTargets, getTarget } = require("../../Controller/Radar/Target");

const router = express.Router();

router.route("/").get(listTargets);
router.route("/:targetId").get(getTarget);

module.exports = router;
