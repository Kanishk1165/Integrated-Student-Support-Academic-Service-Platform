const router = require("express").Router();
const { getProfile, updateProfile, getAllUsers, toggleActive } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/", authorize("admin"), getAllUsers);
router.patch("/:id/toggle-active", authorize("admin"), toggleActive);

module.exports = router;
