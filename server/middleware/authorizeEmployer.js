const authorizeEmployer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (req.user.role !== 'employer') {
    return res.status(403).json({ message: 'Forbidden: Employers only' });
  }
  next();
};

module.exports = { authorizeEmployer };
