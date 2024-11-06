
const categoryrouter = require("../utils/route");

const categoryController = require("../controller/categoryController");

// const {authMiddleware} = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");




categoryrouter.get("/categories",categoryController.getCategories); // อ่านหมวดหมู่ทั้งหมด
categoryrouter.post("/categories", roleMiddleware(['ADMIN']),categoryController.createCategory); // สร้างหมวดหมู่ใหม่
categoryrouter.put("/categories/:id", roleMiddleware(['ADMIN']),categoryController.updateCategory); // อัปเดตหมวดหมู่
categoryrouter.delete("/categories/:id",  roleMiddleware(['ADMIN']), categoryController.deleteCategory); // ลบหมวดหมู่

module.exports = categoryrouter;


