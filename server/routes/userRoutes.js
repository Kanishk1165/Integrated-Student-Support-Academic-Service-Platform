const router = require("express").Router();
const { 
  getProfile, 
  updateProfile, 
  getAllUsers, 
  toggleActive,
  getPendingFaculty,
  getFacultyList,
  approveFaculty,
  rejectFaculty,
  createUser
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/", authorize("admin"), getAllUsers);
router.get("/faculty", getFacultyList);
router.get("/pending-faculty", authorize("admin"), getPendingFaculty);
router.patch("/approve", authorize("admin"), approveFaculty);
router.patch("/reject", authorize("admin"), rejectFaculty);
// Add endpoint for admin to create users
router.post("/create", authorize("admin"), createUser);

module.exports = router;
