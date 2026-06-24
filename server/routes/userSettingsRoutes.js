const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getSettings,
  updateProfile,
  changePassword,
  updateNotifications,
  updatePrivacy,
  updateResume,
  removeResume,
  logoutAllDevices,
  deleteAccount,
} = require('../controllers/userSettingsController');
const { protect } = require('../middleware/authMiddleware'); // Assuming path

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/resumes/');
  },
  filename: function (req, file, cb) {
    cb(null, `resume-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    }
});

router.use(protect);

router.get('/', getSettings);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);
router.patch('/notifications', updateNotifications);
router.patch('/privacy', updatePrivacy);
router.post('/resume', upload.single('resume'), updateResume);
router.delete('/resume', removeResume);
router.post('/logout-all', logoutAllDevices);
router.delete('/account', deleteAccount);

module.exports = router;