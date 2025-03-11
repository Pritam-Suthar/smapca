const supabase = require("../config/supabase");
const crypto = require("crypto");

// Function to generate a random order ID
function generateOrderId() {
    return "order_" + crypto.randomBytes(8).toString("base64url"); // ✅ Generates a short alphanumeric ID
}

// Function to fetch cart data
async function fetchCartData(id) {
    const { data, error } = await supabase
        .from("cart_details")
        .select("*")
        .eq("id", id) // ✅ Filter by ID

    if (error) {
        console.error("❌ Error fetching cart data:", error.message);
        return null;
    }

    return data;
}

async function insertCartData(cartData) {
    try {
        const order_id = generateOrderId();

        const { data, error } = await supabase
            .from("cart_details")
            .insert([{ ...cartData, order_id }])
            .select();

        if (error) {
            console.error("❌ Error inserting data:", error);
            return null;
        }

        console.log("✅ Data inserted successfully:", data);
        return data;
    } catch (err) {
        console.error("❌ Unexpected error inserting data:", err.message);
        return null;
    }
}

module.exports = { fetchCartData, insertCartData };
