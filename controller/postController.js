const db = require("../utils/db");
const { ObjectId } = require("mongodb");
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

const postController = {
  // อ่านโพสต์ทั้งหมด
  getPosts: async (req, res) => {
    
console.log("posts");
    
    try {
    const posts = await db.post.findMany({
      include: {
        author: true, // ข้อมูลของผู้เขียนโพสต์
        category: true, // ข้อมูลหมวดหมู่
        comments: {
          include: {
            author: true, // รวมข้อมูลผู้ที่คอมเมนต์เพื่อดึง username มา
          },
        },
      },
    });
const postsWithPhotos = posts.map(post => {
  return {
    ...post,
    photoUrl: post.file ? `/uploads/${post.file}` : null, // ใช้ post.file แทน post.photo
  };
});



      res.status(200).json(postsWithPhotos);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" + error });
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
      const postsWithPhotos = posts.map(post => {
      return {
        ...post,
        photoUrl: post.file ? `/uploads/${post.file}` : null, // ใช้ post.file แทน post.photo
      };
    });
      res.status(200).json(postsWithPhotos);
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // สร้างโพสต์ใหม่
  createPost: async (req, res) => {
    try {
      const { title, content, authorId, categoryId } = req.body;
      const file = req.file;

      if (
        !ObjectId.isValid(authorId) ||
        (categoryId && !ObjectId.isValid(categoryId))
      ) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const newPost = await db.post.create({
        data: {
          title,
          content,
          authorId,
          categoryId,
          file: file ? file.filename : null,
        },
      });

      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // อัปเดตโพสต์
  updatePost: async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId } = req.body;
    const file = req.file;

    if (
      !ObjectId.isValid(id) ||
      (categoryId && !ObjectId.isValid(categoryId))
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // ค้นหาโพสต์ที่ต้องการอัปเดต
    const existingPost = await db.post.findUnique({ where: { id } });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ถ้ามีการอัปโหลดไฟล์ใหม่ ให้ลบไฟล์เดิมออก
    if (file && existingPost.file) {
      try {
        fs.unlinkSync(path.join("uploads", existingPost.file));
      } catch (error) {
        console.error("Error deleting old file:", error);
        return res.status(500).json({ message: "Failed to delete old file" });
      }
    }

    // อัปเดตโพสต์ในฐานข้อมูล
    const updatedPost = await db.post.update({
      where: { id },
      data: {
        title,
        content,
        categoryId,
        file: file ? file.filename : existingPost.file,
      },
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
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

      const postToDelete = await db.post.findUnique({ where: { id } });

      if (!postToDelete) {
        return res.status(404).json({ message: "Post not found" });
      }

     
      // if (postToDelete.file) {
      //   fs.unlinkSync(path.join({ id }, postToDelete.file));
      // }

      await db.post.delete({ where: { id } });

      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },

  // ดึงโพสต์ของผู้ใช้
  getUserPosts: async (req, res) => {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID is missing" });
      }

      const posts = await db.post.findMany({
        where: { authorId: userId },
        include: { author: true, category: true, comments: true },
      });

      if (!posts || posts.length === 0) {
        return res.status(404).json({ message: "No posts found for this user" });
      }

      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },


    getPostsByCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const posts = await db.post.findMany({
        where: { categoryId: id },
      });

      if (!posts.length) {
        return res.status(404).json({ message: "No posts found for this category" });
      }

      res.status(200).json(posts);
    } catch (error) {
      console.error("Error retrieving posts by category:", error);
      res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
    }
  },





};

// export ทั้ง postController และ middleware upload
module.exports = { postController, upload };
