const supabase = require("../utils/supabaseClient");

async function updatePaymentStatus(req, res) {
    console.log("🔍 Full Request Body:", req.body); // ✅ Log full request

    const { order_id, paymentId } = req.body;

    if (!order_id || !paymentId) {
        console.error("❌ Missing parameters in request:", { order_id, paymentId });
        return res.status(400).json({ error: "Missing order_id or payment_id" });
    }

    // ✅ Fetch existing data before update
    const { data: existingData, error: fetchError } = await supabase
        .from("cart")
        .select("*")
        .eq("order_id", order_id);

    console.log("📌 Existing cart data:", existingData);

    if (fetchError) {
        console.error("❌ Error fetching existing cart:", fetchError.message);
        return res.status(500).json({ error: fetchError.message });
    }

    // ✅ Update payment status
    const { data, error } = await supabase
        .from("cart")
        .update({
            payment_status: "success",
            payment_id: paymentId // 🛑 Ensure column name matches DB
        })
        .eq("order_id", order_id)
        .select();

    if (error) {
        console.error("❌ Supabase Update Error:", error.message);
        return res.status(500).json({ error: error.message });
    }

    console.log("✅ Updated payment in Supabase:", data); // ✅ Log updated record

    res.status(200).json({
        success: true,
        message: "Payment status updated successfully",
        order_id,
        paymentId,
        updated_data: data
    });
}

module.exports = { updatePaymentStatus };
