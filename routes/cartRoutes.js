const express = require("express");
const { scanAndSaveCart, fetchUserCartHistory } = require("../controllers/cartController");

const router = express.Router();

// POST API to scan QR Code and save cart details
router.post("/scan", scanAndSaveCart);
router.get("/history/:user_id", fetchUserCartHistory);

module.exports = router;
