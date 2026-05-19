const express = require("express");
const router = express.Router();

// import { useEffect } from "react";
// import { checkPort } from "../../Tools/Server/Spy";
// import { extractAllRoutes } from "../PathGenerator";

// const method = [
//   { id: 1, name: "GET" },
//   { id: 2, name: "POST" },
//   { id: 3, name: "Patch" },
//   { id: 4, name: "DELETE" },
// ];

// const path = [

// ];

// const baseUrl = "http://localhost:";
// const port = process.env.PORT || checkPort()
// ;

// const fullUrl = `${baseUrl}${port}${}`;

// function pathGenerator() {

//     useEffect(() => {
// const url = `${baseUrl}${port}`;
// const slash = "/"

// const fullUrl = `${url}${slash}${path}`;

// console.log(fullUrl);

//     }, [path, method])

// }

//! ================================================================
//! ROUTE: /health - Server Health Check
//! ================================================================

router.get("/health", (req, res) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
});

module.exports = router;
