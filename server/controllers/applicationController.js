const Application = require("../models/Application");

exports.applyJob = async (req, res) => {
  try {
    const application = await Application.create(req.body);

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("candidate")
      .populate("job");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};