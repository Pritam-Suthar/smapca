require("dotenv").config(); // Load environment variables
const express = require("express");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
