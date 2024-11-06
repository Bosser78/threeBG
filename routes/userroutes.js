const userRouter = require("../utils/route");
const userController = require("../controller/userController");
const roleMiddleware = require("../middleware/roleMiddleware");

userRouter.get("/users", roleMiddleware(['ADMIN']), userController.getUsers); // อ่านผู้ใช้ทั้งหมด
userRouter.get("/users/:id", roleMiddleware(['ADMIN']), userController.getUserById); // อ่านผู้ใช้ตาม id
// userRouter.post("/users", userController.createUser); // สร้างผู้ใช้ใหม่
userRouter.put("/users/:id", roleMiddleware(['ADMIN']), userController.updateUser); // อัปเดตข้อมูลผู้ใช้
userRouter.delete("/users/:id",  userController.deleteUser); // ลบผู้ใช้

module.exports = userRouter;
