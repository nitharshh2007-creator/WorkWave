const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
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

    description: {
      type: String,
      required: true,
    },

    skills: [String],

    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["active", "paused", "closed", "archived"],
      default: "active",
    },
    // New fields for posting jobs
    jobType: {
      type: String,
      enum: ["Internship", "Part Time", "Full Time", "Contract", "Remote"],
      required: true,
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
    },
    experience: { type: String },
    requirements: { type: String },
    benefits: { type: String },
    deadline: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);