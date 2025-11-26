const mongoose = require('mongoose');

const RubricCriteriaSchema = new mongoose.Schema({
    criteria: { type: String, required: true },
    maxPoints: { type: Number, required: true },
    description: { type: String }
});

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    rubric: [RubricCriteriaSchema], // Rubric criteria for grading
    totalPoints: { type: Number, default: 100 }, // Total points for assignment
    published: { type: Boolean, default: false }, // Assignment visibility status
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);