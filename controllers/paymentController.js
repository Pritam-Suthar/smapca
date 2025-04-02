const supabase = require("../utils/supabaseClient");

// ✅ Function to update payment status immediately
async function updatePaymentStatus(req, res) {
    const { order_id, payment_id } = req.body;

    if (!order_id || !payment_id) {
        return res.status(400).json({ error: "Missing order_id or payment_id" });
    }

    try {
        // 🔄 Update payment status in Supabase
        const { data, error } = await supabase
            .from("cart")
            .update({ 
                payment_status: "paid",  // ✅ Mark as Paid
                payment_id      // ✅ Store payment ID for reference
            })
            .eq("order_id", order_id);

        if (error) {
            console.error("❌ Supabase Update Error:", error.message);
            return res.status(500).json({ error: "Failed to update payment status" });
        }

        console.log(`✅ Payment successful for Order ID: ${order_id}`);
        return res.status(200).json({
            success: true,
            message: "Payment status updated",
            order_id,
            payment_id
        });
    } catch (error) {
        console.error("❌ Error updating payment status:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { updatePaymentStatus };
