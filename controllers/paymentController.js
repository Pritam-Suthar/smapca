const supabase = require("../utils/supabaseClient");

async function updatePaymentStatus(req, res) {
    console.log("🔍 Received request:", req.body); // ✅ Debugging log

    const { order_id, razorpay_payment_id } = req.body;

    if (!order_id || !razorpay_payment_id) {
        return res.status(400).json({ error: "Missing order_id or payment_id" });
    }

    // ✅ Update payment status in Supabase
    const { data, error } = await supabase
        .from("cart")
        .update({ payment_status: "success", razorpay_payment_id })
        .eq("order_id", order_id);

    if (error) {
        console.error("❌ Supabase Update Error:", error.message);
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
        success: true,
        message: "Payment status updated",
        order_id,
        razorpay_payment_id
    });
}

module.exports = { updatePaymentStatus };
