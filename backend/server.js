const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

// Load Config explicitly from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });
// Force-enable Drive if env missing or malformed
if (!process.env.DRIVE_UPLOAD_ENABLED || process.env.DRIVE_UPLOAD_ENABLED.trim() === '') {
	process.env.DRIVE_UPLOAD_ENABLED = 'true';
}

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Parses JSON requests
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/drive', require('./routes/driveRoutes'));

const PORT = process.env.PORT || 5000;
const DRIVE_ENABLED = String(process.env.DRIVE_UPLOAD_ENABLED || '').trim().toLowerCase() === 'true';
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
	console.log(`Drive upload enabled: ${DRIVE_ENABLED}`);
});