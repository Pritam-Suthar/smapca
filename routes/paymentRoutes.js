const express = require("express");
const router = express.Router();
const { updatePaymentStatus } = require("../controllers/paymentController");

// ✅ Route to update payment status
router.post("/update-payment-status", updatePaymentStatus);

module.exports = router;
