require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cartRoutes = require("./routes/cartRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/cart", cartRoutes);


// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
