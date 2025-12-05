const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const allow = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Use disk storage upload middleware
const { 
    createAssignment,
    publishAssignment,
    getAssignments, 
    submitAssignment, 
    gradeSubmission,
    returnSubmission,
    getSubmissionsForAssignment,
    getMySubmissions,
    uploadAssignmentFile
} = require('../controllers/assignmentController');

// File upload route with auth
// Custom error handler for Multer file size errors
function multerErrorHandler(err, req, res, next) {
    if (err && err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum allowed size is 5MB.' });
    }
    if (err) {
        return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
}

router.post('/upload', auth, (req, res, next) => {
    upload.single('file')(req, res, function (err) {
        if (err) {
            return multerErrorHandler(err, req, res, next);
        }
        uploadAssignmentFile(req, res, next);
    });
});

// All routes here are protected (must be logged in)
// Teachers and admins can create/publish/grade; students submit and view their own
router.post('/', auth, allow('teacher', 'admin'), createAssignment);
router.put('/:id/publish', auth, allow('teacher', 'admin'), publishAssignment);
router.get('/', auth, getAssignments);
router.post('/submit', auth, allow('student'), submitAssignment);
router.post('/grade', auth, allow('teacher', 'admin'), gradeSubmission);
router.put('/submissions/:id/return', auth, allow('teacher', 'admin'), returnSubmission);
router.get('/my-submissions', auth, allow('student'), getMySubmissions);
router.get('/:assignmentId/submissions', auth, allow('teacher', 'admin'), getSubmissionsForAssignment);

module.exports = router;