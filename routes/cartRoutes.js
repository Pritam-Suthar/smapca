const express = require("express");
const { scanAndSaveCart, fetchUserCartHistory } = require("../controllers/cartController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// POST API to scan QR Code and save cart details
router.post("/scan", scanAndSaveCart);
router.get("/cart/history", authenticateUser, fetchUserCartHistory);

module.exports = router;
