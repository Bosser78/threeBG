const router = require("../utils/route");
const authController = require("../controller/authController");
const {authMiddleware,validateUsermiddleware} = require("../middleware/authMiddleware");

router.get("/hel2lo", (req, res) => {
  return res.status(200).send(`Hello Auth by token`);
});



router.post("/register",validateUsermiddleware,authController.register);

router.post("/login",validateUsermiddleware,authController.login);

router.post("/logout",authMiddleware, authController.logoutController);


module.exports = router;

