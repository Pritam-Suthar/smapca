require("dotenv").config(); // Load environment variables
const express = require("express");
const bodyParser = require("body-parser");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
app.use(bodyParser());

app.use("/cart", cartRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
