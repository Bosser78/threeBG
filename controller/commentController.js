const db = require("../utils/db");
const { ObjectId } = require('mongodb');

const commentController = {
    // ดึงความคิดเห็นทั้งหมด
    getComments: async (req, res) => {
        try {
            const comments = await db.comment.findMany({
                include: { author: true, post: true }
            });
            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    },

    // ดึงความคิดเห็นตาม ID
    getCommentById: async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }

            const comment = await db.comment.findUnique({
                where: { id },
                include: { author: true, post: true }
            });

            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            res.status(200).json(comment);
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    },

    // สร้างความคิดเห็นใหม่
    createComment: async (req, res) => {
        try {
            const { content, authorId, postId } = req.body;

            if (!ObjectId.isValid(authorId) || !ObjectId.isValid(postId)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }

            const newComment = await db.comment.create({
                data: { content, authorId, postId }
            });

            res.status(201).json(newComment);
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    },

    // อัปเดตความคิดเห็น
    updateComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }

            const updatedComment = await db.comment.update({
                where: { id },
                data: { content }
            });

            if (!updatedComment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            res.status(200).json(updatedComment);
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    },

    // ลบความคิดเห็น
    deleteComment: async (req, res) => {
        try {
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid ID format" });
            }

            const deletedComment = await db.comment.delete({
                where: { id }
            });

            if (!deletedComment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            res.status(200).json({ message: "Comment deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    }
};

module.exports = commentController;
