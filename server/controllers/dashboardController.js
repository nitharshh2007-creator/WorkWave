const User = require("../models/User");
const SavedJob = require("../models/SavedJob");
const Application = require("../models/Application");
const Job = require("../models/Job");

exports.getDashboardData = async (req, res) => {
  try {
    const user = req.user;

    let appCount = 0;

    let recentApps = [];
    let recommendedJobs = [];
let activities = [];


    if (user.role === "candidate") {
      // Get candidate application count
      appCount = await Application.countDocuments({ user: user._id });

      // Get recent applications
      recentApps = await Application.find({ user: user._id })
        .populate({
          path: "job",
          populate: {
            path: "createdBy",
            select: "-password"
          }
        })
        .populate("employer", "-password")
        .sort({ createdAt: -1 })
        .limit(5);

      // Get recommended jobs (newest jobs)
      recommendedJobs = await Job.find({})
        .populate("createdBy", "-password")
        .sort({ createdAt: -1 })
        .limit(6);

      // Dynamically generate activities from database records
      activities = []; 

      // 1. Job application activities (including interview scheduling)
      recentApps.forEach(app => {
        // Application activity
        activities.push({
          id: `act-app-${app._id}`,
          type: "job_applied",
          detail: `Applied to ${app.job?.title || "a job"} at ${app.company}`,
          time: new Date(app.createdAt).toISOString(),
          status: "completed",
        });
        // If the application status is Interview Scheduled or Interview Completed
        if (app.status === "Interview Scheduled" && app.interviewDate) {
          activities.push({
            id: `act-interview-${app._id}`,
            type: "interview_scheduled",
            detail: `Interview scheduled for ${app.job?.title || "a job"}`,
            time: new Date(app.updatedAt || app.createdAt).toISOString(),
            status: "completed",
          });
        }
        if (app.status === "Interview Completed") {
          activities.push({
            id: `act-interview-complete-${app._id}`,
            type: "interview_completed",
            detail: `Completed interview for ${app.job?.title || "a job"}`,
            time: new Date(app.updatedAt || app.createdAt).toISOString(),
            status: "completed",
          });
        }
        if (app.status === "Hired") {
          activities.push({
            id: `act-hired-${app._id}`,
            type: "hired",
            detail: `Congratulations! Hired for ${app.job?.title || "a job"}`,
            time: new Date(app.hiredDate || app.updatedAt || app.createdAt).toISOString(),
            status: "completed",
          });
        }
        if (app.status === "Rejected") {
          activities.push({
            id: `act-rejected-${app._id}`,
            type: "rejected",
            detail: `Application for ${app.job?.title || "a job"} was not selected`,
            time: new Date(app.rejectedDate || app.updatedAt || app.createdAt).toISOString(),
            status: "completed",
          });
        }
      });

      // 2. Resume upload activity (if user has a resume)
      if (user.resume) {
        activities.push({
          id: "act-resume",
          type: "resume_uploaded",
          detail: "Uploaded resume",
          time: new Date().toISOString(),
          status: "completed",
        });
      }

      // 3. Profile update activity (if any profile fields are present)
      if (user.bio || (Array.isArray(user.skills) && user.skills.length > 0) || user.profilePicture) {
        activities.push({
          id: "act-profile",
          type: "profile_updated",
          detail: "Updated profile details",
          time: new Date().toISOString(),
          status: "completed",
        });
      }

      // Sort activities by time descending (most recent first)
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    } else {
      // Employer dashboard statistics
      const employerJobs = await Job.find({ employer: user._id });
      const jobIds = employerJobs.map((j) => j._id);
      
      appCount = await Application.countDocuments({ job: { $in: jobIds } });

      recentApps = await Application.find({ job: { $in: jobIds } })
        .populate("job")
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

      recommendedJobs = await Job.find({ employer: { $ne: user._id } }).limit(3);

      // Generate employer activities based on recent job postings and applications
      const recentJobs = await Job.find({ employer: user._id }).sort({ createdAt: -1 }).limit(10);
      activities = [];
      
      // Add job posting activities
      recentJobs.forEach(job => {
        activities.push({
          id: `act-job-${job._id}`,
          type: "job_posted",
          detail: `Posted job: ${job.title || "a new position"}`,
          time: new Date(job.createdAt).toISOString(),
          status: "completed",
        });
      });

      // Add application and interview activities from recent applications
      const recentApplications = await Application.find({ job: { $in: jobIds } })
        .populate("user", "name email")
        .sort({ updatedAt: -1 })
        .limit(20);

      recentApplications.forEach(app => {
        const candidateName = app.user?.name || "A candidate";
        const jobTitle = app.jobTitle || "a position";

        // Application activity
        if (app.status === "Applied") {
          activities.push({
            id: `act-app-${app._id}`,
            type: "job_applied",
            detail: `${candidateName} applied for ${jobTitle}`,
            time: new Date(app.createdAt).toISOString(),
            status: "completed",
          });
        }

        // Interview scheduled activity
        if (app.status === "Interview Scheduled" && app.interviewDate) {
          activities.push({
            id: `act-interview-${app._id}`,
            type: "interview_scheduled",
            detail: `Interview scheduled: ${candidateName} for ${jobTitle}`,
            time: new Date(app.updatedAt || app.createdAt).toISOString(),
            status: "completed",
          });
        }

        // Interview completed activity
        if (app.status === "Interview Completed") {
          activities.push({
            id: `act-interview-complete-${app._id}`,
            type: "interview_completed",
            detail: `Interview completed: ${candidateName} for ${jobTitle}`,
            time: new Date(app.updatedAt || app.createdAt).toISOString(),
            status: "completed",
          });
        }

        // Hired activity
        if (app.status === "Hired") {
          activities.push({
            id: `act-hired-${app._id}`,
            type: "hired",
            detail: `${candidateName} hired for ${jobTitle}`,
            time: new Date(app.hiredDate || app.updatedAt || app.createdAt).toISOString(),
            status: "completed",
          });
        }

        // Rejected activity
        if (app.status === "Rejected") {
          activities.push({
            id: `act-rejected-${app._id}`,
            type: "rejected",
            detail: `${candidateName} rejected for ${jobTitle}`,
            time: new Date(app.rejectedDate || app.updatedAt || app.createdAt).toISOString(),
            status: "completed",
          });
        }
      });

      // Profile update activity (if any profile fields are present)
      if (user.bio || (Array.isArray(user.skills) && user.skills.length > 0) || user.profilePicture) {
        activities.push({
          id: "act-profile",
          type: "profile_updated",
          detail: "Updated profile details",
          time: new Date(user.lastUpdated || user.updatedAt).toISOString(),
          status: "completed",
        });
      }

      // Sort activities by time descending (most recent first)
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    }

    // Dynamic profile fields evaluation aligned with profile page calculation
    const profileFields = [
      { key: "name", value: user.name },
      { key: "email", value: user.email },
      { key: "profilePicture", value: user.profilePicture },
      { key: "resume", value: user.resumeUrl },
      { key: "skills", value: Array.isArray(user.skills) && user.skills.length > 0 ? user.skills : null },
      { key: "bio", value: user.bio },
      { key: "phone", value: user.phone },
      { key: "location", value: user.location }
    ];
    const missingFields = profileFields.filter(f => !f.value).map(f => f.key);
    
    let profileCompletion = 0;
    if (user.profilePicture) profileCompletion += 10;
    if (user.name) profileCompletion += 10;
    if (user.email) profileCompletion += 10;
    if (user.phone) profileCompletion += 10;
    if (user.location) profileCompletion += 10;
    if (user.bio) profileCompletion += 15;
    if (user.resumeUrl) profileCompletion += 20;
    if (Array.isArray(user.skills) && user.skills.length > 0) profileCompletion += 15;

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        resumeUrl: user.resumeUrl,
        skills: user.skills,
        portfolioUrl: user.portfolioUrl,
      },
      stats: {
        // Applications count already computed in appCount
        applications: appCount,
        // Saved jobs count – actual count from SavedJob collection
        savedJobs: user.role === "candidate" ? await SavedJob.countDocuments({ user: user._id }) : 0,
        // Interviews scheduled – count of applications with Interview Scheduled or Interview Completed status
        interviews: await Application.countDocuments({ 
          user: user._id, 
          status: { $in: ["Interview Scheduled", "Interview Completed"] }
        }),
        profileCompletion,
        missingFields,
      },
      recentApplications: recentApps,
      recommendedJobs: recommendedJobs,
      activities: activities,
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    res.status(500).json({
      message: "Server error fetching dashboard data",
      error: error.message,
    });
  }
};

exports.getEmployerDashboardData = async (req, res) => {
  try {
    const user = req.user;

    // Fetch jobs created by this employer
    const employerJobs = await Job.find({
      $or: [{ employer: user._id }, { createdBy: user._id }],
    });
    const jobIds = employerJobs.map((j) => j._id);

    // Dynamic stats
    const totalJobs = employerJobs.length;
    const activeJobs = employerJobs.filter((j) => j.status === "active").length;
    const applicationsCount = await Application.countDocuments({ job: { $in: jobIds } });
    const interviewsCount = await Application.countDocuments({
      job: { $in: jobIds },
      status: { $in: ["Interview Scheduled", "Interview Completed"] },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const applicationsToday = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: startOfToday }
    });

    const shortlistedCount = await Application.countDocuments({
      job: { $in: jobIds },
      status: { $in: ["Shortlisted"] }
    });

    const rejectedCount = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Rejected"
    });

    const hiredCount = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Hired"
    });

    // Applications Per Job
    const applicationsPerJob = [];
    for (const job of employerJobs) {
      const count = await Application.countDocuments({ job: job._id });
      applicationsPerJob.push({
        name: job.title,
        applications: count,
      });
    }

    // Applications By Date (grouped by week in current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const applicationsByDate = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(startOfMonth);
      weekStart.setDate(startOfMonth.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const count = await Application.countDocuments({
        job: { $in: jobIds },
        createdAt: { $gte: weekStart, $lt: weekEnd },
      });

      applicationsByDate.push({
        name: `Week ${i + 1}`,
        applications: count,
      });
    }

    // Recent Activity
    const recentActivity = [];

    // Job postings events
    employerJobs.forEach((job) => {
      recentActivity.push({
        id: `job-posted-${job._id}`,
        type: "job_posting",
        title: `Job Posted: ${job.title}`,
        description: "The job is now live.",
        time: job.createdAt.toISOString(),
        icon: "PlusCircle",
      });

      if (job.updatedAt && job.updatedAt.getTime() > job.createdAt.getTime() + 1000) {
        recentActivity.push({
          id: `job-updated-${job._id}`,
          type: "job_update",
          title: `Job Updated: ${job.title}`,
          description: "Job details were updated.",
          time: job.updatedAt.toISOString(),
          icon: "Edit",
        });
      }
    });

    // Applications events
    const appList = await Application.find({ job: { $in: jobIds } })
      .populate("user", "name email")
      .sort({ updatedAt: -1 })
      .limit(20);

    appList.forEach((app) => {
      const candidateName = app.user?.name || "A candidate";
      const jobTitle = app.jobTitle || "a position";

      if (app.status === "Applied") {
        recentActivity.push({
          id: `app-applied-${app._id}`,
          type: "application",
          title: `New Application for ${jobTitle}`,
          description: `${candidateName} applied.`,
          time: app.createdAt.toISOString(),
          icon: "UserPlus",
        });
      } else if (app.status === "Reviewed") {
        recentActivity.push({
          id: `app-reviewed-${app._id}`,
          type: "review",
          title: "Application Reviewed",
          description: `${candidateName}'s application for ${jobTitle} was reviewed.`,
          time: app.updatedAt.toISOString(),
          icon: "Eye",
        });
      } else if (app.status === "Shortlisted") {
        recentActivity.push({
          id: `app-shortlist-${app._id}`,
          type: "shortlist",
          title: "Candidate Shortlisted",
          description: `${candidateName} shortlisted for ${jobTitle}.`,
          time: app.updatedAt.toISOString(),
          icon: "Star",
        });
      } else if (app.status === "Interview Scheduled") {
        recentActivity.push({
          id: `app-interview-${app._id}`,
          type: "interview",
          title: "Interview Scheduled",
          description: `Interview scheduled with ${candidateName} for ${jobTitle}.`,
          time: app.updatedAt.toISOString(),
          icon: "Calendar",
        });
      } else if (app.status === "Interview Completed") {
        recentActivity.push({
          id: `app-interview-complete-${app._id}`,
          type: "interview_completed",
          title: "Interview Completed",
          description: `Interview completed with ${candidateName} for ${jobTitle}.`,
          time: app.updatedAt.toISOString(),
          icon: "CheckCircle",
        });
      } else if (app.status === "Hired") {
        recentActivity.push({
          id: `app-hired-${app._id}`,
          type: "hired",
          title: "Candidate Hired",
          description: `${candidateName} hired for ${jobTitle}.`,
          time: app.hiredDate?.toISOString() || app.updatedAt.toISOString(),
          icon: "Trophy",
        });
      } else if (app.status === "Rejected") {
        recentActivity.push({
          id: `app-rejected-${app._id}`,
          type: "rejected",
          title: "Candidate Rejected",
          description: `${candidateName} was rejected for ${jobTitle}.`,
          time: app.rejectedDate?.toISOString() || app.updatedAt.toISOString(),
          icon: "XCircle",
        });
      }
    });

    // Sort newest first
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Fetch upcoming interviews for jobs posted by this employer
    const upcomingInterviews = await Application.find({
      job: { $in: jobIds },
      status: { $in: ["Interview Scheduled", "Interview Completed"] },
      interviewStatus: "Upcoming"
    })
      .populate("user", "name email profilePicture")
      .populate("job", "title")
      .sort({ interviewDate: 1, interviewTime: 1 })
      .limit(5);

    res.status(200).json({
      user: {
        name: user.name,
      },
      stats: {
        totalJobs,
        activeJobs,
        applications: applicationsCount,
        interviews: interviewsCount,
        applicationsToday,
        shortlisted: shortlistedCount,
        rejected: rejectedCount,
        hired: hiredCount,
      },
      applicationsPerJob,
      applicationsByDate,
      recentActivity: recentActivity.slice(0, 10),
      upcomingInterviews,
    });
  } catch (error) {
    console.error("Employer Dashboard Controller Error:", error);
    res.status(500).json({
      message: "Server error fetching employer dashboard data",
      error: error.message,
    });
  }
};
