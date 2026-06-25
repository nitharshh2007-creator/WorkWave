const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get public company details
// @route   GET /api/companies/:id
// @access  Public
exports.getCompanyById = async (req, res) => {
  try {
    const company = await User.findOne({ _id: req.params.id, role: 'employer' }).select('-password');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get jobs posted by this company
    const activeJobs = await Job.find({ createdBy: company._id, status: 'active' }).sort({ createdAt: -1 });
    const totalJobsCount = await Job.countDocuments({ createdBy: company._id });

    // Get company job IDs to accurately count associated applications
    const allCompanyJobs = await Job.find({ createdBy: company._id });
    const companyJobIds = allCompanyJobs.map(j => j._id);

    // Applicant counts using job references
    const totalApplicantsCount = await Application.countDocuments({ job: { $in: companyJobIds } });
    const interviewsScheduledCount = await Application.countDocuments({ job: { $in: companyJobIds }, status: { $in: ['Interview Scheduled', 'Interview Completed', 'Interview'] } });
    const hiresCount = await Application.countDocuments({ job: { $in: companyJobIds }, status: { $in: ['Selected / Hired', 'Hired', 'Accepted'] } });

    // Handle Privacy configurations
    const privacy = company.privacy || {};
    const companyObj = company.toObject();

    if (privacy.profileVisibility === 'private') {
      return res.status(403).json({ message: 'This company profile is private.' });
    }

    if (privacy.showCompanyWebsite === false) {
      companyObj.website = undefined;
    }
    if (privacy.showRecruiterContact === false) {
      companyObj.recruiterName = undefined;
      companyObj.recruiterPosition = undefined;
      companyObj.recruiterEmail = undefined;
      companyObj.recruiterPhone = undefined;
    }

    // Official email & phone privacy if not enabled
    if (privacy.showCompanyWebsite === false) {
      companyObj.companyEmail = undefined;
      companyObj.phone = undefined;
    }

    // Increment profile views
    company.profileViews = (company.profileViews || 0) + 1;
    await company.save();

    res.json({
      ...companyObj,
      activeJobs,
      activeJobsCount: activeJobs.length,
      totalJobsCount,
      totalApplicantsCount,
      interviewsScheduledCount,
      hiresCount,
      profileViews: company.profileViews
    });
  } catch (error) {
    console.error('getCompanyById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
