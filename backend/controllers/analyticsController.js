const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Get at-risk students analysis
// @route   GET /api/analytics
// @access  Teacher/Admin
const getAnalytics = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email _id');
    const assignments = await Assignment.find({}).sort({ deadline: 1 });
    const allSubmissions = await Submission.find({}).populate('assignment');

    const analyticsData = students.map(student => {
      const studentSubmissions = allSubmissions.filter(sub =>
        sub.student.toString() === student._id.toString()
      );

      // 1. Grade Performance
      const gradedSubmissions = studentSubmissions.filter(sub => sub.grade !== null);
      const totalScore = gradedSubmissions.reduce((sum, sub) => sum + sub.grade, 0);
      const averageGrade = gradedSubmissions.length > 0 ? (totalScore / gradedSubmissions.length) : 0;

      // 2. Trend Analysis (Last 3 vs Previous)
      const sortedByDate = gradedSubmissions.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      const recent = sortedByDate.slice(-3);
      const recentAvg = recent.length > 0 ? (recent.reduce((sum, s) => sum + s.grade, 0) / recent.length) : 0;
      const trend = recentAvg - averageGrade; // Negative means dropping

      // 3. Procrastination & Late Analysis
      let lateCount = 0;
      let lastMinuteCount = 0; // < 1 hour before deadline
      let missedCount = 0;

      assignments.forEach(assign => {
        // If assignment is published and deadline passed
        if (assign.published && new Date(assign.deadline) < new Date()) {
          const sub = studentSubmissions.find(s => s.assignment._id.toString() === assign._id.toString());

          if (!sub) {
            missedCount++;
          } else {
            const deadline = new Date(assign.deadline);
            const submitted = new Date(sub.submittedAt);

            // Check if late (allow 5 min buffer)
            if (submitted > deadline) lateCount++;

            // Check last minute (within 2 hours)
            const diffHours = (deadline - submitted) / (1000 * 60 * 60);
            if (diffHours >= 0 && diffHours < 2) lastMinuteCount++;
          }
        }
      });

      // 4. Calculate Risk Score (0-100)
      // Higher is worse
      let riskScore = 0;

      // Grades
      if (averageGrade < 50) riskScore += 40;
      else if (averageGrade < 70) riskScore += 20;

      // Trend
      if (trend < -10) riskScore += 15; // Significant drop

      // Missed assignments (Very bad)
      riskScore += (missedCount * 10);

      // Late/Last Minute
      riskScore += (lateCount * 5);
      riskScore += (lastMinuteCount * 2);

      return {
        student: {
          id: student._id,
          name: student.name,
          email: student.email
        },
        metrics: {
          averageGrade: Math.round(averageGrade),
          recentTrend: Math.round(recentAvg), // Show recent avg
          missedAssignments: missedCount,
          lateSubmissions: lateCount,
          lastMinuteSubmissions: lastMinuteCount,
          riskScore: Math.min(riskScore, 100) // Cap at 100
        }
      };
    });

    // Filter and Sort by Risk
    const atRiskStudents = analyticsData
      .sort((a, b) => b.metrics.riskScore - a.metrics.riskScore);

    res.json({
      atRiskStudents,
      totalStudents: students.length,
      classAverage: analyticsData.reduce((acc, curr) => acc + curr.metrics.averageGrade, 0) / (analyticsData.length || 1)
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAnalytics };