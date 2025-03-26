const { qrScan } = require("../utils/qrScanner");
const supabase = require("../utils/supabaseClient");

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

// Function to handle the QR scanning and saving process
async function scanAndSaveCart(req, res) {
    const { trolly_id, encrypted_string } = req.body;

    if (!trolly_id || !encrypted_string) {
        return res.status(400).json({ error: "Missing trolly_id or encrypted_string" });
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

        // ✅ Insert into Supabase
        const { data, error } = await supabase.from("cart").insert([
            {
                trolly_id,
                items: cartData.items,
                total: cartData.total,
                datetime: cartData.datetime,
            },
        ]);

        if (error) {
            console.error("❌ Supabase Insert Error:", error.message);
            return res.status(500).json({ error: "Failed to store data in Supabase" });
        }

        // ✅ Mock database insert
        console.log("✅ Saving to database:", { trolly_id, ...cartData });

        return res.status(200).json({
            success: true,
            message: "Cart data saved successfully",
            cartData,
        });
    } catch (error) {
        console.error("❌ Error processing cart data:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = { scanAndSaveCart };
