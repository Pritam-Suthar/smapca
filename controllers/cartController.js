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

function formatDateTime(datetime) {
    const [date, time] = datetime.split(" "); // Split date and time
    const [day, month, year] = date.split("-"); // Split into day, month, year
    return `${year}-${month}-${day} ${time}`; // Convert to YYYY-MM-DD HH:MM:SS
}

async function insertCartData(cartData) {
    cartData.datetime = formatDateTime(cartData.datetime); // Fix datetime format

    const orderId = generateOrderId();

    const { data, error } = await supabase
        .from("cart_details")
        .insert([
            {
                order_id: orderId,
                items: cartData.items,  // Store as JSONB (without stringify)
                total: cartData.total,
                datetime: cartData.datetime
            }
        ]);

    if (error) {
        console.error("❌ Error inserting data:", error);
    } else {
        console.log("✅ Data inserted successfully:", data);
    }
}

module.exports = { fetchCartData, insertCartData };
