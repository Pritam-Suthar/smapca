const express = require("express");
const router = express.Router();
const { fetchCartData } = require("../controllers/cartController");

// // 🛒 Fetch All Cart Items
router.post("/:id", async (req, res) => {
    const { id } = req.params; // ✅ Get ID from URL

    if (!id) return res.status(400).json({ error: "Cart ID is required" });

    const data = await fetchCartData(id); // ✅ Fetch from DB using ID

    if (!data || data.length === 0) {
        return res.status(404).json({ error: "Cart not found" });
    }

    res.json({ cart: data }); // ✅ Return fetched data
});


module.exports = router;