const db = require("../utils/db");
const jwt = require("jsonwebtoken");

const categoryController = {
    getCategories: async (req, res) => {
        try {
            const categories = await db.category.findMany();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    },

    createCategory: async (req, res) => {
        try {
            const { name } = req.body;
            const newCategory = await db.category.create({
                data: { name },
            });
            res.status(201).json(newCategory);
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            
            const updatedCategory = await db.category.update({
                where: { id },
                data: { name },
            });
            console.log(updatedCategory);    
            if (!updatedCategory) {
                return res.status(404).json({ message: "Category not found" });
            }

            res.status(200).json(updatedCategory);
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            const deletedCategory = await db.category.delete({
                where: { id },
            });
            console.log(deletedCategory);
            if (!deletedCategory) {
                return res.status(404).json({ message: "Category not found" });
            }

            res.status(200).json({ message: "Category deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
        }
    },
};

module.exports = categoryController;