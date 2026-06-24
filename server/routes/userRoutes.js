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
} = require('../controllers/userController');

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/upload-picture', uploadPicture);
router.post('/upload-resume', uploadResume);
router.delete('/resume', deleteResume);
router.get('/profile-completion', getProfileCompletion);

module.exports = router;
