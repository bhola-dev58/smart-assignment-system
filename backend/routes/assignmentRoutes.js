const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 
const { 
    createAssignment,
    publishAssignment,
    getAssignments, 
    submitAssignment, 
    gradeSubmission,
    returnSubmission,
    getSubmissionsForAssignment,
    getMySubmissions
} = require('../controllers/assignmentController');

router.post('/upload', auth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        
        // Construct the URL: http://localhost:5000/uploads/filename.pdf
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        res.json({ fileUrl: fileUrl });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send('Server Error during upload');
    }
});

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