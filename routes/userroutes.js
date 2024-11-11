const userRouter = require("../utils/route");
const {userController,upload} = require("../controller/userController");
const roleMiddleware = require("../middleware/roleMiddleware");
const { user } = require("../utils/db");

userRouter.get("/users", roleMiddleware(['USER', 'ADMIN']), userController.getUserBytoken); // อ่านผู้ใช้ทั้งหมด
userRouter.get("/users/:id",roleMiddleware(['USER', 'ADMIN']), userController.getUserById); // อ่านผู้ใช้ตาม id ทำตรงนี้
// userRouter.post("/users", userController.createUser); // สร้างผู้ใช้ใหม่
userRouter.put("/users/", roleMiddleware(['USER', 'ADMIN']), upload.single("file"), userController.updateUser); // อัปเดตข้อมูลผู้ใช้
userRouter.delete("/users/:id",  userController.deleteUser); // ลบผู้ใช้
 userRouter.get("/alluser",roleMiddleware([ 'ADMIN']), userController.alluser);



userRouter.post("/ban", roleMiddleware([ 'ADMIN']),userController.banUser); // แบนผู้ใช้
userRouter.post("/unban", roleMiddleware([ 'ADMIN']),userController.unbanUser); // ยกเลิกการแบนผู้ใช้
userRouter.get("/banned",roleMiddleware([ 'ADMIN']), userController.listBannedUsers); // รายชื่อผู้ใช้ที่ถูกแบน

module.exports = userRouter;
