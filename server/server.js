const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// --- Route Imports ---
// Assuming you have these other route files for a complete application
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userSettingsRoutes = require('./routes/userSettingsRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

// --- Static Files ---
// Serve uploaded resumes and images from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Mount the new user settings routes
app.use('/api/user', userRoutes);
app.use('/api/user/settings', userSettingsRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));

// --- Database & Server Initialization ---
const PORT = process.env.PORT || 5000;

const cleanDuplicateApplications = async () => {
  try {
    const Application = require('./models/Application');
    const appsWithoutCandidate = await Application.find({ $or: [{ candidate: { $exists: false } }, { candidate: null }] });
    for (const app of appsWithoutCandidate) {
      app.candidate = app.user;
      await app.save();
    }

    const duplicates = await Application.aggregate([
      {
        $group: {
          _id: { user: '$user', job: '$job' },
          count: { $sum: 1 },
          docs: { $push: { _id: '$_id', createdAt: '$createdAt' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    for (const dup of duplicates) {
      const sortedDocs = dup.docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const deleteIds = sortedDocs.slice(1).map(d => d._id);
      await Application.deleteMany({ _id: { $in: deleteIds } });
    }
  } catch (error) {
    // Essential production error handling
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await cleanDuplicateApplications();
    const Application = require('./models/Application');
    await Application.syncIndexes();
    app.listen(PORT);
  })
  .catch(err => {});