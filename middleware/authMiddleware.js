const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header

    if (!token) {
        return res.status(401).json({ error: "Unauthorized, token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
}

module.exports = { authenticateUser };
