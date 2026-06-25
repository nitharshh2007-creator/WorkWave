const express = require('express');
const router = express.Router();
const { getOverview, getTrends, getJobPerformance, getReports } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes under analytics
router.use(protect);

router.get('/employer/overview', getOverview);
router.get('/employer/trends', getTrends);
router.get('/employer/job-performance', getJobPerformance);
router.get('/employer/reports', getReports);
router.get('/employer/report', getOverview); // PDF report data

module.exports = router;
