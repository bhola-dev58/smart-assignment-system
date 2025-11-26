import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      return alert('❌ Passwords do not match!');
    }
    
    if (formData.password.length < 6) {
      return alert('❌ Password must be at least 6 characters long!');
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      // Save token and role
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', formData.role);
      localStorage.setItem('userName', formData.name);
      
      alert('✅ Registration Successful! Welcome aboard!');
      navigate('/dashboard');
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || '❌ Registration Failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-3xl font-bold text-indigo-600">Create Account</h2>
          <p className="text-gray-600 mt-2">Join Smart Assignment System</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`p-3 rounded-lg border-2 transition font-semibold ${
                  formData.role === 'student'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'teacher' })}
                className={`p-3 rounded-lg border-2 transition font-semibold ${
                  formData.role === 'teacher'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                }`}
              >
                👨‍🏫 Teacher
              </button>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition shadow-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
            }`}
          >
            {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account? {' '}
            <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
