import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('assignments');

  // Assignments State
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rubric, setRubric] = useState([{ criteria: '', maxPoints: 0, description: '' }]);
  const [totalPoints, setTotalPoints] = useState(100);

  // Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState({});

  // Grading State
  const [gradeData, setGradeData] = useState({});
  const [selectedDescription, setSelectedDescription] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName') || 'User';

    if (!token) {
      navigate('/');
    }

    setRole(userRole);
    setUserName(name);
    fetchAssignments();

    if (userRole === 'student') {
      fetchMySubmissions();
    }
  }, [navigate]);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error("Error fetching assignments", err);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await api.get('/assignments/my-submissions');
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions", err);
    }
  };

  const fetchSubmissionsForAssignment = async (assignmentId) => {
    try {
      const res = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data);
      setSelectedAssignment(assignmentId);
    } catch (err) {
      console.error("Error fetching submissions", err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', {
        title,
        description: desc,
        deadline,
        rubric: rubric.filter(r => r.criteria && r.maxPoints > 0),
        totalPoints
      });
      alert('✅ Assignment Created Successfully!');
      setTitle('');
      setDesc('');
      setDeadline('');
      setRubric([{ criteria: '', maxPoints: 0, description: '' }]);
      setTotalPoints(100);
      fetchAssignments();
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert('❌ Error creating assignment');
    }
  };

  const handlePublishAssignment = async (assignmentId) => {
    try {
      await api.put(`/assignments/${assignmentId}/publish`);
      alert('✅ Assignment Published Successfully!');
      fetchAssignments();
    } catch (err) {
      console.error('Error publishing assignment:', err);
      alert('❌ Error publishing assignment');
    }
  };

  const addRubricCriteria = () => {
    setRubric([...rubric, { criteria: '', maxPoints: 0, description: '' }]);
  };

  const updateRubricCriteria = (index, field, value) => {
    const newRubric = [...rubric];
    newRubric[index][field] = field === 'maxPoints' ? Number(value) : value;
    setRubric(newRubric);
  };

  const removeRubricCriteria = (index) => {
    setRubric(rubric.filter((_, i) => i !== index));
  };

  const handleFileChange = (assignmentId, e) => {
    setSelectedFile({ ...selectedFile, [assignmentId]: e.target.files[0] });
  };

  const handleSubmit = async (assignmentId) => {
    const file = selectedFile[assignmentId];
    if (!file) return alert('Please select a file first');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      console.log('Uploading file:', file.name);
      const uploadRes = await api.post('/assignments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Upload response:', uploadRes.data);
      const fileUrl = uploadRes.data.fileUrl;
      const driveFileId = uploadRes.data.driveFileId;
      if (!fileUrl) {
        throw new Error('No file URL returned from server');
      }
      console.log('Submitting assignment with fileUrl:', fileUrl);
      if (driveFileId) {
        console.log('Drive file ID:', driveFileId);
      }
      await api.post('/assignments/submit', {
        assignmentId,
        fileUrl,
        ...(driveFileId ? { driveFileId } : {}),
        note: 'Submitted via dashboard'
      });
      alert('✅ Assignment Submitted Successfully!');
      setSelectedFile({ ...selectedFile, [assignmentId]: null });
      fetchMySubmissions();
    } catch (err) {
      console.error('Submission error:', err);
      console.error('Error response:', err.response?.data);
      // Multer file too large error handling
      const errorMsg = err.response?.data?.error || err.response?.data?.msg || err.message || 'Unknown error';
      if (
        errorMsg.includes('File too large') ||
        (err.name === 'MulterError' && err.message && err.message.includes('File too large'))
      ) {
        alert('❌ File too large. Maximum allowed size is 5MB.');
      } else {
        alert(`❌ Submission failed: ${errorMsg}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRubricScoreChange = (submissionId, criteriaIndex, pointsAwarded) => {
    setGradeData({
      ...gradeData,
      [submissionId]: {
        ...gradeData[submissionId],
        rubricScores: {
          ...(gradeData[submissionId]?.rubricScores || {}),
          [criteriaIndex]: pointsAwarded
        }
      }
    });
  };

  const handleTeacherFeedbackChange = (submissionId, feedback) => {
    setGradeData({
      ...gradeData,
      [submissionId]: {
        ...gradeData[submissionId],
        teacherFeedback: feedback
      }
    });
  };

  const handleGradeSubmit = async (submissionId, assignment) => {
    const data = gradeData[submissionId];
    if (!data?.rubricScores) return alert('Please grade all rubric criteria');

    const rubricScores = assignment.rubric.map((criteria, index) => ({
      criteriaId: criteria._id,
      criteria: criteria.criteria,
      pointsAwarded: data.rubricScores[index] || 0,
      maxPoints: criteria.maxPoints
    }));

    try {
      await api.post('/assignments/grade', {
        submissionId,
        rubricScores,
        teacherFeedback: data.teacherFeedback || ''
      });
      alert('✅ Submission graded successfully!');
      fetchSubmissionsForAssignment(selectedAssignment);
    } catch (err) {
      console.error('Error grading submission:', err);
      alert('❌ Error grading submission');
    }
  };

  const handleReturnSubmission = async (submissionId) => {
    try {
      await api.put(`/assignments/submissions/${submissionId}/return`);
      alert('✅ Submission returned to student!');
      fetchSubmissionsForAssignment(selectedAssignment);
    } catch (err) {
      console.error('Error returning submission:', err);
      alert('❌ Error returning submission');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen neon-grid-bg text-white">
      {/* Header */}
      <div className="neon-card shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">📚 Smart Assignment</h1>
            <p className="text-sm mt-1 flex items-center gap-2">Welcome back, <span className="font-semibold">{userName}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full border ${role === 'admin' ? 'border-yellow-400 text-yellow-200' : role === 'teacher' ? 'border-blue-400 text-blue-200' : 'border-emerald-400 text-emerald-200'
                }`}>
                {role}
              </span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition shadow-md"
          >
            Logout
          </button>
          {(role === 'admin' || role === 'teacher') && (
            <button
              onClick={() => navigate('/analytics')}
              className="ml-3 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              📈 Analytics
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="neon-card shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-3 font-semibold transition ${activeTab === 'assignments'
                ? 'border-b-4 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
                }`}
            >
              📝 Assignments
            </button>
            <button
              onClick={() => {
                setActiveTab('submissions');
                if (role === 'student') fetchMySubmissions();
              }}
              className={`px-6 py-3 font-semibold transition ${activeTab === 'submissions'
                ? 'border-b-4 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
                }`}
            >
              📂 Submissions
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <>
            {/* Teacher: Create Assignment Form */}
            {role === 'teacher' && (
              <div className="neon-card p-8 rounded-xl shadow-lg mb-8 border-l-4 border-indigo-600">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">➕ Create New Assignment</h2>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Title</label>
                    <input
                      className="neon-input w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Math Homework - Chapter 5"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      className="neon-input w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Provide detailed instructions for students..."
                      rows="4"
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
                    <input
                      type="date"
                      className="neon-input w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                      required
                    />
                  </div>

                  {/* Rubric Criteria Section */}
                  <div className="border-t-2 border-gray-200 pt-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">📊 Rubric Criteria</h3>
                      <button
                        type="button"
                        onClick={addRubricCriteria}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm font-semibold"
                      >
                        ➕ Add Criteria
                      </button>
                    </div>

                    <div className="space-y-4">
                      {rubric.map((criteria, index) => (
                        <div key={index} className="neon-surface p-4 rounded-lg border border-gray-700">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-semibold text-gray-700">Criteria {index + 1}</span>
                            {rubric.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRubricCriteria(index)}
                                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                              >
                                ❌ Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Criteria Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Code Quality"
                                className="neon-input w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                value={criteria.criteria}
                                onChange={(e) => updateRubricCriteria(index, 'criteria', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Max Points</label>
                              <input
                                type="number"
                                placeholder="20"
                                min="0"
                                className="neon-input w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                value={criteria.maxPoints || ''}
                                onChange={(e) => updateRubricCriteria(index, 'maxPoints', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                            <textarea
                              placeholder="Describe what this criteria evaluates..."
                              className="neon-input w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                              rows="2"
                              value={criteria.description}
                              onChange={(e) => updateRubricCriteria(index, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Total Points</label>
                      <input
                        type="number"
                        className="neon-input w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={totalPoints}
                        onChange={(e) => setTotalPoints(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md font-semibold w-full"
                  >
                    💾 Save Assignment (Draft)
                  </button>
                </form>
              </div>
            )}

            {/* Assignment List - Table View for Teacher, Cards for Students */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {role === 'teacher' ? '📋 All Assignments' : '📚 Available Assignments'}
            </h2>

            {role === 'teacher' ? (
              /* Teacher: Table View */
              <div className="neon-card rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700 text-white">
                    <thead className="bg-gradient-to-r from-indigo-600 to-blue-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Deadline</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {assignments.map((assign, index) => (
                        <tr key={assign._id} className={`${index % 2 === 0 ? '' : 'neon-surface'} hover:bg-indigo-900/30 transition`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold">{assign.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm max-w-xs truncate">{assign.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {new Date(assign.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm opacity-80">
                              {new Date(assign.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {!assign.published ? (
                                <button
                                  onClick={() => handlePublishAssignment(assign._id)}
                                  className="inline-flex items-center px-3 py-1.5 neon-btn text-xs font-semibold rounded-lg hover:opacity-95 transition shadow-md"
                                >
                                  📢 Publish
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 bg-emerald-900/30 text-emerald-200 text-xs font-semibold rounded-lg">
                                  ✅ Published
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  fetchSubmissionsForAssignment(assign._id);
                                  setActiveTab('submissions');
                                }}
                                className="inline-flex items-center px-3 py-1.5 neon-btn text-xs font-semibold rounded-lg hover:opacity-95 transition shadow-md"
                              >
                                👀 Submissions
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {assignments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-lg opacity-80">📭 No assignments created yet.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Student: Card View with Upload and Submitted List */
              <>
                {/* Pending/Available Assignments */}
                <h3 className="text-xl font-bold mb-4">📚 Available Assignments</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {assignments
                    .filter(a => !submissions.some(s => s.assignment?._id === a._id && (s.status === 'graded' || s.status === 'approved' || s.grade !== null)))
                    .map((assign) => (
                      <div key={assign._id} className="neon-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-t-4 border-indigo-400">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{assign.title}</h3>
                        <p className="mb-4 line-clamp-3">{assign.description}</p>
                        <button
                          onClick={() => setSelectedDescription(assign)}
                          className="text-gray-900 hover:text-black text-sm font-bold mb-4 inline-flex items-center bg-white/20 px-3 py-1 rounded-full border border-gray-600/30 hover:bg-white/40 transition"
                        >
                          📖 Learn More
                        </button>
                        <div className="neon-surface p-3 rounded-lg mb-4">
                          <p className="text-sm">
                            <strong>📅 Deadline:</strong> {new Date(assign.deadline).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          {assign.teacher && (
                            <p className="text-sm mt-1">
                              <strong>👨‍🏫 By:</strong> {assign.teacher.name}
                            </p>
                          )}
                        </div>

                        {/* Student: Upload Section */}
                        <div className="border-t pt-4">
                          <p className="text-sm font-semibold mb-2">📎 Upload Your Work:</p>
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(assign._id, e)}
                            className="text-sm mb-3 w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                          <button
                            onClick={() => handleSubmit(assign._id)}
                            disabled={uploading}
                            className={`w-full py-2 rounded-lg text-white font-semibold transition ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'
                              }`}
                          >
                            {uploading ? '⏳ Uploading...' : '✅ Submit Assignment'}
                          </button>
                        </div>
                      </div>
                    ))}
                  {assignments.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500 text-lg">📭 No assignments available yet.</p>
                    </div>
                  )}
                </div>

                {/* Submitted Assignments List */}
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-4">✅ Submitted Assignments</h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {submissions
                      .filter(s => s.status === 'graded' || s.status === 'approved' || s.grade !== null)
                      .map((sub) => (
                        <div key={sub._id} className="neon-card p-6 rounded-xl shadow-lg transition border-t-4 border-emerald-500">
                          <h4 className="text-lg font-bold mb-2">{sub.assignment?.title}</h4>
                          <p className="text-sm opacity-85 mb-3">Submitted on {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}</p>
                          <div className="neon-surface p-3 rounded-lg mb-4">
                            <p className="text-sm"><strong>📎 File:</strong> <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">View</a></p>
                            {sub.grade !== null && (
                              <p className="text-sm mt-1"><strong>🏆 Grade:</strong> {sub.grade}/100</p>
                            )}
                            {sub.teacherFeedback && (
                              <p className="text-sm mt-1"><strong>📝 Feedback:</strong> {sub.teacherFeedback}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.grade !== null ? 'bg-emerald-900/30 text-emerald-200' : 'bg-yellow-900/30 text-yellow-200'}`}>
                            {sub.grade !== null ? 'Graded' : 'Pending Approval'}
                          </span>
                        </div>
                      ))}
                    {submissions.filter(s => s.status === 'graded' || s.status === 'approved' || s.grade !== null).length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <p className="opacity-80">No submitted assignments yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <>
            {role === 'student' ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📂 My Submissions</h2>
                <div className="neon-card rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700 text-white">
                      <thead className="bg-gradient-to-r from-green-600 to-teal-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Assignment</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Submitted On</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">File</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {submissions.map((sub, index) => (
                          <tr key={sub._id} className={`${index % 2 === 0 ? '' : 'neon-surface'} hover:bg-teal-900/20 transition`}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold">{sub.assignment?.title}</div>
                              <div className="text-xs opacity-80 mt-1">{sub.assignment?.description?.substring(0, 50)}...</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-sm">
                                📎 View File
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {sub.grade === null ? (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900/30 text-yellow-200">
                                  ⏳ Pending
                                </span>
                              ) : (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-900/30 text-emerald-200">
                                  {sub.grade}/100
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {sub.status === 'graded' || sub.status === 'returned' ? (
                                <div>
                                  {/* Rubric Breakdown */}
                                  {sub.rubricScores && sub.rubricScores.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold mb-2">📊 Rubric Breakdown:</p>
                                      <div className="space-y-1">
                                        {sub.rubricScores.map((score, idx) => (
                                          <div key={idx} className="flex justify-between text-xs">
                                            <span className="opacity-85">{score.criteria}:</span>
                                            <span className="font-semibold">{score.pointsAwarded}/{score.maxPoints}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Teacher Feedback */}
                                  <div className="text-sm">
                                    <strong>Feedback:</strong> {sub.teacherFeedback || <span className="opacity-70 italic">No feedback provided</span>}
                                  </div>
                                </div>
                              ) : (
                                <span className="opacity-70 italic text-sm">Not graded yet</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {submissions.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-lg opacity-80">📭 You haven't submitted any assignments yet.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">👨‍🏫 Student Submissions</h2>
                {selectedAssignment ? (
                  <div className="neon-card rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700 text-white">
                        <thead className="bg-gradient-to-r from-purple-600 to-pink-600">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Submitted On</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">File</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Current Grade</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {submissions.map((sub, index) => {
                            const assignment = assignments.find(a => a._id === selectedAssignment);
                            return (
                              <React.Fragment key={sub._id}>
                                <tr className={`${index % 2 === 0 ? '' : 'neon-surface'} hover:bg-fuchsia-900/20 transition`}>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">{sub.student?.name?.charAt(0).toUpperCase()}</span>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-bold">{sub.student?.name}</div>
                                        <div className="text-sm opacity-80">{sub.student?.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                      {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-sm">
                                      📎 Download
                                    </a>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {sub.grade === null ? (
                                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900/30 text-yellow-200">
                                        Not Graded
                                      </span>
                                    ) : (
                                      <div>
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-900/30 text-emerald-200">
                                          {sub.grade}/{assignment?.totalPoints || 100}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                      onClick={() => {
                                        const expandRow = document.getElementById(`grading-${sub._id}`);
                                        if (expandRow) {
                                          expandRow.classList.toggle('hidden');
                                        }
                                      }}
                                      className="inline-flex items-center px-4 py-2 neon-btn text-sm font-medium rounded-lg hover:opacity-95 transition shadow-md"
                                    >
                                      {sub.grade === null ? '📝 Grade' : '✏️ Update'}
                                    </button>
                                  </td>
                                </tr>
                                {/* Rubric Grading Panel (Expandable) */}
                                <tr id={`grading-${sub._id}`} className="hidden">
                                  <td colSpan="5" className="px-6 py-6 neon-surface border-t-2 border-purple-500/30">
                                    <div className="max-w-4xl mx-auto">
                                      <h3 className="text-lg font-bold mb-4">📊 Rubric Evaluation for {sub.student?.name}</h3>

                                      {/* Rubric Criteria */}
                                      {assignment?.rubric && assignment.rubric.length > 0 ? (
                                        <div className="space-y-4 mb-6">
                                          {assignment.rubric.map((criteria, idx) => (
                                            <div key={idx} className="neon-card p-4 rounded-lg border border-indigo-500/30 shadow-sm">
                                              <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                  <h4 className="text-sm font-bold">{criteria.criteria}</h4>
                                                  <p className="text-xs opacity-85 mt-1">{criteria.description}</p>
                                                </div>
                                                <div className="ml-4">
                                                  <label className="text-xs font-semibold">Points:</label>
                                                  <input
                                                    type="number"
                                                    min="0"
                                                    max={criteria.maxPoints}
                                                    placeholder={`Max: ${criteria.maxPoints}`}
                                                    className="neon-input w-20 ml-2 p-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                                    value={gradeData[sub._id]?.rubricScores?.[idx] || ''}
                                                    onChange={(e) => handleRubricScoreChange(sub._id, idx, Number(e.target.value))}
                                                  />
                                                  <span className="text-xs opacity-85 ml-1">/ {criteria.maxPoints}</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-lg p-4 mb-6">
                                          <p className="text-sm">⚠️ No rubric criteria defined for this assignment.</p>
                                        </div>
                                      )}

                                      {/* Teacher Feedback */}
                                      <div className="neon-card p-4 rounded-lg border border-indigo-500/30 shadow-sm mb-4">
                                        <label className="block text-sm font-bold mb-2">✍️ Teacher Feedback</label>
                                        <textarea
                                          className="neon-input w-full p-3 rounded-lg focus:ring-2 focus:ring-purple-500"
                                          rows="4"
                                          placeholder="Provide detailed feedback for the student..."
                                          value={gradeData[sub._id]?.teacherFeedback || ''}
                                          onChange={(e) => handleTeacherFeedbackChange(sub._id, e.target.value)}
                                        />
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex justify-end space-x-3">
                                        <button
                                          onClick={() => document.getElementById(`grading-${sub._id}`).classList.add('hidden')}
                                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleGradeSubmit(sub._id, assignment)}
                                          className="px-6 py-2 neon-btn text-white rounded-lg hover:opacity-95 transition shadow-md font-semibold"
                                        >
                                          💾 Submit Grade
                                        </button>
                                        {sub.status === 'graded' && (
                                          <button
                                            onClick={() => handleReturnSubmission(sub._id)}
                                            className="px-6 py-2 neon-btn text-white rounded-lg hover:opacity-95 transition shadow-md font-semibold"
                                          >
                                            📤 Return to Student
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            )
                          }
                          )}
                        </tbody>
                      </table>
                    </div>
                    {submissions.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-lg opacity-80">📭 No submissions yet for this assignment.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="neon-surface border border-indigo-500/30 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-lg font-medium">Select an assignment from the Assignments tab to view submissions</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Learn More Modal */}
      {selectedDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn scale-100 transform transition-all border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <h2 className="text-2xl font-bold text-indigo-400">{selectedDescription.title}</h2>
              <button
                onClick={() => setSelectedDescription(null)}
                className="text-gray-400 hover:text-red-400 transition p-2 rounded-full hover:bg-white/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Description Section */}
              <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide mb-3">📝 Assignment Description</h3>
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                  {selectedDescription.description}
                </p>
              </div>

              {/* Meta Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">📅 Deadline</p>
                  <p className="text-white font-semibold text-lg">
                    {new Date(selectedDescription.deadline).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">💯 Total Points</p>
                  <p className="text-white font-semibold text-lg">{selectedDescription.totalPoints || 100} Points</p>
                </div>
              </div>

              {/* Rubric Preview (if applicable) */}
              {selectedDescription.rubric && selectedDescription.rubric.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">📊 Grading Rubric</h3>
                  <div className="space-y-3">
                    {selectedDescription.rubric.map((r, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-gray-700 bg-gray-800 hover:border-indigo-500/50 transition">
                        <div>
                          <p className="font-semibold text-white">{r.criteria}</p>
                          <p className="text-xs text-gray-400">{r.description}</p>
                        </div>
                        <span className="bg-indigo-900/50 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
                          {r.maxPoints} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedDescription(null)}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-lg"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;