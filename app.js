require("dotenv").config(); // Load environment variables
const express = require("express");
// const bodyParser = require("body-parser");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
// app.use(bodyParser());
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/cart", cartRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
