// Supabase import removed
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Create a new assignment (Teacher only)
// @route   POST /api/assignments
const createAssignment = async (req, res) => {
    try {

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

        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { published: true },
            { new: true }
        );

        // Notify all students
        const User = require('../models/User'); // Dynamic import to avoid circular dependency issues if any
        const { sendNewAssignmentEmail } = require('../utils/mail');

        try {
            const students = await User.find({ role: 'student' }).select('email');
            const studentEmails = students.map(s => s.email);

            if (studentEmails.length > 0) {
                await sendNewAssignmentEmail(studentEmails, assignment);
                console.log(`Notification sent to ${studentEmails.length} students.`);
            }
        } catch (mailError) {
            console.error("Failed to send assignment notifications:", mailError);
            // Don't fail the request just because email failed
        }

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
        // Teachers see their own assignments; Admins see all assignments
        else if (req.user.role === 'teacher') {
            query.teacher = req.user.id;
        } else if (req.user.role === 'admin') {
            // no additional filter -> list all assignments for administrative oversight
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
        const { assignmentId, fileUrl, driveFileId, note } = req.body;

        const newSubmission = new Submission({
            assignment: assignmentId,
            student: req.user.id,
            fileUrl,
            driveFileId,
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

// Upload file and return URL (Drive if enabled, else local)
const fs = require('fs');
const path = require('path');
let uploadFileToDrive;
try {
    ({ uploadFileToDrive } = require('../utils/drive'));
} catch (_) {
    uploadFileToDrive = null;
}
let uploadWithOAuth, hasToken;
try {
    ({ uploadWithOAuth, hasToken } = require('../utils/googleOAuth'));
} catch (_) {
    uploadWithOAuth = null;
    hasToken = () => false;
}

const uploadAssignmentFile = async (req, res) => {
    try {
        if (!req.file) {
            console.error('No file uploaded');
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const driveEnabled = String(process.env.DRIVE_UPLOAD_ENABLED || '').trim().toLowerCase() === 'true';
        const canUseOAuth = Boolean(uploadWithOAuth) && hasToken();
        const canUseDrive = false; // disable service account path to avoid quota issues
        if (!canUseOAuth) {
            return res.status(401).json({ error: 'Google OAuth not completed. Visit /api/drive/oauth/init to connect your Drive.' });
        }
        if (canUseOAuth) {
            const localPath = path.join(req.file.destination || 'uploads/', req.file.filename);
            const driveRes = await uploadWithOAuth(localPath, req.file.originalname || req.file.filename, process.env.DRIVE_FOLDER_ID || null);
            try { fs.unlinkSync(localPath); } catch (e) { }
            console.log('File uploaded to Drive via OAuth:', driveRes.webViewLink);
            return res.json({ fileUrl: driveRes.webViewLink, driveFileId: driveRes.fileId });
        }
        // unreachable due to OAuth required above
    } catch (err) {
        console.error('Upload error:', err);
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
    getMySubmissions,
    uploadAssignmentFile
};