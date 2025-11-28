const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
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
router.post('/upload', auth, upload.single('file'), uploadAssignmentFile);

// All routes here are protected (must be logged in)
router.post('/', auth, createAssignment);
router.put('/:id/publish', auth, publishAssignment);
router.get('/', auth, getAssignments);
router.post('/submit', auth, submitAssignment);
router.post('/grade', auth, gradeSubmission);
router.put('/submissions/:id/return', auth, returnSubmission);
router.get('/my-submissions', auth, getMySubmissions);
router.get('/:assignmentId/submissions', auth, getSubmissionsForAssignment);

module.exports = router;