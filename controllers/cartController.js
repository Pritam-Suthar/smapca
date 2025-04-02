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
                payment_status: "pending",
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
            order_id,
            cartData,
        });
    } catch (error) {
        console.error("❌ Error processing cart data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// Fetch user cart history
async function fetchUserCartHistory(req, res) {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }

    const { data, error } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user_id);

    if (error) {
        console.error("❌ Supabase Fetch Error:", error.message);
        return res.status(500).json({ error: "Failed to fetch user history" });
    }

    res.status(200).json({ success: true, history: data });
}

// Function to update payment status
async function updatePaymentStatus(req, res) {
    const { order_id, status } = req.body;

    if (!order_id || !status) {
        return res.status(400).json({ error: "Missing order_id or status" });
    }

    try {
        // ✅ Update payment status in Supabase
        const { data, error } = await supabase
            .from("cart")
            .update({ payment_status: status })
            .eq("order_id", order_id);

        if (error) {
            console.error("❌ Supabase Update Error:", error.message);
            return res.status(500).json({ error: "Failed to update payment status" });
        }

        return res.status(200).json({
            success: true,
            message: `Payment status updated to '${status}'`,
        });
    } catch (error) {
        console.error("❌ Error updating payment status:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { scanAndSaveCart, fetchUserCartHistory, updatePaymentStatus };
