const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, verifyOTP } = require('../controllers/authController');
// Route: /api/auth/verify-otp
router.post('/verify-otp', verifyOTP);
const auth = require('../middleware/authMiddleware');

// Route: /api/auth/register
router.post('/register', registerUser);

// Route: /api/auth/login
router.post('/login', loginUser);

// Route: /api/auth/me (Protected)
router.get('/me', auth, getMe);

module.exports = router;