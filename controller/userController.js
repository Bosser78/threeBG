const db = require("../utils/db");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const multer = require("multer");
const fs = require("fs");
const path = require("path");

// กำหนดการจัดเก็บไฟล์ในโฟลเดอร์ "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const userController = {
  // อ่านผู้ใช้ทั้งหมด
  getUsers: async (req, res) => {
    try {
      const users = await db.user.findMany();

      const usersWithPhotos = users.map(user => {
        return {
          ...user,
          photoUrl: user.photo ? `/uploads/${user.photo}` : null,
        };
      });

      res.status(200).json(usersWithPhotos);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // อ่านผู้ใช้ตาม ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const user = await db.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        ...user,
        photoUrl: user.photo ? `/uploads/${user.photo}` : null,
      });
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  getUserBytoken: async (req, res) => {
    try {
    // ตรวจสอบ token จาก header
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      // ถอดรหัส token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;  // เก็บข้อมูลของ user ใน request
      console.log(req.user);
      // ตรวจสอบบทบาท (roles) ที่อนุญาต
      // const allowedRoles = ["admin", "user"];  // เพิ่มบทบาทที่อนุญาตในที่นี้
      // if (!allowedRoles.includes(decoded.role)) {
      //   console.log(decoded.role);
      //   return res.status(403).json({ message: "Access denied: insufficient permissions" });
      // }

      // ค้นหาผู้ใช้จากฐานข้อมูล โดยใช้ ID ที่มาจาก decoded token
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // ส่งข้อมูลของผู้ใช้กลับ
      res.status(200).json({
        ...user,
        photoUrl: user.photo ? `/uploads/${user.photo}` : null,  // ถ้ามี photo ให้แปลง URL
      });

    } catch (error) {
      return res.status(403).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
  },

  // สร้างผู้ใช้ใหม่
  createUser: async (req, res) => {
    try {
      const { username, password, role } = req.body;
      const file = req.file;

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newUser = await db.user.create({
        data: {
          username,
          password,
          role,
          photo: file ? file.filename : null, // เก็บชื่อไฟล์ภาพ
        },
      });

      res.status(201).json({
        ...newUser,
        photoUrl: newUser.photo ? `/uploads/${newUser.photo}` : null,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // อัปเดตข้อมูลผู้ใช้
updateUser: async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.userId = decoded.userId;
    } catch (error) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const id = req.userId;
    const { username, password } = req.body;
    const file = req.file;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const existingUser = await db.user.findUnique({ where: { id } });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ลบไฟล์รูปภาพเดิมหากมีการอัปโหลดรูปภาพใหม่
    if (file && existingUser.photo) {
      const photoPath = path.join("uploads", existingUser.photo);
      try {
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      } catch (error) {
        console.error("Error deleting old file:", error);
        return res.status(500).json({ message: "Failed to delete old file" });
      }
    }

    // เข้ารหัสรหัสผ่านใหม่เฉพาะในกรณีที่ส่งรหัสผ่านมาใน body
    let hashedPassword = existingUser.password;
  console.log(password);
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        username,
        password: hashedPassword,
        photo: file ? file.filename : existingUser.photo,
      },
    });

    res.status(200).json({
      ...updatedUser,
      photoUrl: updatedUser.photo ? `/uploads/${updatedUser.photo}` : null,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
},


  // ลบผู้ใช้
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const userToDelete = await db.user.findUnique({ where: { id } });

      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }

      // ลบไฟล์ที่เกี่ยวข้องกับผู้ใช้
      if (userToDelete.photo) {
        fs.unlinkSync(path.join("uploads", userToDelete.photo));
      }

      await db.user.delete({ where: { id } });

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },
};

// export ทั้ง userController และ middleware upload
module.exports = { userController, upload };
