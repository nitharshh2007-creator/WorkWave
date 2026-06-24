const express = require('express');
const router = express.Router();
const { getMyApplications, createApplication, deleteApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware'); // Assuming path

// All routes in this file are protected, so we can use the middleware at the top level
router.use(protect);

router.route('/')
    .post(createApplication);

router.route('/my')
    .get(getMyApplications);

router.route('/:id')
    .delete(deleteApplication);

module.exports = router;