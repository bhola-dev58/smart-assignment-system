const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware'); // Fixed import

// Check if user is teacher or admin
const teacherOnly = (req, res, next) => {
    // protect middleware adds user to req.user
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ msg: 'Not authorized as teacher' });
    }
};

router.get('/', protect, teacherOnly, getAnalytics);

module.exports = router;