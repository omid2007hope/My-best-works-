const express = require("express");
const router = express.Router();
const postDistance = require("../Post_Distance");

router.use("/distance", postDistance);

module.exports = router;
