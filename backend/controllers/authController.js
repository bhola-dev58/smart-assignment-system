const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/mail');

// @desc    Register a new user with OTP email verification
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, inviteCode } = req.body;

        // 1. Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User (admin logic preserved)
        let finalRole = role;
        const allowAdminByEmail = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase() === String(email).toLowerCase();
        const allowAdminByCode = process.env.ADMIN_INVITE_CODE && inviteCode === process.env.ADMIN_INVITE_CODE;
        if (role === 'admin' && !(allowAdminByEmail || allowAdminByCode)) {
            return res.status(403).json({ msg: 'Admin registration not allowed. Provide valid invite code or configured admin email.' });
        }
        const adminsCount = await User.countDocuments({ role: 'admin' });
        if (role === 'admin' && adminsCount === 0) {
            finalRole = 'admin';
        } else if (role === 'admin' && (allowAdminByEmail || allowAdminByCode)) {
            finalRole = 'admin';
        } else if (role === 'admin') {
            finalRole = 'student';
        }

        // 4. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: finalRole,
            isVerified: false,
            otp,
            otpExpiry
        });

        await user.save();

        // 5. Send OTP email (non-blocking UX: allow OTP entry even if email fails)
        let emailSent = true;
        try {
            await sendOTPEmail(email, otp);
        } catch (mailErr) {
            emailSent = false;
            console.error('OTP email error:', mailErr);
        }
        const msg = emailSent
            ? 'Registration successful. Please check your email for the OTP to verify your account.'
            : 'Registration successful. Email delivery failed; please enter the OTP shown on the app if available, or request resend later.';
        res.json({ msg, success: true, emailSent });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// @desc    Verify OTP and activate user
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ msg: 'User already verified' });
        }
        if (!user.otp || !user.otpExpiry || user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ msg: 'OTP expired' });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Issue JWT after verification
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role, name: user.name, msg: 'Account verified and logged in.' });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Login User
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check User
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Validate Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Return Token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                role: user.role, 
                name: user.name,
                msg: "Login successful" 
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get current user info
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Resend OTP to user's email
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ msg: 'User already verified' });
        }
        // regenerate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        try {
            await sendOTPEmail(email, otp);
            return res.json({ success: true, msg: 'OTP resent. Please check your email.' });
        } catch (mailErr) {
            console.error('Resend OTP email error:', mailErr);
            return res.status(500).json({ success: false, msg: 'Failed to resend OTP email. Please try again later.' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { registerUser, loginUser, getMe, verifyOTP, resendOTP };