const db = require("../../utils/db");

// แบนผู้ใช้
const banUser = async (req, res) => {
  const { email } = req.body;
  try {
    // ตรวจสอบว่าผู้ใช้อยู่ใน blacklist หรือยัง
    const existingUser = await db.blacklist.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User is already banned" });
    }

    // แบนผู้ใช้โดยเพิ่มลงใน blacklist
    const bannedUser = await db.blacklist.create({
      data: {
        email: email, // ใช้ email ที่รับจากคำขอ
      },
    });

    res.status(200).json({ message: "User banned successfully", bannedUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while banning user", error });
  }
};

// ยกเลิกการแบนผู้ใช้
const unbanUser = async (req, res) => {
  const { email } = req.body;

  try {
    // ตรวจสอบว่าผู้ใช้มีอยู่ใน blacklist หรือไม่
    const bannedUser = await db.blacklist.findUnique({
      where: { email },
    });

    if (!bannedUser) {
      return res.status(404).json({ message: "User not found in blacklist" });
    }

    // ยกเลิกการแบนโดยลบออกจาก blacklist
    await db.blacklist.delete({
      where: { email },
    });

    res.status(200).json({ message: "User unbanned successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while unbanning user", error });
  }
};

// รายชื่อผู้ใช้ที่ถูกแบน
const listBannedUsers = async (req, res) => {
  try {
    const bannedUsers = await db.blacklist.findMany();

    res.status(200).json({ bannedUsers });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching banned users",
        error,
      });
  }
};

module.exports = { banUser, unbanUser, listBannedUsers };
