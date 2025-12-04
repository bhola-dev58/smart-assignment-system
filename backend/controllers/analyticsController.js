const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// Build match filter based on role: admin sees all, teacher sees own, students denied
function roleMatch(req) {
  if (req.user.role === 'admin') {
    return {};
  }
  if (req.user.role === 'teacher') {
    return { teacher: req.user.id };
  }
  return null; // students not allowed
}

// GET /api/analytics/overview
// Returns summary cards and trends for assignments and submissions
const getOverview = async (req, res) => {
  try {
    const match = roleMatch(req);
    if (match === null) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Assignments count
    const assignmentsMatch = match;
    const [assignmentsCount] = await Assignment.aggregate([
      { $match: assignmentsMatch },
      { $group: { _id: null, count: { $sum: 1 }, published: { $sum: { $cond: ['$published', 1, 0] } } } },
    ]);

    // Submissions filtered by teacher-owned assignments when teacher
    let submissionsMatch = {};
    if (req.user.role === 'teacher') {
      const teacherAssignmentIds = await Assignment.find(assignmentsMatch).distinct('_id');
      submissionsMatch = { assignment: { $in: teacherAssignmentIds } };
    }
    // admin sees all submissions

    const submissionsAgg = await Submission.aggregate([
      { $match: submissionsMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const gradedAgg = await Submission.aggregate([
      { $match: submissionsMatch },
      { $match: { status: 'graded' } },
      {
        $group: {
          _id: null,
          avgGrade: { $avg: '$grade' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Trend: submissions per day (last 14 days)
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const submissionsTrend = await Submission.aggregate([
      { $match: submissionsMatch },
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      assignments: {
        total: assignmentsCount?.count || 0,
        published: assignmentsCount?.published || 0,
      },
      submissions: {
        byStatus: submissionsAgg.reduce((acc, s) => { acc[s._id || 'unknown'] = s.count; return acc; }, {}),
        graded: { count: gradedAgg[0]?.count || 0, avgGrade: gradedAgg[0]?.avgGrade || 0 },
        trend: submissionsTrend.map((t) => ({ date: t._id, count: t.count })),
      },
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getOverview };