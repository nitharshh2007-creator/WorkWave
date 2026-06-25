const Job = require('../models/Job');

// Helper validation function
const validateJobPayload = (payload, isUpdate = false) => {
  const requiredFields = [
    'title',
    'company',
    'location',
    'jobType',
    'salary',
    'experience',
    'skills',
    'description',
    'requirements',
    'deadline',
  ];
  for (const field of requiredFields) {
    if (!payload[field]) {
      return `Field '${field}' is required`;
    }
  }
  if (payload.salary && payload.salary.min < 0) {
    return 'Salary minimum cannot be negative';
  }
  // Only enforce future deadline on create, not on edit
  if (!isUpdate && new Date(payload.deadline) <= new Date()) {
    return 'Application deadline must be a future date';
  }
  return null;
};

// Create a new job (Employer only)
exports.createJob = async (req, res) => {
  try {
    const errorMsg = validateJobPayload(req.body);
    if (errorMsg) {
      return res.status(400).json({ success: false, message: errorMsg });
    }
    const jobData = {
      ...req.body,
      createdBy: req.user.id,
      status: 'active',
    };
    const job = await Job.create(jobData);
    return res.status(201).json({ success: true, message: 'Job created successfully', job });
  } catch (error) {
    console.error('Create Job Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update an existing job (Employer only)
exports.updateJob = async (req, res) => {
  try {
    const errorMsg = validateJobPayload(req.body, true);
    if (errorMsg) {
      return res.status(400).json({ success: false, message: errorMsg });
    }
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Update Job Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a job (Employer only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Archive / Restore a job (Employer only)
exports.archiveJob = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['archived', 'active'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use "archived" or "active".' });
    }
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { $set: { status } },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job status updated', job });
  } catch (error) {
    console.error('Archive Job Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', '-password');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const Application = require('../models/Application');
    const applicantsCount = await Application.countDocuments({ job: job._id });
    const jobWithCount = {
      ...job.toObject(),
      id: job._id,
      applicants: applicantsCount
    };
    return res.status(200).json({ success: true, job: jobWithCount });
  } catch (error) {
    console.error('Get Job By Id Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get jobs posted by the authenticated employer
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user.id });
    const Application = require('../models/Application');
    const jobsWithCount = await Promise.all(jobs.map(async (job) => {
      const applicantsCount = await Application.countDocuments({ job: job._id });
      return {
        ...job.toObject(),
        id: job._id,
        applicants: applicantsCount
      };
    }));
    return res.status(200).json({ success: true, jobs: jobsWithCount });
  } catch (error) {
    console.error('Get My Jobs Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all jobs (public)
exports.getJobs = async (req, res) => {
  try {
    const query = {
      status: 'active',
      $or: [
        { deadline: { $exists: false } },
        { deadline: null },
        { deadline: { $gt: new Date() } }
      ]
    };
    const jobs = await Job.find(query).populate('createdBy', '-password').sort({ createdAt: -1 });
    const Application = require('../models/Application');
    const jobsWithCount = await Promise.all(jobs.map(async (job) => {
      const applicantsCount = await Application.countDocuments({ job: job._id });
      return {
        ...job.toObject(),
        id: job._id,
        applicants: applicantsCount
      };
    }));
    return res.status(200).json({ success: true, jobs: jobsWithCount });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};