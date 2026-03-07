const router = require("express").Router();
const { getOverview, getByCategory, getResponseTime, getMonthly } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin", "faculty"));
router.get("/overview",       getOverview);
router.get("/by-category",    getByCategory);
router.get("/response-time",  getResponseTime);
router.get("/monthly",        getMonthly);

module.exports = router;
