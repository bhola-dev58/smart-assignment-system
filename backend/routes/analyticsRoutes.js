const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const allow = require('../middleware/roleMiddleware');
const { getOverview } = require('../controllers/analyticsController');

// Admin has global; Teacher has scoped overview; Students denied
router.get('/overview', auth, allow('admin', 'teacher'), getOverview);

module.exports = router;