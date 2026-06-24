const Application = require('../models/Application');

// @desc    Get all applications for the logged-in user
// @route   GET /api/applications/my
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    // req.user.id should be available from the authMiddleware
    const applications = await Application.find({ user: req.user.id }).sort({ createdAt: -1 });
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
        const { jobTitle, company, location, status } = req.body;

        const newApplication = new Application({
            jobTitle,
            company,
            location,
            status,
            user: req.user.id,
        });

        const createdApplication = await newApplication.save();
        res.status(201).json(createdApplication);

    } catch (error) {
        console.error(error);
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

        // Make sure user owns the application
        if (application.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await application.deleteOne();

        res.json({ message: 'Application removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};