const express = require("express");
const router = express.Router();

import { createDistance } from "../../Controller/Calculator/Distance";

router.post("/", createDistance);

module.exports = router;
