const express = require('express');
const router = express.Router();
const { 
  getMyApplications, 
  createApplication, 
  deleteApplication,
  getEmployerApplications,
  updateApplicationStatus,
  updateApplicationNotes,
  scheduleInterview,
  cancelInterview,
  completeInterview,
  hireCandidate,
  rejectCandidate,
  reviewApplication,
  shortlistApplication,
  getApplicationsByCandidate,
  getApplicationsByJob,
  getApplicationsByEmployer
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected, so we can use the middleware at the top level
router.use(protect);

router.route('/')
    .post(createApplication);

router.route('/my')
    .get(getMyApplications);

router.route('/employer')
    .get(getEmployerApplications);

router.route('/candidate/:candidateId')
    .get(getApplicationsByCandidate);

router.route('/job/:jobId')
    .get(getApplicationsByJob);

router.route('/employer/:employerId')
    .get(getApplicationsByEmployer);

router.route('/:id/status')
    .patch(updateApplicationStatus);

router.route('/:id/notes')
    .patch(updateApplicationNotes);

router.route('/:id/interview')
    .patch(scheduleInterview);

router.route('/:id/interview/cancel')
    .patch(cancelInterview);

router.route('/:id/interview/complete')
    .patch(completeInterview);

router.route('/:id/hire')
    .patch(hireCandidate);

router.route('/:id/reject')
    .patch(rejectCandidate);

router.route('/:id/review')
    .patch(reviewApplication);

router.route('/:id/shortlist')
    .patch(shortlistApplication);

router.route('/:id')
    .delete(deleteApplication);

module.exports = router;