const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Hired', 'Rejected', 'Pending', 'Accepted', 'Interview'],
    default: 'Applied',
  },
  notes: {
    type: String,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Job',
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  resumeFileName: {
    type: String,
    default: '',
  },
  resumeFileSize: {
    type: Number,
    default: 0,
  },
  coverLetter: {
    type: String,
    default: '',
  },
  interviewDate: {
    type: String,
    default: '',
  },
  interviewTime: {
    type: String,
    default: '',
  },
  meetingLink: {
    type: String,
    default: '',
  },
  interviewNotes: {
    type: String,
    default: '',
  },
  interviewStatus: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Cancelled'],
    default: 'Upcoming',
  },
  hiredDate: {
    type: Date,
    default: null,
  },
  rejectedDate: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  interviewMode: {
    type: String,
    enum: ['Google Meet', 'Microsoft Teams', 'Zoom', 'Offline'],
    default: 'Google Meet',
  },
  interviewLocation: {
    type: String,
    default: '',
  },
  interviewDuration: {
    type: String,
    default: '',
  },
  interviewMessage: {
    type: String,
    default: '',
  },
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
});

// Enforce unique combinations of user/candidate and job at the database level
applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);