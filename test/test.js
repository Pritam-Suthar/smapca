const { qrScan } = require("../utils/qrScanner");
const { insertCartData } = require("../controllers/cartController");

// Encrypted QR Code
const encryptedString = "HRl+F+9lNXYI2FlFRDdKFsxFKWwHyl+0jmxfQAhs+3uG9ZiMT9r5rjtnydbDFGiv0Y9prpjHI+Fs0h0COiLo8twakLASI3ykDJRCX/inwWPQ1q2gb1vR9/e5A9Tb07r5dWMITHMiGg4/BO8Ae07vQvz5oVwuBXdSR81Wo34=";

function parseCartDetails(text) {
    try {
        const lines = text.split("\n").map(line => line.trim()); // Split and clean lines

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
                // Extract item name and price
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

// ✅ Decrypt and Insert Data
qrScan(encryptedString).then((decryptedData) => {
    if (decryptedData) {
        const cartData = parseCartDetails(decryptedData);
        if (cartData) {
            console.log("🛒 Parsed Cart Data:", cartData);
            insertCartData(cartData); 
        } else {
            console.log("❌ Failed to extract data from text.");
        }
    } else {
        console.log("❌ Decryption failed.");
    }
});
