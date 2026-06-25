const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// @desc    Get user settings
// @route   GET /api/user/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const settings = user.toObject();
    settings.resume = {
      fileName: user.resumeFileName || '',
      url: user.resumeUrl ? `http://localhost:5000${user.resumeUrl}` : '',
      uploadedAt: user.resumeUploadedAt || ''
    };
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile settings
// @route   PATCH /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedFields = [
      'name', 'phone', 'college', 'department', 'graduationYear', 
      'linkedinUrl', 'githubUrl', 'portfolioUrl', 'recruiterName', 
      'companyEmail', 'website', 'headquarters', 'recruiterPosition', 
      'recruiterEmail', 'recruiterPhone', 'location'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// @desc    Change user password
// @route   PATCH /api/user/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.jwtVersion = (user.jwtVersion || 0) + 1; // invalidate other tokens/sessions on change password
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notification preferences
// @route   PATCH /api/user/settings/notifications
// @access  Private
exports.updateNotifications = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notifications: req.body },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update privacy settings
// @route   PATCH /api/user/settings/privacy
// @access  Private
exports.updatePrivacy = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { privacy: req.body },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.privacy);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update hiring preferences
// @route   PATCH /api/user/settings/hiring-preferences
// @access  Private
exports.updateHiringPreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { hiringPreferences: req.body },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.hiringPreferences);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update appearance settings
// @route   PATCH /api/user/settings/appearance
// @access  Private
exports.updateAppearance = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { appearance: req.body },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.appearance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update integrations settings
// @route   PATCH /api/user/settings/integrations
// @access  Private
exports.updateIntegrations = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { integrations: req.body },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.integrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get active sessions
// @route   GET /api/user/settings/sessions
// @access  Private
exports.getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    const ip = req.ip || '127.0.0.1';
    
    let browser = 'Chrome';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let device = 'Windows Desktop';
    if (userAgent.includes('Macintosh')) device = 'macOS Desktop';
    else if (userAgent.includes('Linux')) device = 'Linux Desktop';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) device = 'iOS Device';
    else if (userAgent.includes('Android')) device = 'Android Device';

    const currentSession = {
      id: 'current',
      device: device,
      browser: browser,
      loginTime: new Date(Date.now() - 3600000).toISOString(),
      lastActive: new Date().toISOString(),
      current: true,
      ip: ip
    };

    const sessions = [currentSession];
    if ((user.jwtVersion || 0) === 0) {
      sessions.push({
        id: 'other_device',
        device: 'iOS Device',
        browser: 'Safari',
        loginTime: new Date(Date.now() - 86400000).toISOString(),
        lastActive: new Date(Date.now() - 7200000).toISOString(),
        current: false,
        ip: '192.168.1.45'
      });
    }
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout session / other devices
// @route   DELETE /api/user/settings/sessions/:id
// @access  Private
exports.deleteSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.jwtVersion = (user.jwtVersion || 0) + 1;
    await user.save();
    res.json({ message: 'Logged out successfully from other devices' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export company details, jobs, or applicant data
// @route   GET /api/user/settings/export/:type
// @access  Private
exports.exportData = async (req, res) => {
  const { type } = req.params;
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let exportContent = '';
    let filename = '';

    if (type === 'profile') {
      exportContent = JSON.stringify(user, null, 2);
      filename = 'company_profile.json';
    } else if (type === 'jobs') {
      const jobs = await Job.find({ createdBy: user._id });
      exportContent = JSON.stringify(jobs, null, 2);
      filename = 'job_listings.json';
    } else if (type === 'applicants') {
      const myJobs = await Job.find({ createdBy: user._id });
      const jobIds = myJobs.map(j => j._id);
      const applicants = await Application.find({ job: { $in: jobIds } })
        .populate('user', 'name email phone')
        .populate('job', 'title department');
      exportContent = JSON.stringify(applicants, null, 2);
      filename = 'applicant_data.json';
    } else {
      return res.status(400).json({ message: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(exportContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Export failed' });
  }
};

// @desc    Upload or update resume
// @route   POST /api/user/resume
// @access  Private
exports.updateResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.file) {
      if (user.resumeUrl) {
        const oldPath = path.join(__dirname, '..', user.resumeUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      user.resumeUrl = `/uploads/${req.file.filename}`;
      user.resumeFileName = req.file.originalname;
      user.resumeUploadedAt = new Date();
      user.resumeFileSize = req.file.size;

      await user.save();
      res.json({
        fileName: user.resumeFileName,
        url: user.resumeUrl ? `http://localhost:5000${user.resumeUrl}` : '',
        uploadedAt: user.resumeUploadedAt
      });
    } else {
      res.status(400).json({ message: 'Please upload a file' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove resume
// @route   DELETE /api/user/resume
// @access  Private
exports.removeResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.resumeUrl) {
      return res.status(404).json({ message: 'No resume found to remove' });
    }

    const filePath = path.join(__dirname, '..', user.resumeUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.resumeUrl = undefined;
    user.resumeFileName = undefined;
    user.resumeUploadedAt = undefined;
    user.resumeFileSize = undefined;
    await user.save();
    res.json({ message: 'Resume removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout from all devices
// @route   POST /api/user/logout-all
// @access  Private
exports.logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.jwtVersion = (user.jwtVersion || 0) + 1;
    await user.save();
    res.json({ message: 'Successfully logged out from all devices.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await Application.deleteMany({ user: userId });
    
    // Also delete jobs created by this employer if they are an employer
    const user = await User.findById(userId);
    if (user && user.role === 'employer') {
      await Job.deleteMany({ createdBy: userId });
      await Application.deleteMany({ employer: userId });
    }

    if (user && user.resumeUrl) {
      const filePath = path.join(__dirname, '..', user.resumeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during account deletion.' });
  }
};