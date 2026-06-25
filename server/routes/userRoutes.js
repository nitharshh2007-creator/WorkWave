const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  uploadPicture,
  uploadResume,
  deleteResume,
  getProfileCompletion,
  getSavedJobs,
  saveJob,
  unsaveJob,
} = require('../controllers/userController');

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/upload-picture', uploadPicture);
router.post('/upload-resume', uploadResume);
router.delete('/resume', deleteResume);
router.get('/profile-completion', getProfileCompletion);

// Saved Jobs Endpoints
router.get('/saved-jobs', getSavedJobs);
router.post('/saved-jobs', saveJob);
router.delete('/saved-jobs/:jobId', unsaveJob);

module.exports = router;
