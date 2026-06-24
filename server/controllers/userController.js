const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');

// Multer configuration for image and resume uploads (local storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${req.user.id}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed for profile picture'), false);
      }
    } else if (file.fieldname === 'resume') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed for resume'), false);
      }
    }
    cb(null, true);
  },
});

// Helper to calculate profile strength on the fly
const calculateProfileStrength = (user) => {
  let score = 0;
  if (user.profilePicture) score += 10;
  if (user.name) score += 10;
  if (user.email) score += 10;
  if (user.phone) score += 10;
  if (user.location) score += 10;
  if (user.bio) score += 15;
  if (user.resumeUrl) score += 20;
  if (Array.isArray(user.skills) && user.skills.length > 0) score += 15;
  return score;
};

// @desc    Get authenticated user's profile data
// @route   GET /api/user/profile
// @access  Protected
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const applicationsCount = await Application.countDocuments({ candidate: req.user.id });
    const savedJobsCount = await SavedJob.countDocuments({ user: req.user.id });
    const profileStrength = calculateProfileStrength(user);

    res.json({
      ...user.toObject(),
      applicationsCount,
      savedJobsCount,
      profileStrength,
    });
  } catch (err) {
    console.error('GetProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update authenticated user's profile fields
// @route   PATCH /api/user/profile
// @access  Protected
const updateProfile = async (req, res) => {
  const { name, email, phone, location, bio, skills, professionalTitle, profileVisibility } = req.body;
  const update = {};
  
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (phone !== undefined) update.phone = phone;
  if (location !== undefined) update.location = location;
  if (bio !== undefined) update.bio = bio;
  if (Array.isArray(skills)) update.skills = skills;
  if (professionalTitle !== undefined) update.professionalTitle = professionalTitle;
  if (profileVisibility !== undefined) update.profileVisibility = profileVisibility;
  update.lastUpdated = Date.now();

  try {
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const applicationsCount = await Application.countDocuments({ candidate: req.user.id });
    const savedJobsCount = await SavedJob.countDocuments({ user: req.user.id });
    const profileStrength = calculateProfileStrength(user);

    res.json({
      ...user.toObject(),
      applicationsCount,
      savedJobsCount,
      profileStrength,
    });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile picture (single file)
// @route   POST /api/user/upload-picture
// @access  Protected
const uploadPicture = [protect, upload.single('profilePicture'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const pictureUrl = `/uploads/${req.file.filename}`;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: pictureUrl, lastUpdated: Date.now() },
      { new: true }
    ).select('-password');

    const applicationsCount = await Application.countDocuments({ candidate: req.user.id });
    const savedJobsCount = await SavedJob.countDocuments({ user: req.user.id });
    const profileStrength = calculateProfileStrength(user);

    res.json({
      url: pictureUrl,
      user: {
        ...user.toObject(),
        applicationsCount,
        savedJobsCount,
        profileStrength,
      }
    });
  } catch (err) {
    console.error('UploadPicture error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}];

// @desc    Upload resume PDF (single file)
// @route   POST /api/user/upload-resume
// @access  Protected
const uploadResume = [protect, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No resume uploaded' });
  
  // PDF Validation (double-check mimetype on backend)
  if (req.file.mimetype !== 'application/pdf') {
    // Delete file if saved by multer storage before filter
    try { fs.unlinkSync(req.file.path); } catch (e) {}
    return res.status(400).json({ message: 'Only PDF files are allowed for resume' });
  }

  const resumeUrl = `/uploads/${req.file.filename}`;
  const resumeFileName = req.file.originalname;
  const resumeFileSize = req.file.size;
  const resumeUploadedAt = Date.now();

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resumeUrl,
        resumeFileName,
        resumeFileSize,
        resumeUploadedAt,
        lastUpdated: Date.now()
      },
      { new: true }
    ).select('-password');

    const applicationsCount = await Application.countDocuments({ candidate: req.user.id });
    const savedJobsCount = await SavedJob.countDocuments({ user: req.user.id });
    const profileStrength = calculateProfileStrength(user);

    res.json({
      resumeUrl,
      fileName: resumeFileName,
      uploadedAt: resumeUploadedAt,
      fileSize: resumeFileSize,
      user: {
        ...user.toObject(),
        applicationsCount,
        savedJobsCount,
        profileStrength,
      }
    });
  } catch (err) {
    console.error('UploadResume error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}];

// @desc    Delete resume PDF
// @route   DELETE /api/user/resume
// @access  Protected
const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Unlink the file from uploads if it exists
    if (user.resumeUrl) {
      const filePath = path.join(__dirname, '..', user.resumeUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to delete file:', e);
        }
      }
    }

    // Clear resume metadata in db
    user.resumeUrl = undefined;
    user.resumeFileName = undefined;
    user.resumeFileSize = undefined;
    user.resumeUploadedAt = undefined;
    user.lastUpdated = Date.now();
    await user.save();

    const applicationsCount = await Application.countDocuments({ candidate: req.user.id });
    const savedJobsCount = await SavedJob.countDocuments({ user: req.user.id });
    const profileStrength = calculateProfileStrength(user);

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      message: 'Resume deleted successfully',
      user: {
        ...userObj,
        applicationsCount,
        savedJobsCount,
        profileStrength,
      }
    });
  } catch (err) {
    console.error('DeleteResume error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get profile completion stats
// @route   GET /api/user/profile-completion
// @access  Protected
const getProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const percent = calculateProfileStrength(user);
    res.json({ profileCompletion: percent });
  } catch (err) {
    console.error('ProfileCompletion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadPicture,
  uploadResume,
  deleteResume,
  getProfileCompletion,
};
