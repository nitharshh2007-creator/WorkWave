const express = require("express");
const { getDashboardData, getEmployerDashboardData } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getDashboardData);
router.get("/employer", protect, getEmployerDashboardData);

module.exports = router;
