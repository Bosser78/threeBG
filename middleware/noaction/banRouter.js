const userRouter = require("../../utils/route");
const { banUser, unbanUser, listBannedUsers } = require("./banController");
const roleMiddleware = require("../roleMiddleware");

userRouter.post("/ban", banUser); // แบนผู้ใช้
userRouter.post("/unban", unbanUser); // ยกเลิกการแบนผู้ใช้
userRouter.get("/banned", listBannedUsers); // รายชื่อผู้ใช้ที่ถูกแบน

module.exports = userRouter;
