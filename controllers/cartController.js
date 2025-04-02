const { qrScan } = require("../utils/qrScanner");
const supabase = require("../utils/supabaseClient");
const crypto = require("crypto");

// Function to parse decrypted QR data
function parseCartDetails(text) {
    try {
        const lines = text.split("\n").map(line => line.trim());
        if (lines.length < 2) throw new Error("Invalid format");

        let items = [];
        let total = 0;
        let datetime = "";

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("Total:")) {
                total = parseFloat(lines[i].split(": Rs. ")[1]);
            } else if (lines[i].startsWith("Date & Time:")) {
                datetime = lines[i].split("Date & Time:")[1].trim();
            } else if (lines[i].includes("- Rs.")) {
                let [item, price] = lines[i].split(" - Rs. ");
                let quantity = parseInt(lines[i + 1]?.split("- ")[1]); // Get next line's quantity
                items.push({ item, price: parseFloat(price), quantity });
            }
        }

        return { items, total, datetime };
    } catch (error) {
        console.error("❌ Failed to parse cart details:", error.message);
        return null;
    }
}

// Function to handle QR scanning and saving process
async function scanAndSaveCart(req, res) {
    const { trolly_id, encrypted_string, user_id } = req.body;

    if (!trolly_id || !encrypted_string || !user_id) {
        return res.status(400).json({ error: "Missing trolly_id, user_id, or encrypted_string" });
    }

    try {
        // 🔓 Decrypt QR Code Data
        const decryptedData = await qrScan(encrypted_string);
        if (!decryptedData) {
            return res.status(400).json({ error: "Decryption failed" });
        }

        // 🛒 Parse the decrypted cart details
        const cartData = parseCartDetails(decryptedData);
        if (!cartData) {
            return res.status(400).json({ error: "Failed to extract cart details" });
        }

        // 🛒 Generate Order ID (e.g., order_<hex>)
        const order_id = "order_" + crypto.randomBytes(6).toString("hex");

        // ✅ Insert into Supabase
        const { data, error } = await supabase.from("cart").insert([
            {
                trolly_id,
                user_id, // ✅ Store user_id
                order_id,
                items: cartData.items,
                total: cartData.total,
                payment_status: "pending", // ✅ Default is "pending"
                payment_id: null, // ✅ Payment ID will be updated later
                datetime: cartData.datetime,
            },
        ]);

        if (error) {
            console.error("❌ Supabase Insert Error:", error.message);
            return res.status(500).json({ error: "Failed to store data in Supabase" });
        }

        // ✅ Log database insert
        console.log("✅ Cart saved:", { trolly_id, user_id, order_id, ...cartData });

        return res.status(200).json({
            success: true,
            message: "Cart data saved successfully",
            order_id, // ✅ Return order ID so frontend can send payment ID later
            cartData,
        });
    } catch (error) {
        console.error("❌ Error processing cart data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// ✅ Function to update payment status in Supabase
async function updatePaymentStatus(req, res) {
    console.log("🔍 Received request:", req.body); // Debugging log

    const { order_id, payment_id } = req.body;

    if (!order_id || !payment_id) {
        return res.status(400).json({ error: "Missing order_id or payment_id" });
    }

    // ✅ Update payment status & store payment ID in Supabase
    const { data, error } = await supabase
        .from("cart")
        .update({
            payment_status: "success",
            payment_id: payment_id // ✅ Storing payment ID
        })
        .eq("order_id", order_id);

    if (error) {
        console.error("❌ Supabase Update Error:", error.message);
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
        success: true,
        message: "Payment status updated successfully",
        order_id,
        payment_id
    });
}

// Fetch user cart history dynamically
async function fetchUserCartHistory(req, res) {
    try {
        // Extract the authenticated user from request
        const user = req.user; // This should be set by authentication middleware

        if (!user || !user.id) {
            return res.status(401).json({ error: "Unauthorized, user not found" });
        }

        // Get user ID dynamically
        const user_id = user.id;

        // Fetch cart history from Supabase
        const { data, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", user_id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true, history: data });
    } catch (error) {
        console.error("❌ Error fetching user cart history:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { scanAndSaveCart, fetchUserCartHistory, updatePaymentStatus };
