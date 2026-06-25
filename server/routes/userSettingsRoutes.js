const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userSettingsController = require('../controllers/userSettingsController');
const { protect } = require('../middleware/authMiddleware');

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
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

router.get('/', userSettingsController.getSettings);
router.patch('/profile', userSettingsController.updateProfile);
router.patch('/change-password', userSettingsController.changePassword);
router.patch('/notifications', userSettingsController.updateNotifications);
router.patch('/privacy', userSettingsController.updatePrivacy);
router.patch('/hiring-preferences', userSettingsController.updateHiringPreferences);
router.patch('/appearance', userSettingsController.updateAppearance);
router.patch('/integrations', userSettingsController.updateIntegrations);
router.get('/sessions', userSettingsController.getSessions);
router.delete('/sessions/:id', userSettingsController.deleteSession);
router.get('/export/:type', userSettingsController.exportData);
router.post('/resume', upload.single('resume'), userSettingsController.updateResume);
router.delete('/resume', userSettingsController.removeResume);
router.post('/logout-all', userSettingsController.logoutAllDevices);
router.delete('/account', userSettingsController.deleteAccount);

module.exports = router;