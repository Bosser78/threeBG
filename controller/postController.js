const db = require("../utils/db");
const { ObjectId } = require("mongodb");

const postController = {
  // อ่านโพสต์ทั้งหมด
  getPosts: async (req, res) => {
    try {
      const posts = await db.post.findMany({
        include: { author: true, category: true, comments: true },
      });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // อ่านโพสต์เฉพาะโดยใช้ id
  getPostById: async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const post = await db.post.findUnique({
        where: { id },
        include: { author: true, category: true, comments: true },
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // สร้างโพสต์ใหม่
  createPost: async (req, res) => {
    try {
      const { title, content, authorId, categoryId } = req.body;

      if (
        !ObjectId.isValid(authorId) ||
        (categoryId && !ObjectId.isValid(categoryId))
      ) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      console.log({ title, content, authorId, categoryId });

      const newPost = await db.post.create({
        data: { title, content, authorId, categoryId },
      });

      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error); // เพิ่มการแสดง error
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // อัปเดตโพสต์
  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, categoryId } = req.body;

      if (
        !ObjectId.isValid(id) ||
        (categoryId && !ObjectId.isValid(categoryId))
      ) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const updatedPost = await db.post.update({
        where: { id },
        data: { title, content, categoryId },
      });

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // ลบโพสต์
  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const deletedPost = await db.post.delete({
        where: { id },
      });

      if (!deletedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  getUserPosts: async (req, res) => {
    try {
      // ตรวจสอบว่า req.user.id มีค่า
      const userId = req.user.userId;
      console.log(userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is missing" });
      }

      // ดึงโพสต์ของผู้ใช้จากฐานข้อมูล
      const posts = await db.post.findMany({
        where: { authorId: userId }, // ใช้ authorId เพื่อกรองโพสต์ของผู้ใช้
        include: { author: true, category: true, comments: true }, // รวมข้อมูลที่เกี่ยวข้อง
      });

      // ถ้าไม่พบโพสต์
      if (!posts || posts.length === 0) {
        return res
          .status(404)
          .json({ message: "No posts found for this user" });
      }

      res.status(200).json(posts); // ส่งโพสต์ของผู้ใช้กลับไป
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = postController;
