const router = require("express").Router();
const { body } = require("express-validator");
const { register, login, getMe, updatePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
], register);

router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/update-password", protect, updatePassword);

module.exports = router;
