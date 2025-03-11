const crypto = require("crypto");

// Ensure AES key is exactly 16 bytes (128-bit key)
const key = Buffer.from("treegodbedoofchi", "utf8");

// Function to decrypt QR Code data
async function qrScan(data) {
    try {
        const encryptedData = Buffer.from(data, "base64");

        // Define nonce and tag lengths
        const nonceLength = 16;
        const tagLength = 16;

        if (encryptedData.length < nonceLength + tagLength) {
            throw new Error("Invalid encrypted data length.");
        }

        // Extract nonce, tag, and ciphertext
        const nonce = encryptedData.slice(0, nonceLength);
        const tag = encryptedData.slice(nonceLength, nonceLength + tagLength);
        const ciphertext = encryptedData.slice(nonceLength + tagLength);

        // Create decipher using AES-128-GCM
        const decipher = crypto.createDecipheriv("aes-128-gcm", key, nonce);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(ciphertext, undefined, "utf8");
        decrypted += decipher.final("utf8");

        console.log("🔓 Decrypted Data:", decrypted);
        return decrypted;
    } catch (error) {
        console.error("❌ Decryption failed:", error.message);
        return null;
    }
}

module.exports = { qrScan };
