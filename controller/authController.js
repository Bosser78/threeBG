const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../utils/db");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
// const multer = require("multer");
// const path = require("path");



const generateToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      userId: user.id,
      role: user.role,
      
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
      algorithm: "HS256",
    }
  );
};

const generateRefetchToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      userId: user.id,
      role: user.role,
      
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1y",
      algorithm: "HS256",
    }
  );
};

const authController = {
  register: async (req, res) => {
    const { username, email, password ,role} = req.body;
    // ตรวจสอบ email แบน
    const blacklist = await db.blacklist.findFirst({ where: { email } });
    console.log(blacklist+"blacklist");

    if (blacklist) {
      return res.status(400).json({ message: "Email BANNED" });
    }
    // ตรวจสอบผู้ใช้ซ้ำ
    const existingemail = await db.user.findUnique({ where: { email } });
    if (existingemail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingUser = await db.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "username already exists" });
    }
    

    // แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);


    // สร้างผู้ใช้ใหม่
    const user = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role ,
      },
    });

    const accessToken = generateToken(user);
    const refreshToken = generateRefetchToken(user);
    

    res.status(201).json({ accessToken, refreshToken });
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    // ค้นหาผู้ใช้
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefetchToken(user);
    const role = user.role;
    const userid = user.id;
    const username = user.username;
    const emailL = user.email;
    const photo = user.photo
    res.json({ accessToken, refreshToken,role,userid,username,emailL,photo});
  },
logoutController: async (req, res) => {
  try {
    // สมมติว่าคุณต้องการอัปเดตสถานะของผู้ใช้ในฐานข้อมูล
    // const user = await db.user.update({
    //   where: { username: req.user?.username },
    //   data: { refreshtoken: null, accesstoken: null },
    // });

    // ตรวจสอบว่ามีผู้ใช้ที่อัปเดตจริงหรือไม่
    // if (!user) throw new Error("Logout error!!");

    // ส่งคำตอบสำเร็จ
    res.status(200).json({ message: "Logout successful", accessToken: null, refreshToken: null, role: null });
  } catch (error) {
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
}
,
};

module.exports = authController;
