const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["candidate", "employer", "admin"], default: "candidate" },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    // Profile fields for completion calculation
    profilePicture: { type: String },
    resumeUrl: { type: String }, // URL of uploaded resume
    resumeFileName: { type: String, default: "" },
    resumeFileSize: { type: Number, default: 0 },
    resumeUploadedAt: { type: Date },
    skills: [{ type: String }],
    bio: { type: String },
    phone: { type: String },
    location: { type: String },
    professionalTitle: { type: String, default: "" },
    profileVisibility: {
      type: String,
      enum: ["public", "recruiters", "private"],
      default: "recruiters",
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);