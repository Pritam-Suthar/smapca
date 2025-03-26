const express = require("express");
const { scanAndSaveCart } = require("../controllers/cartController");

const router = express.Router();

// POST API to scan QR Code and save cart details
router.post("/scan", scanAndSaveCart);

module.exports = router;
