const router = require("express").Router();
const {
  getQueries, getQueryById, createQuery,
  updateStatus, addResponse, deleteQuery
} = require("../controllers/queryController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect); // all query routes require auth

router.route("/")
  .get(getQueries)
  .post(createQuery);

router.route("/:id")
  .get(getQueryById)
  .delete(authorize("admin"), deleteQuery);

router.patch("/:id/status", authorize("admin", "faculty"), updateStatus);
router.post("/:id/respond", authorize("admin", "faculty"), addResponse);

module.exports = router;
