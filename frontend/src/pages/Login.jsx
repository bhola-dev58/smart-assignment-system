import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      // Save authentication data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userName', res.data.name);
      
      alert('✅ Login Successful! Welcome back!');
      navigate('/dashboard'); 
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || '❌ Login Failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-3xl font-bold text-indigo-600">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to Smart Assignment System</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition shadow-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
            }`}
          >
            {loading ? '⏳ Signing in...' : '🚀 Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account? {' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-semibold mb-2">💡 Quick Start:</p>
          <p className="text-xs text-blue-700">Register as a Teacher or Student to get started!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;