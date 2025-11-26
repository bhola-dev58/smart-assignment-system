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
      
      const uploadRes = await api.post('/assignments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = uploadRes.data.fileUrl;

      await api.post('/assignments/submit', {
        assignmentId,
        fileUrl,
        note: 'Submitted via dashboard'
      });

      alert('✅ Assignment Submitted Successfully!');
      setSelectedFile({ ...selectedFile, [assignmentId]: null });
      fetchMySubmissions();
    } catch (err) {
      console.error(err);
      alert('❌ Submission failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">📚 Smart Assignment</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back, <span className="font-semibold">{userName}</span> ({role})</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'assignments'
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
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'submissions'
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
              <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border-l-4 border-indigo-600">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">➕ Create New Assignment</h2>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Title</label>
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                      placeholder="e.g., Math Homework - Chapter 5" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
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
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                value={criteria.maxPoints || ''}
                                onChange={(e) => updateRubricCriteria(index, 'maxPoints', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                            <textarea
                              placeholder="Describe what this criteria evaluates..."
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-indigo-600 to-blue-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Description</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Deadline</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignments.map((assign, index) => (
                        <tr key={assign._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{assign.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">{assign.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(assign.deadline).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric' 
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
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
                                  className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition shadow-md"
                                >
                                  📢 Publish
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-lg">
                                  ✅ Published
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  fetchSubmissionsForAssignment(assign._id);
                                  setActiveTab('submissions');
                                }}
                                className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"
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
                    <p className="text-gray-500 text-lg">📭 No assignments created yet.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Student: Card View with Upload */
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assign) => (
                  <div key={assign._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-t-4 border-indigo-400">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{assign.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{assign.description}</p>
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>📅 Deadline:</strong> {new Date(assign.deadline).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      {assign.teacher && (
                        <p className="text-sm text-gray-700 mt-1">
                          <strong>👨‍🏫 By:</strong> {assign.teacher.name}
                        </p>
                      )}
                    </div>
                    
                    {/* Student: Upload Section */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold mb-2 text-gray-700">📎 Upload Your Work:</p>
                      <input 
                        type="file" 
                        onChange={(e) => handleFileChange(assign._id, e)} 
                        className="text-sm mb-3 w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <button 
                        onClick={() => handleSubmit(assign._id)}
                        disabled={uploading}
                        className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                          uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'
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
            )}
          </>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <>
            {role === 'student' ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📂 My Submissions</h2>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-green-600 to-teal-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Assignment</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Submitted On</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">File</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {submissions.map((sub, index) => (
                          <tr key={sub._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition`}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-gray-900">{sub.assignment?.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{sub.assignment?.description?.substring(0, 50)}...</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
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
                              <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                📎 View File
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {sub.grade === null ? (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  ⏳ Pending
                                </span>
                              ) : (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
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
                                      <p className="text-xs font-semibold text-gray-700 mb-2">📊 Rubric Breakdown:</p>
                                      <div className="space-y-1">
                                        {sub.rubricScores.map((score, idx) => (
                                          <div key={idx} className="flex justify-between text-xs">
                                            <span className="text-gray-600">{score.criteria}:</span>
                                            <span className="font-semibold text-indigo-600">{score.pointsAwarded}/{score.maxPoints}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Teacher Feedback */}
                                  <div className="text-sm text-gray-600">
                                    <strong className="text-gray-800">Feedback:</strong> {sub.teacherFeedback || <span className="text-gray-400 italic">No feedback provided</span>}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-sm">Not graded yet</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {submissions.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">📭 You haven't submitted any assignments yet.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">👨‍🏫 Student Submissions</h2>
                {selectedAssignment ? (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-purple-600 to-pink-600">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Submitted On</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">File</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Current Grade</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {submissions.map((sub, index) => {
                            const assignment = assignments.find(a => a._id === selectedAssignment);
                            return (
                            <React.Fragment key={sub._id}>
                              <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">{sub.student?.name?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-bold text-gray-900">{sub.student?.name}</div>
                                      <div className="text-sm text-gray-500">{sub.student?.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
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
                                  <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                    📎 Download
                                  </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  {sub.grade === null ? (
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Not Graded
                                    </span>
                                  ) : (
                                    <div>
                                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
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
                                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition shadow-md"
                                  >
                                    {sub.grade === null ? '📝 Grade' : '✏️ Update'}
                                  </button>
                                </td>
                              </tr>
                              {/* Rubric Grading Panel (Expandable) */}
                              <tr id={`grading-${sub._id}`} className="hidden">
                                <td colSpan="5" className="px-6 py-6 bg-purple-50 border-t-2 border-purple-200">
                                  <div className="max-w-4xl mx-auto">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Rubric Evaluation for {sub.student?.name}</h3>
                                    
                                    {/* Rubric Criteria */}
                                    {assignment?.rubric && assignment.rubric.length > 0 ? (
                                      <div className="space-y-4 mb-6">
                                        {assignment.rubric.map((criteria, idx) => (
                                          <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                              <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-800">{criteria.criteria}</h4>
                                                <p className="text-xs text-gray-600 mt-1">{criteria.description}</p>
                                              </div>
                                              <div className="ml-4">
                                                <label className="text-xs font-semibold text-gray-700">Points:</label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  max={criteria.maxPoints}
                                                  placeholder={`Max: ${criteria.maxPoints}`}
                                                  className="w-20 ml-2 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                                  value={gradeData[sub._id]?.rubricScores?.[idx] || ''}
                                                  onChange={(e) => handleRubricScoreChange(sub._id, idx, Number(e.target.value))}
                                                />
                                                <span className="text-xs text-gray-600 ml-1">/ {criteria.maxPoints}</span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-yellow-800">⚠️ No rubric criteria defined for this assignment.</p>
                                      </div>
                                    )}

                                    {/* Teacher Feedback */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
                                      <label className="block text-sm font-bold text-gray-800 mb-2">✍️ Teacher Feedback</label>
                                      <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleGradeSubmit(sub._id, assignment)}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md font-semibold"
                                      >
                                        💾 Submit Grade
                                      </button>
                                      {sub.status === 'graded' && (
                                        <button
                                          onClick={() => handleReturnSubmission(sub._id)}
                                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md font-semibold"
                                        >
                                          📤 Return to Student
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          )}
                          )}
                        </tbody>
                      </table>
                    </div>
                    {submissions.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">📭 No submissions yet for this assignment.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-gray-700 text-lg font-medium">Select an assignment from the Assignments tab to view submissions</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;