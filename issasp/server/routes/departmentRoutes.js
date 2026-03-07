const router = require("express").Router();
const { getAll, create, update, remove } = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getAll);
router.post("/", authorize("admin"), create);
router.patch("/:id", authorize("admin"), update);
router.delete("/:id", authorize("admin"), remove);

module.exports = router;
