const mongoose = require('mongoose');

const RubricScoreSchema = new mongoose.Schema({
    criteriaId: { type: mongoose.Schema.Types.ObjectId, required: true },
    criteria: { type: String, required: true },
    pointsAwarded: { type: Number, required: true },
    maxPoints: { type: Number, required: true }
});

const SubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileUrl: { type: String, required: true },
    note: { type: String }, // Optional message from student
    grade: { type: Number, default: null }, // Total calculated grade
    rubricScores: [RubricScoreSchema], // Individual rubric scores
    feedback: { type: String, default: "" },
    teacherFeedback: { type: String, default: "" }, // Written feedback from teacher
    status: { 
        type: String, 
        enum: ['submitted', 'graded', 'returned'], 
        default: 'submitted' 
    },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date }
});

module.exports = mongoose.model('Submission', SubmissionSchema);