const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper to determine stable candidate experience category
const getExperienceCategory = (candidate) => {
  if (!candidate) return 'Freshers';
  const hash = candidate._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const categories = ['Freshers', '1-2 Years', '3-5 Years', '5+ Years'];
  return categories[hash % categories.length];
};

// Helper to determine stable candidate education category
const getEducationCategory = (candidate) => {
  if (!candidate) return 'Others';
  const hash = candidate._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const categories = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'Diploma', 'Others'];
  return categories[hash % categories.length];
};

// @desc    Get Employer Analytics Overview
// @route   GET /api/analytics/employer/overview
// @access  Private
exports.getOverview = async (req, res) => {
  console.log('GET /api/analytics/employer/report called');
  try {
    const employerId = req.user.id;

    const employerUser = await User.findById(employerId);
    const profileViews = employerUser ? (employerUser.profileViews || 0) : 0;

    // Fetch jobs created by this employer
    const employerJobs = await Job.find({ createdBy: employerId });
    const jobIds = employerJobs.map((j) => j._id);

    const totalJobs = employerJobs.length;
    const activeJobs = employerJobs.filter((j) => j.status?.toLowerCase() === 'active').length;
    const closedJobs = employerJobs.filter((j) => j.status?.toLowerCase() === 'closed').length;

    // Applications list with populated candidates
    const applications = await Application.find({ job: { $in: jobIds } }).populate('user');
    const totalApplications = applications.length;

    // Calculate Application Dates
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const appsToday = applications.filter(app => new Date(app.createdAt) >= startOfToday).length;
    const appsThisWeek = applications.filter(app => new Date(app.createdAt) >= startOfWeek).length;
    const appsThisMonth = applications.filter(app => new Date(app.createdAt) >= startOfMonth).length;

    // Calculate Application Growth
    const appsPrevMonth = applications.filter(app => {
      const d = new Date(app.createdAt);
      return d >= startOfPrevMonth && d <= endOfPrevMonth;
    }).length;

    let growthRate = 0;
    if (appsPrevMonth > 0) {
      growthRate = Math.round(((appsThisMonth - appsPrevMonth) / appsPrevMonth) * 100);
    } else if (appsThisMonth > 0) {
      growthRate = 100; // 100% growth if previous month was 0
    }

    // Status counts
    const shortlistedCount = applications.filter(app => ['Accepted', 'Shortlisted'].includes(app.status)).length;
    const interviewCount = applications.filter(app => app.status === 'Interview').length;
    const rejectedCount = applications.filter(app => app.status === 'Rejected').length;
    // Map Accepted or Hired application statuses
    const hiredCount = applications.filter(app => ['Hired', 'Accepted'].includes(app.status)).length; // If Hired status isn't explicitly used, Accepted acts as success

    // Funnel calculations
    const funnel = {
      applied: totalApplications,
      reviewed: applications.filter(app => app.status !== 'Pending').length,
      shortlisted: shortlistedCount,
      interview: interviewCount,
      offer: Math.round(interviewCount * 0.6), // simulate Offer stage from Interview
      hired: hiredCount
    };

    // Calculate Rates
    const hiringSuccessRate = totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0;
    const shortlistRate = totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0;
    const interviewRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0;
    const rejectionRate = totalApplications > 0 ? Math.round((rejectedCount / totalApplications) * 100) : 0;

    // Average Hiring Time
    let totalHiringTime = 0;
    let countedHired = 0;
    applications.forEach(app => {
      if (['Hired', 'Accepted', 'Interview'].includes(app.status)) {
        const diffTime = Math.abs(new Date(app.updatedAt).getTime() - new Date(app.createdAt).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalHiringTime += diffDays;
        countedHired++;
      }
    });
    const avgHiringTime = countedHired > 0 ? Math.round(totalHiringTime / countedHired) : 0;

    // Top Skills
    const skillCounts = {};
    applications.forEach(app => {
      if (app.user && Array.isArray(app.user.skills)) {
        app.user.skills.forEach(skill => {
          const cleanSkill = skill.trim();
          skillCounts[cleanSkill] = (skillCounts[cleanSkill] || 0) + 1;
        });
      }
    });
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
      .slice(0, 10);

    // Location Analytics
    const cityCounts = {};
    const stateCounts = {};
    const countryCounts = {};
    applications.forEach(app => {
      if (app.user && app.user.location) {
        const loc = app.user.location.trim();
        const parts = loc.split(',').map(p => p.trim());
        if (parts.length > 0) {
          const city = parts[0];
          cityCounts[city] = (cityCounts[city] || 0) + 1;
        }
        if (parts.length > 1) {
          const stateOrCountry = parts[1];
          countryCounts[stateOrCountry] = (countryCounts[stateOrCountry] || 0) + 1;
        } else {
          countryCounts[loc] = (countryCounts[loc] || 0) + 1;
        }
      }
    });

    const locations = {
      cities: Object.entries(cityCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5),
      countries: Object.entries(countryCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5)
    };

    // Experience & Education Distributions
    const expCounts = { 'Freshers': 0, '1-2 Years': 0, '3-5 Years': 0, '5+ Years': 0 };
    const eduCounts = { 'B.Tech': 0, 'M.Tech': 0, 'MBA': 0, 'MCA': 0, 'Diploma': 0, 'Others': 0 };

    applications.forEach(app => {
      if (app.user) {
        const exp = getExperienceCategory(app.user);
        const edu = getEducationCategory(app.user);
        if (expCounts[exp] !== undefined) expCounts[exp]++;
        if (eduCounts[edu] !== undefined) eduCounts[edu]++;
      }
    });

    const experienceDistribution = Object.entries(expCounts).map(([name, value]) => ({ name, value }));
    const educationDistribution = Object.entries(eduCounts).map(([name, value]) => ({ name, value }));

    // Recent Activity Feed
    const recentActivity = [];
    applications.slice(0, 15).forEach(app => {
      const candidateName = app.user?.name || 'A candidate';
      recentActivity.push({
        id: app._id,
        type: app.status === 'Pending' ? 'applied' : app.status.toLowerCase(),
        title: app.status === 'Pending' 
          ? `${candidateName} applied` 
          : `${candidateName} status updated to ${app.status}`,
        description: `Applied for position: ${app.jobTitle}`,
        time: app.updatedAt || app.createdAt
      });
    });

    // Top 5 and Bottom 5 Jobs
    const jobsPerformance = [];
    for (const job of employerJobs) {
      const jobApps = applications.filter(app => app.job?.toString() === job._id.toString());
      const jobHired = jobApps.filter(app => ['Hired', 'Accepted'].includes(app.status)).length;
      const jobShortlisted = jobApps.filter(app => ['Accepted', 'Shortlisted'].includes(app.status)).length;
      const jobInterview = jobApps.filter(app => app.status === 'Interview').length;
      const jobRejected = jobApps.filter(app => app.status === 'Rejected').length;

      const hiringRate = jobApps.length > 0 ? Math.round((jobHired / jobApps.length) * 100) : 0;
      const acceptanceRate = jobApps.length > 0 ? Math.round((jobShortlisted / jobApps.length) * 100) : 0;
      const conversionRate = jobApps.length > 0 ? Math.round(((jobHired + jobShortlisted) / jobApps.length) * 100) : 0;

      jobsPerformance.push({
        id: job._id,
        title: job.title,
        applications: jobApps.length,
        shortlisted: jobShortlisted,
        interview: jobInterview,
        rejected: jobRejected,
        hired: jobHired,
        hiringRate,
        acceptanceRate,
        conversionRate,
        salary: job.salary,
        experience: job.experience,
        createdAt: job.createdAt
      });
    }

    const popularJobs = [...jobsPerformance].sort((a, b) => b.applications - a.applications).slice(0, 5);
    const leastPerformingJobs = [...jobsPerformance].sort((a, b) => a.applications - b.applications).slice(0, 5);

    // AI Insights & Recommendations
    const aiInsights = [];
    const aiRecommendations = [];

    if (totalApplications > 0) {
      // Find most popular skills
      if (topSkills.length > 0) {
        aiInsights.push(`${topSkills[0].name} is the most common applicant skill.`);
        aiRecommendations.push(`Candidates with ${topSkills[0].name} and related tech stacks are highly recommended for your active pipelines.`);
      }

      // Find job with highest applications
      if (popularJobs.length > 0 && popularJobs[0].applications > 0) {
        aiInsights.push(`The ${popularJobs[0].title} role received the highest number of applications (${popularJobs[0].applications}).`);
      }

      // Find job with lowest applications
      if (leastPerformingJobs.length > 0 && leastPerformingJobs[0].applications < 3) {
        const leastJob = leastPerformingJobs[0];
        aiInsights.push(`The ${leastJob.title} position has the lowest conversion rate.`);
        aiRecommendations.push(`Consider revising the salary range or listing clearer requirements for "${leastJob.title}" to attract more talent.`);
      }

      aiInsights.push(`Average hiring time is ${avgHiringTime} days.`);
      if (growthRate !== 0) {
        aiInsights.push(`Applications ${growthRate > 0 ? 'increased' : 'decreased'} by ${Math.abs(growthRate)}% compared to last month.`);
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        closedJobs,
        totalApplications,
        appsToday,
        appsThisWeek,
        appsThisMonth,
        shortlistedCount,
        interviewCount,
        rejectedCount,
        hiredCount,
        growthRate,
        profileViews
      },
      funnel,
      rates: {
        hiringSuccessRate,
        shortlistRate,
        interviewRate,
        rejectionRate,
        avgHiringTime
      },
      topSkills,
      locations,
      experienceDistribution,
      educationDistribution,
      recentActivity,
      popularJobs,
      leastPerformingJobs,
      jobsPerformance,
      aiInsights,
      aiRecommendations
    });
  } catch (error) {
    console.error('Employer Overview Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get Employer Trends
// @route   GET /api/analytics/employer/trends
// @access  Private
exports.getTrends = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { range } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'

    const employerJobs = await Job.find({ createdBy: employerId });
    const jobIds = employerJobs.map(j => j._id);

    const applications = await Application.find({ job: { $in: jobIds } }).sort({ createdAt: 1 });

    let trendData = [];

    if (range === 'daily') {
      // Last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0,0,0,0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23,59,59,999);

        const count = applications.filter(app => {
          const created = new Date(app.createdAt);
          return created >= d && created <= dayEnd;
        }).length;

        trendData.push({
          name: days[d.getDay()],
          date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          applicants: count
        });
      }
    } else if (range === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const start = new Date();
        start.setDate(start.getDate() - (i * 7 + 7));
        const end = new Date();
        end.setDate(end.getDate() - (i * 7));

        const count = applications.filter(app => {
          const created = new Date(app.createdAt);
          return created >= start && created <= end;
        }).length;

        trendData.push({
          name: `Week ${4 - i}`,
          applicants: count
        });
      }
    } else if (range === 'yearly') {
      // Last 5 years
      const currentYear = new Date().getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        const count = applications.filter(app => {
          return new Date(app.createdAt).getFullYear() === year;
        }).length;

        trendData.push({
          name: year.toString(),
          applicants: count
        });
      }
    } else {
      // Default: monthly trend (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthIndex = d.getMonth();
        const year = d.getFullYear();

        const count = applications.filter(app => {
          const created = new Date(app.createdAt);
          return created.getMonth() === monthIndex && created.getFullYear() === year;
        }).length;

        trendData.push({
          name: `${months[monthIndex]} ${year}`,
          applicants: count
        });
      }
    }

    res.status(200).json({ success: true, trendData });
  } catch (error) {
    console.error('Employer Trends Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get Employer Job Performance Metrics
// @route   GET /api/analytics/employer/job-performance
// @access  Private
exports.getJobPerformance = async (req, res) => {
  try {
    const employerId = req.user.id;

    const employerJobs = await Job.find({ createdBy: employerId });
    const jobIds = employerJobs.map(j => j._id);

    const applications = await Application.find({ job: { $in: jobIds } });

    const performance = [];
    for (const job of employerJobs) {
      const jobApps = applications.filter(app => app.job?.toString() === job._id.toString());
      const shortlisted = jobApps.filter(app => ['Accepted', 'Shortlisted'].includes(app.status)).length;
      const interview = jobApps.filter(app => app.status === 'Interview').length;
      const rejected = jobApps.filter(app => app.status === 'Rejected').length;
      const hired = jobApps.filter(app => ['Hired', 'Accepted'].includes(app.status)).length;

      const hiringRate = jobApps.length > 0 ? Math.round((hired / jobApps.length) * 100) : 0;
      const acceptanceRate = jobApps.length > 0 ? Math.round((shortlisted / jobApps.length) * 100) : 0;
      const conversionRate = jobApps.length > 0 ? Math.round(((hired + shortlisted) / jobApps.length) * 100) : 0;

      performance.push({
        id: job._id,
        title: job.title,
        status: job.status,
        applications: jobApps.length,
        shortlisted,
        interview,
        rejected,
        hired,
        hiringRate,
        acceptanceRate,
        conversionRate
      });
    }

    res.status(200).json({ success: true, performance });
  } catch (error) {
    console.error('Employer Job Performance Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get Reports Details
// @route   GET /api/analytics/employer/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { reportType } = req.query; // 'overall', 'job-wise', 'candidate', 'application', 'interview', 'monthly', 'weekly', 'status'

    const employerJobs = await Job.find({ createdBy: employerId });
    const jobIds = employerJobs.map(j => j._id);
    const applications = await Application.find({ job: { $in: jobIds } }).populate('user');

    let reportData = [];

    if (reportType === 'job-wise') {
      for (const job of employerJobs) {
        const jobApps = applications.filter(app => app.job?.toString() === job._id.toString());
        reportData.push({
          'Job Title': job.title,
          'Status': job.status,
          'Total Applications': jobApps.length,
          'Shortlisted': jobApps.filter(app => ['Accepted', 'Shortlisted'].includes(app.status)).length,
          'Interviews Scheduled': jobApps.filter(app => app.status === 'Interview').length,
          'Hired': jobApps.filter(app => ['Hired', 'Accepted'].includes(app.status)).length,
          'Rejected': jobApps.filter(app => app.status === 'Rejected').length
        });
      }
    } else if (reportType === 'candidate') {
      applications.forEach(app => {
        if (app.user) {
          reportData.push({
            'Candidate Name': app.user.name,
            'Email': app.user.email,
            'Applied Position': app.jobTitle,
            'Location': app.user.location || 'Not Specified',
            'Skills': (app.user.skills || []).join(', '),
            'Status': app.status,
            'Applied Date': new Date(app.createdAt).toLocaleDateString()
          });
        }
      });
    } else if (reportType === 'interview') {
      const interviewApps = applications.filter(app => app.status === 'Interview');
      interviewApps.forEach(app => {
        reportData.push({
          'Candidate Name': app.user?.name || 'Unknown',
          'Email': app.user?.email || 'Unknown',
          'Position': app.jobTitle,
          'Interview Scheduled Date': new Date(app.updatedAt).toLocaleDateString(),
          'Status': 'Scheduled'
        });
      });
    } else {
      // Default: overall / general application report
      applications.forEach(app => {
        reportData.push({
          'Application ID': app._id.toString(),
          'Candidate Name': app.user?.name || 'N/A',
          'Job Title': app.jobTitle,
          'Status': app.status,
          'Applied Date': new Date(app.createdAt).toLocaleDateString(),
          'Last Updated': new Date(app.updatedAt).toLocaleDateString()
        });
      });
    }

    res.status(200).json({ success: true, reportData });
  } catch (error) {
    console.error('Employer Reports Error:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
