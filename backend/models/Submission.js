const mongoose = require('mongoose');

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
    fileUrl: { type: String, required: true }, // URL from Firebase
    note: { type: String }, // Optional message from student
    grade: { type: Number, default: null }, // Null means not graded yet
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);