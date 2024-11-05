const jwt = require("jsonwebtoken");
const {z} = require("zod");

const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || decoded.role !== "ADMIN") {
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }
        req.user = decoded; // สามารถเก็บข้อมูลผู้ใช้ใน req.user ได้
        next(); // ส่งต่อไปยัง middleware ถัดไป
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// รวม Schema และ Middleware สำหรับ validate ด้วย Zod
const validateUsermiddleware = (req, res, next) => {
  // กำหนด Zod Schema สำหรับตรวจสอบข้อมูล
  const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  try {
    userSchema.parse(req.body); // ตรวจสอบข้อมูลใน body
    next(); // ถ้าผ่านการตรวจสอบ เดินหน้าไปยัง controller
  } catch (error) {
    res.status(400).json({ error: error.errors.map((e) => e.message) });
    console.log({ error: error.errors.map((e) => e.message)+ "data error" });
  }
};

module.exports = {authMiddleware, validateUsermiddleware};
