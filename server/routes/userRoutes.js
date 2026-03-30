const router = require("express").Router();
const { 
  getProfile, 
  updateProfile, 
  getAllUsers, 
  toggleActive,
  getPendingFaculty,
  getFacultyList,
  approveFaculty,
  rejectFaculty
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/", authorize("admin"), getAllUsers);
router.get("/faculty", getFacultyList); // Available to all authenticated users
router.get("/pending-faculty", authorize("admin"), getPendingFaculty);
router.patch("/:id/approve", authorize("admin"), approveFaculty);
router.patch("/:id/reject", authorize("admin"), rejectFaculty);
router.patch("/:id/toggle-active", authorize("admin"), toggleActive);

module.exports = router;
