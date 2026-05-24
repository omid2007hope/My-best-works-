const express = require("express");
const router = express.Router();

const processPipelineRouter = require("../Post_Pipeline");

router.use("/process", processPipelineRouter);

module.exports = router;
