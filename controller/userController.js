const db = require("../utils/db");
const { ObjectId } = require("mongodb");

const userController = {
  // อ่านผู้ใช้ทั้งหมด
  getUsers: async (req, res) => {
    try {
      const users = await db.user.findMany(); // หรือ db.user.find() ขึ้นอยู่กับ ORM ที่ใช้
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // อ่านผู้ใช้ตาม ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      // ตรวจสอบว่า ID ถูกต้องหรือไม่
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const user = await db.user.findUnique({
        where: { id }, // หรือใช้ findById ขึ้นอยู่กับ ORM ที่ใช้
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // สร้างผู้ใช้ใหม่
  createUser: async (req, res) => {
    try {
      const { username, password, role } = req.body;

      // ตรวจสอบว่าได้รับข้อมูลที่ต้องการครบถ้วนหรือไม่
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // สร้างผู้ใช้ใหม่ในฐานข้อมูล
      const newUser = await db.user.create({
        data: { username, password, role },
      });

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // อัปเดตข้อมูลผู้ใช้
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, role } = req.body;

      // ตรวจสอบว่า ID ถูกต้องหรือไม่
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // อัปเดตข้อมูลผู้ใช้
      const updatedUser = await db.user.update({
        where: { id },
        data: { username, password, role },
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // ลบผู้ใช้
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // ตรวจสอบว่า ID ถูกต้องหรือไม่
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // ลบโพสต์ทั้งหมดที่ผู้ใช้สร้าง
      await db.post.deleteMany({
        where: { authorId: id }, // ลบโพสต์ทั้งหมดที่มี authorId ตรงกับ user ที่ลบ
      });

      // ลบคอมเมนต์ทั้งหมดที่เกี่ยวข้องกับผู้ใช้
      await db.comment.deleteMany({
        where: { userId: id }, // ลบคอมเมนต์ทั้งหมดที่มี userId ตรงกับ user ที่ลบ
      });

      // ลบผู้ใช้
      const deletedUser = await db.user.delete({
        where: { id }, // ลบผู้ใช้จากฐานข้อมูล
      });

      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User and related data deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  }, deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // ตรวจสอบว่า ID ถูกต้องหรือไม่
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      // ลบโพสต์ทั้งหมดที่ผู้ใช้สร้าง
      await db.post.deleteMany({
        where: { authorId: id }, // ลบโพสต์ทั้งหมดที่มี authorId ตรงกับ user ที่ลบ
      });

      // ลบคอมเมนต์ทั้งหมดที่เกี่ยวข้องกับผู้ใช้
      await db.comment.deleteMany({
        where: { authorId: id }, // ลบคอมเมนต์ทั้งหมดที่มี authorId ตรงกับ user ที่ลบ
      });

      // ลบผู้ใช้
      const deletedUser = await db.user.delete({
        where: { id }, // ลบผู้ใช้จากฐานข้อมูล
      });

      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User and related data deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  }
};

module.exports = userController;
