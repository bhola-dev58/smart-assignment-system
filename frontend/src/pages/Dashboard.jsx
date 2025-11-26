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
      await api.post('/assignments', { title, description: desc, deadline });
      alert('✅ Assignment Created Successfully!');
      setTitle(''); 
      setDesc(''); 
      setDeadline('');
      fetchAssignments(); 
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert('❌ Error creating assignment');
    }
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

  const handleGradeChange = (submissionId, field, value) => {
    setGradeData({
      ...gradeData,
      [submissionId]: {
        ...gradeData[submissionId],
        [field]: value
      }
    });
  };

  const handleGradeSubmit = async (submissionId) => {
    const data = gradeData[submissionId];
    if (!data?.grade) return alert('Please enter a grade');

    try {
      await api.post('/assignments/grade', {
        submissionId,
        grade: data.grade,
        feedback: data.feedback || ''
      });
      alert('✅ Submission graded successfully!');
      fetchSubmissionsForAssignment(selectedAssignment);
    } catch (err) {
      console.error('Error grading submission:', err);
      alert('❌ Error grading submission');
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
                  <button 
                    type="submit" 
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md font-semibold"
                  >
                    📤 Publish Assignment
                  </button>
                </form>
              </div>
            )}

            {/* Assignment List */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {role === 'teacher' ? '📋 All Assignments' : '📚 Available Assignments'}
            </h2>
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
                  {role === 'student' && (
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
                  )}

                  {/* Teacher: View Submissions Button */}
                  {role === 'teacher' && (
                    <button
                      onClick={() => {
                        fetchSubmissionsForAssignment(assign._id);
                        setActiveTab('submissions');
                      }}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition shadow-md font-semibold"
                    >
                      👀 View Submissions
                    </button>
                  )}
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">📭 No assignments available yet.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <>
            {role === 'student' ? (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📂 My Submissions</h2>
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div key={sub._id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{sub.assignment?.title}</h3>
                          <p className="text-gray-600 mb-3">{sub.assignment?.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-700"><strong>📅 Submitted:</strong> {new Date(sub.submittedAt).toLocaleString()}</p>
                              <p className="text-gray-700"><strong>📎 File:</strong> <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View File</a></p>
                            </div>
                            <div>
                              {sub.grade === null ? (
                                <p className="text-yellow-600 font-semibold">⏳ Awaiting Grade</p>
                              ) : (
                                <>
                                  <p className="text-green-700 font-bold text-lg">✅ Grade: {sub.grade}/100</p>
                                  {sub.feedback && <p className="text-gray-600 mt-2"><strong>💬 Feedback:</strong> {sub.feedback}</p>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <div className="space-y-4">
                    {submissions.map((sub) => (
                      <div key={sub._id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">👤 {sub.student?.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">📧 {sub.student?.email}</p>
                            <p className="text-gray-700 text-sm"><strong>📅 Submitted:</strong> {new Date(sub.submittedAt).toLocaleString()}</p>
                            <p className="text-gray-700 text-sm mt-2">
                              <strong>📎 File:</strong> <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download/View</a>
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-3">📊 Grade Submission</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Grade (0-100)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder={sub.grade ?? "Enter grade"}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                  onChange={(e) => handleGradeChange(sub._id, 'grade', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Feedback (Optional)</label>
                                <textarea
                                  placeholder={sub.feedback || "Enter feedback"}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                  rows="3"
                                  onChange={(e) => handleGradeChange(sub._id, 'feedback', e.target.value)}
                                />
                              </div>
                              <button
                                onClick={() => handleGradeSubmit(sub._id)}
                                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition shadow-md font-semibold"
                              >
                                ✅ Submit Grade
                              </button>
                            </div>
                            {sub.grade !== null && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 font-semibold">Current Grade: {sub.grade}/100</p>
                                {sub.feedback && <p className="text-green-700 text-sm mt-1">Feedback: {sub.feedback}</p>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {submissions.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">📭 No submissions yet for this assignment.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">👈 Select an assignment from the Assignments tab to view submissions.</p>
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