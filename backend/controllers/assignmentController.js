const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Create a new assignment (Teacher only)
// @route   POST /api/assignments
const createAssignment = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ msg: "Access denied. Teachers only." });
        }
        
        const { title, description, deadline, rubric, totalPoints } = req.body;
        
        const newAssignment = new Assignment({
            title,
            description,
            deadline,
            teacher: req.user.id,
            rubric: rubric || [],
            totalPoints: totalPoints || 100,
            published: false
        });

        const savedAssignment = await newAssignment.save();
        res.json(savedAssignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Publish an assignment (Teacher only)
// @route   PUT /api/assignments/:id/publish
const publishAssignment = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ msg: "Access denied. Teachers only." });
        }

        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { published: true },
            { new: true }
        );

        res.json({ msg: "Assignment published successfully", assignment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get all assignments (For Students & Teachers)
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
    try {
        let query = {};
        
        // Students only see published assignments
        if (req.user.role === 'student') {
            query.published = true;
        }
        // Teachers see all their assignments
        else if (req.user.role === 'teacher') {
            query.teacher = req.user.id;
        }
        
        const assignments = await Assignment.find(query).populate('teacher', 'name email'); 
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

// @desc    Grade a submission with rubric (Teacher only)
// @route   POST /api/assignments/grade
const gradeSubmission = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ msg: "Access denied. Teachers only." });
        }

        const { submissionId, rubricScores, teacherFeedback } = req.body;

        // Calculate total grade from rubric scores
        let totalGrade = 0;
        if (rubricScores && rubricScores.length > 0) {
            totalGrade = rubricScores.reduce((sum, score) => sum + score.pointsAwarded, 0);
        }

        const submission = await Submission.findByIdAndUpdate(
            submissionId,
            { 
                grade: totalGrade,
                rubricScores: rubricScores || [],
                teacherFeedback: teacherFeedback || '',
                status: 'graded',
                gradedAt: new Date()
            },
            { new: true }
        );

        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Return graded submission to student (Teacher only)
// @route   PUT /api/assignments/submissions/:id/return
const returnSubmission = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ msg: "Access denied. Teachers only." });
        }

        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { status: 'returned' },
            { new: true }
        );

        res.json({ msg: "Submission returned to student", submission });
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
    publishAssignment,
    getAssignments, 
    submitAssignment, 
    gradeSubmission,
    returnSubmission,
    getSubmissionsForAssignment,
    getMySubmissions 
};