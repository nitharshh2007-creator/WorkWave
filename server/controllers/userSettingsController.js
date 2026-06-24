const User = require('../models/User'); // Assuming path
const Application = require('../models/Application'); // Assuming path
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
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile settings
// @route   PATCH /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, phone, college, department, graduationYear } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.college = college || user.college;
    user.department = department || user.department;
    user.graduationYear = graduationYear || user.graduationYear;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
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
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update notification preferences
// @route   PATCH /api/user/notifications
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
// @route   PATCH /api/user/privacy
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

// @desc    Upload or update resume
// @route   POST /api/user/resume
// @access  Private
exports.updateResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.file) {
            // If there's an old resume, delete it
            if (user.resume && user.resume.url) {
                const oldPath = path.join(__dirname, '..', 'public', user.resume.url);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            user.resume = {
                fileName: req.file.originalname,
                url: `/uploads/resumes/${req.file.filename}`,
                uploadedAt: new Date(),
            };
            await user.save();
            res.json(user.resume);
        } else {
            res.status(400).json({ message: 'Please upload a file' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove resume
// @route   DELETE /api/user/resume
// @access  Private
exports.removeResume = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.resume || !user.resume.url) {
            return res.status(404).json({ message: 'No resume found to remove' });
        }

        const filePath = path.join(__dirname, '..', 'public', user.resume.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        user.resume = undefined;
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
        // This is a destructive action. You might want to add more checks.
        
        // 1. Delete user's applications
        await Application.deleteMany({ user: userId });

        // 2. Find user to get resume path for deletion
        const user = await User.findById(userId);
        if (user && user.resume && user.resume.url) {
            const filePath = path.join(__dirname, '..', 'public', user.resume.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // 3. Delete user
        await User.findByIdAndDelete(userId);

        // Saved jobs are on the client-side (localStorage), so no server action needed for that.

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during account deletion.' });
    }
};