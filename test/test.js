const { qrScan } = require("../utils/qrScanner");
const { insertCartData } = require("../controllers/cartController");

// Encrypted QR Code
const encryptedString = "HRl+F+9lNXYI2FlFRDdKFsxFKWwHyl+0jmxfQAhs+3uG9ZiMT9r5rjtnydbDFGiv0Y9prpjHI+Fs0h0COiLo8twakLASI3ykDJRCX/inwWPQ1q2gb1vR9/e5A9Tb07r5dWMITHMiGg4/BO8Ae07vQvz5oVwuBXdSR81Wo34=";

function parseCartDetails(text) {
    try {
        const lines = text.split("\n").map(line => line.trim());
        if (lines.length < 5) throw new Error("Invalid format");

        return {
            item: lines[1].split(" - Rs. ")[0],
            price: parseFloat(lines[1].split(" - Rs. ")[1]),
            quantity: parseInt(lines[2].split("- ")[1]),
            total: parseFloat(lines[3].split(": Rs. ")[1]),
            datetime: lines[4].split("Date & Time:")[1].trim(),
        };
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
