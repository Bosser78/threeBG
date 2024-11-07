const userRouter = require("../utils/route");
const {userController,upload} = require("../controller/userController");
const roleMiddleware = require("../middleware/roleMiddleware");

userRouter.get("/users", roleMiddleware(['USER', 'ADMIN']), userController.getUserBytoken); // อ่านผู้ใช้ทั้งหมด
userRouter.get("/users/:id",roleMiddleware(['USER', 'ADMIN']), userController.getUserById); // อ่านผู้ใช้ตาม id ทำตรงนี้
// userRouter.post("/users", userController.createUser); // สร้างผู้ใช้ใหม่
userRouter.put("/users/", roleMiddleware(['USER', 'ADMIN']), upload.single("file"), userController.updateUser); // อัปเดตข้อมูลผู้ใช้
userRouter.delete("/users/:id",  userController.deleteUser); // ลบผู้ใช้

module.exports = userRouter;
