const jwt = require("jsonwebtoken");

const roleMiddleware = (roles) => {
    return (req, res, next) => {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            // ตรวจสอบว่า user มีบทบาทที่อนุญาตหรือไม่
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Access denied: insufficient permissions" });
            }
            next(); // อนุญาตให้ดำเนินการต่อไป
        } catch (error) {
            return res.status(403).json({ message: "Invalid token" });
        }
    };
};

module.exports = roleMiddleware;
