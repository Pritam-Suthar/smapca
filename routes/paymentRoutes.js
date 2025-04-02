const express = require("express");
const { updatePaymentStatus } = require("../controllers/paymentController");

const router = express.Router();

// ✅ Route to update payment status
router.post("/update-payment-status", updatePaymentStatus);

module.exports = router;
