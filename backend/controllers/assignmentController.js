const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Create a new assignment (Teacher only)
// @route   POST /api/assignments
const createAssignment = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ msg: "Access denied. Teachers only." });
        }
        
        const { title, description, deadline } = req.body;
        
        const newAssignment = new Assignment({
            title,
            description,
            deadline,
            teacher: req.user.id
        });

        const savedAssignment = await newAssignment.save();
        res.json(savedAssignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get all assignments (For Students & Teachers)
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
    try {
        // Populate creates a join to show teacher name instead of just ID
        const assignments = await Assignment.find().populate('teacher', 'name email'); 
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Submit an assignment (Student only)
// @route   POST /api/assignments/submit
const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, fileUrl, note } = req.body;

        const newSubmission = new Submission({
            assignment: assignmentId,
            student: req.user.id,
            fileUrl,
            note
        });

        await newSubmission.save();
        res.json({ msg: "Assignment submitted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Grade a submission (Teacher only)
// @route   POST /api/assignments/grade
const gradeSubmission = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ msg: "Access denied. Teachers only." });
        }

        const { submissionId, grade, feedback } = req.body;

        const submission = await Submission.findByIdAndUpdate(
            submissionId,
            { grade, feedback },
            { new: true }
        );

        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get all submissions for an assignment (Teacher only)
// @route   GET /api/assignments/:assignmentId/submissions
const getSubmissionsForAssignment = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ msg: "Access denied. Teachers only." });
        }

        const submissions = await Submission.find({ assignment: req.params.assignmentId })
            .populate('student', 'name email')
            .populate('assignment', 'title');
        
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get student's own submissions
// @route   GET /api/assignments/my-submissions
const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ student: req.user.id })
            .populate('assignment', 'title description deadline');
        
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    createAssignment, 
    getAssignments, 
    submitAssignment, 
    gradeSubmission,
    getSubmissionsForAssignment,
    getMySubmissions 
};