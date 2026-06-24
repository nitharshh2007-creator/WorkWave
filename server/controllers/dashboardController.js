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
      appCount = await Application.countDocuments({ candidate: user._id });

      // Get recent applications
      recentApps = await Application.find({ candidate: user._id })
        .populate("job")
        .sort({ createdAt: -1 })
        .limit(5);

      // Get recommended jobs (newest jobs)
      recommendedJobs = await Job.find({}).sort({ createdAt: -1 }).limit(3);

      // Dynamically generate activities from database records
      activities = []; 

      // 1. Job application activities (including interview scheduling)
      recentApps.forEach(app => {
        // Application activity
        activities.push({
          id: `act-app-${app._id}`,
          type: "job_applied",
          detail: `Applied to ${app.job?.title || "a job"}`,
          time: new Date(app.createdAt).toISOString(),
          status: "completed",
        });
        // If the application is accepted, treat as interview scheduled
        if (app.status === "Accepted") {
          activities.push({
            id: `act-interview-${app._id}`,
            type: "interview_scheduled",
            detail: `Interview scheduled for ${app.job?.title || "a job"}`,
            time: new Date(app.updatedAt || app.createdAt).toISOString(),
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
        .populate("candidate", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

      recommendedJobs = await Job.find({ employer: { $ne: user._id } }).limit(3);

      // Generate employer activities based on recent job postings and profile updates
      const recentJobs = await Job.find({ employer: user._id }).sort({ createdAt: -1 }).limit(5);
      activities = recentJobs.map(job => ({
        id: `act-job-${job._id}`,
        type: "job_posted",
        detail: `Posted job ${job.title || "a new position"}`,
        time: new Date(job.createdAt).toISOString(),
        status: "completed",
      }));

      // Profile update activity (if any profile fields are present)
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
    }

    // Dynamic profile fields evaluation
    const profileFields = [
      { key: "name", value: user.name },
      { key: "email", value: user.email },
      { key: "profilePicture", value: user.profilePicture },
      { key: "resume", value: user.resume },
      { key: "skills", value: Array.isArray(user.skills) && user.skills.length > 0 ? user.skills : null },
      { key: "bio", value: user.bio },
    ];
    const missingFields = profileFields.filter(f => !f.value).map(f => f.key);
    const completedCount = profileFields.length - missingFields.length;
    const profileCompletion = Math.round((completedCount / profileFields.length) * 100);

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      stats: {
        // Applications count already computed in appCount
        applications: appCount,
        // Saved jobs count – actual count from SavedJob collection
        savedJobs: user.role === "candidate" ? await SavedJob.countDocuments({ user: user._id }) : 0,
        // Interviews scheduled – count of accepted applications (assuming Accepted means interview scheduled)
        interviews: await Application.countDocuments({ candidate: user._id, status: "Accepted" }),
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
