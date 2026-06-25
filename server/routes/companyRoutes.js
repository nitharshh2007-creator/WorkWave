const express = require('express');
const router = express.Router();
const { getCompanyById } = require('../controllers/companyController');

// GET company public profile details
router.get('/:id', getCompanyById);

module.exports = router;
