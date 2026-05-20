const express = require("express");

const getHealth = async (req, res) => {
  try {
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ status: "error", message: "Health check failed" });
  }
};

module.exports = {
  getHealth,
};
