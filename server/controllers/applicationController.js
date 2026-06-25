const Application = require('../models/Application');

// @desc    Get all applications for the logged-in user
// @route   GET /api/applications/my
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    // req.user.id should be available from the authMiddleware
    const applications = await Application.find({ user: req.user.id })
      .populate('job')
      .populate('employer', '-password')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
    try {
        const { job, jobId, coverLetter } = req.body;
        const targetJobId = job || jobId;

        if (!targetJobId) {
            return res.status(400).json({ message: 'Job ID is required' });
        }

        // Prevent duplicate applications
        const existingApplication = await Application.findOne({
            $or: [
                { user: req.user.id, job: targetJobId },
                { candidate: req.user.id, job: targetJobId }
            ]
        });
        if (existingApplication) {
            return res.status(409).json({ message: 'You have already applied for this job.' });
        }

        const Job = require('../models/Job');
        const dbJob = await Job.findById(targetJobId);
        if (!dbJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const employerId = dbJob.createdBy?._id || dbJob.createdBy || dbJob.employer;
        if (!employerId) {
            return res.status(400).json({ message: 'Employer not found for this job' });
        }

        // Get resume details from user profile
        const resumeUrl = req.user.resumeUrl || '';
        const resumeFileName = req.user.resumeFileName || '';
        const resumeFileSize = req.user.resumeFileSize || 0;

        const newApplication = new Application({
            jobTitle: dbJob.title,
            company: dbJob.company,
            location: dbJob.location,
            status: 'Applied',
            user: req.user.id,
            candidate: req.user.id,
            employer: employerId,
            job: targetJobId,
            resumeUrl,
            resumeFileName,
            resumeFileSize,
            coverLetter: coverLetter || '',
        });

        const createdApplication = await newApplication.save();

        // Notify employer of new application
        const { createNotification } = require('./notificationController');
        await createNotification(
          employerId,
          'New Application Submitted',
          `${req.user.name || 'A candidate'} applied for your job posting: "${dbJob.title}"`,
          'info',
          createdApplication._id,
          req.user.id
        );

        // Notify candidate of successful submission
        await createNotification(
          req.user.id,
          'Application Submitted',
          `Your application for "${dbJob.title}" at "${dbJob.company}" has been submitted successfully.`,
          'info',
          createdApplication._id,
          req.user.id
        );

        res.status(201).json(createdApplication);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'You have already applied for this job.' });
        }
        console.error('Create application error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete/Withdraw an application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Make sure user owns the application or is the employer who posted the job
        const Job = require('../models/Job');
        const job = await Job.findById(application.job);
        const isOwner = application.user.toString() === req.user.id;
        const isEmployer = job && (job.createdBy?.toString() === req.user.id || job.employer?.toString() === req.user.id);

        if (!isOwner && !isEmployer) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await application.deleteOne();

        // Notify employer if owner withdrew the application
        if (isOwner && job) {
          const { createNotification } = require('./notificationController');
          const employerId = job.createdBy || job.employer;
          if (employerId) {
            await createNotification(
              employerId,
              'Application Withdrawn',
              `A candidate has withdrawn their application for: "${application.jobTitle}"`,
              'info',
              null,
              req.user.id
            );
          }
        }

        res.json({ message: 'Application removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all applications for jobs posted by this employer
// @route   GET /api/applications/employer
// @access  Private (Employer)
exports.getEmployerApplications = async (req, res) => {
  try {
    const employerId = req.user.id;
    const Job = require('../models/Job');
    
    // Find all jobs created by this employer
    const employerJobs = await Job.find({ createdBy: employerId });
    const jobIds = employerJobs.map(j => j._id);

    // Find all applications submitted for those jobs or matching employerId
    const applications = await Application.find({
      $or: [
        { job: { $in: jobIds } },
        { employer: employerId }
      ]
    })
      .populate('user', '-password')
      .populate('candidate', '-password')
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('getEmployerApplications Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    // Notify candidate of status change
    const { createNotification } = require('./notificationController');
    if (status === 'Shortlisted') {
      await createNotification(
        application.user,
        'Application Shortlisted',
        `Great news! Your application for "${application.jobTitle}" has been shortlisted.`,
        'status_update',
        application._id,
        req.user.id
      );
    } else if (status === 'Accepted') {
      await createNotification(
        application.user,
        'Offer Received',
        `Congratulations! You have received an offer for the position of "${application.jobTitle}" at "${application.company}".`,
        'status_update',
        application._id,
        req.user.id
      );
    } else if (['Hired'].includes(status)) {
      await createNotification(
        application.user,
        'Application Hired',
        `Congratulations! You have been hired for the position of "${application.jobTitle}".`,
        'status_update',
        application._id,
        req.user.id
      );
    } else if (status === 'Rejected') {
      await createNotification(
        application.user,
        'Application Status Update',
        `Thank you for applying to the "${application.jobTitle}" role. We regret to inform you that we are proceeding with other candidates.`,
        'status_update',
        application._id,
        req.user.id
      );
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('updateApplicationStatus Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update application notes
// @route   PATCH /api/applications/:id/notes
// @access  Private (Employer)
exports.updateApplicationNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.notes = notes;
    await application.save();

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('updateApplicationNotes Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Schedule/Reschedule interview
// @route   PATCH /api/applications/:id/interview
// @access  Private (Employer)
exports.scheduleInterview = async (req, res) => {
  try {
    const { date, time, mode, link, location, duration, message } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Interview date is required' });
    }
    if (!time) {
      return res.status(400).json({ message: 'Interview time is required' });
    }
    if (!mode) {
      return res.status(400).json({ message: 'Interview mode is required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectDate = new Date(date);
    if (selectDate < today) {
      return res.status(400).json({ message: 'Interview date cannot be in the past' });
    }

    if (mode !== 'Offline') {
      if (!link || !link.startsWith('http')) {
        return res.status(400).json({ message: 'Please provide a valid meeting URL for online interviews' });
      }
    } else {
      if (!location || !location.trim()) {
        return res.status(400).json({ message: 'Please provide a location/venue for offline interviews' });
      }
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const isReschedule = !!application.interviewDate;
    application.status = 'Interview Scheduled';
    application.interviewDate = date;
    application.interviewTime = time;
    application.interviewMode = mode;
    application.meetingLink = mode !== 'Offline' ? link : '';
    application.interviewLocation = mode === 'Offline' ? location : '';
    application.interviewDuration = duration || '';
    application.interviewMessage = message || '';
    application.interviewNotes = message || '';
    application.interviewStatus = 'Upcoming';

    await application.save();

    // Create Notification for candidate
    let detailsStr = `Your interview for "${application.jobTitle}" at "${application.company}" has been ${isReschedule ? 'rescheduled' : 'scheduled'}.\nDate: ${date}\nTime: ${time}\nDuration: ${duration || 'N/A'}\nMode: ${mode}`;
    if (mode === 'Offline') {
      detailsStr += `\nVenue: ${location}`;
    } else {
      detailsStr += `\nMeeting Link: ${link}`;
    }
    if (message) {
      detailsStr += `\nNote: ${message}`;
    }

    const { createNotification } = require('./notificationController');
    await createNotification(
      application.user,
      isReschedule ? 'Interview Rescheduled' : 'Interview Scheduled',
      detailsStr,
      'interview',
      application._id,
      req.user.id
    );

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('scheduleInterview Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Cancel interview
// @route   PATCH /api/applications/:id/interview/cancel
// @access  Private (Employer)
exports.cancelInterview = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.interviewStatus = 'Cancelled';
    await application.save();

    // Create Notification for candidate
    const { createNotification } = require('./notificationController');
    await createNotification(
      application.user,
      'Interview Cancelled',
      `Your interview for "${application.jobTitle}" has been cancelled.`,
      'interview',
      application._id,
      req.user.id
    );

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('cancelInterview Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Complete interview
// @route   PATCH /api/applications/:id/interview/complete
// @access  Private (Employer)
exports.completeInterview = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.interviewStatus = 'Completed';
    application.status = 'Interview Completed';
    await application.save();

    // Notify candidate
    const { createNotification } = require('./notificationController');
    await createNotification(
      application.user,
      'Interview Completed',
      `Your interview for "${application.jobTitle}" at "${application.company}" has been completed.`,
      'interview',
      application._id,
      req.user.id
    );

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('completeInterview Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Hire candidate
// @route   PATCH /api/applications/:id/hire
// @access  Private (Employer)
exports.hireCandidate = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('user').populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = 'Hired';
    application.hiredDate = new Date();
    await application.save();

    // Notify candidate
    const { createNotification } = require('./notificationController');
    await createNotification(
      application.user._id,
      'Congratulations! You\'ve Been Hired',
      `🎉 Congratulations! You have been hired for the position of ${application.jobTitle} at ${application.company}. Welcome aboard!`,
      'status_update',
      application._id,
      req.user.id
    );

    // Update analytics - increment hired count for the employer
    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('hireCandidate Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reject candidate
// @route   PATCH /api/applications/:id/reject
// @access  Private (Employer)
exports.rejectCandidate = async (req, res) => {
  try {
    const { reason } = req.body;
    const application = await Application.findById(req.params.id).populate('user');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = 'Rejected';
    application.rejectedDate = new Date();
    application.rejectionReason = reason || 'We are proceeding with other candidates.';
    await application.save();

    // Notify candidate
    const { createNotification } = require('./notificationController');
    await createNotification(
      application.user._id,
      'Application Status Update',
      `Thank you for applying to the ${application.jobTitle} role at ${application.company}. We regret to inform you that we are proceeding with other candidates.${reason ? ` ${reason}` : ''}`,
      'status_update',
      application._id,
      req.user.id
    );

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('rejectCandidate Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update to Reviewed status
// @route   PATCH /api/applications/:id/review
// @access  Private (Employer)
exports.reviewApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('user');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const previousStatus = application.status;
    application.status = 'Reviewed';
    await application.save();

    // Notify candidate only if status changed
    const { createNotification } = require('./notificationController');
    if (previousStatus !== 'Reviewed') {
      await createNotification(
        application.user._id,
        'Application Review',
        `Your application for ${application.jobTitle} at ${application.company} is being reviewed.`,
        'status_update',
        application._id,
        req.user.id
      );
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('reviewApplication Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update to Shortlisted status
// @route   PATCH /api/applications/:id/shortlist
// @access  Private (Employer)
exports.shortlistApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('user');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const previousStatus = application.status;
    application.status = 'Shortlisted';
    await application.save();

    // Notify candidate only if status changed
    const { createNotification } = require('./notificationController');
    if (previousStatus !== 'Shortlisted') {
      await createNotification(
        application.user._id,
        'Application Shortlisted',
        `Great news! Your application for ${application.jobTitle} at ${application.company} has been shortlisted.`,
        'status_update',
        application._id,
        req.user.id
      );
    }

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('shortlistApplication Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all applications for a candidate
// @route   GET /api/applications/candidate/:candidateId
// @access  Private
exports.getApplicationsByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const applications = await Application.find({ $or: [{ user: candidateId }, { candidate: candidateId }] })
      .populate('user', '-password')
      .populate('candidate', '-password')
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('getApplicationsByCandidate Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all applications/applicants for a job
// @route   GET /api/applications/job/:jobId
// @access  Private
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ job: jobId })
      .populate('user', '-password')
      .populate('candidate', '-password')
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('getApplicationsByJob Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all applications for an employer's jobs
// @route   GET /api/applications/employer/:employerId
// @access  Private
exports.getApplicationsByEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;
    const applications = await Application.find({ employer: employerId })
      .populate('user', '-password')
      .populate('candidate', '-password')
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('getApplicationsByEmployer Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};