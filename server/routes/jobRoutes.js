const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeEmployer } = require("../middleware/authorizeEmployer");

const {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  archiveJob,
} = require("../controllers/jobController");

// Create a new job (employer only)
router.post('/', protect, authorizeEmployer, createJob);

// Get jobs created by the authenticated employer (must be before /:id)
router.get('/my-jobs', protect, authorizeEmployer, getMyJobs);

// Update a job (employer only)
router.patch('/:id', protect, authorizeEmployer, updateJob);

// Delete a job (employer only)
router.delete('/:id', protect, authorizeEmployer, deleteJob);

// Archive (or restore) a job (employer only)
router.patch('/:id/archive', protect, authorizeEmployer, archiveJob);

// Get all jobs (public)
router.get('/', getJobs);

// Get a single job by ID (public)
router.get('/:id', getJobById);

module.exports = router;