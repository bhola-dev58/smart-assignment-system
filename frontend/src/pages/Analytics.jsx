import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, TrendingDown, Clock, XCircle, CheckCircle } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(localStorage.getItem('role'));
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen neon-grid-bg flex items-center justify-center text-white">Loading Analytics...</div>;

  const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#6366F1'];

  return (
    <div className="min-h-screen neon-grid-bg text-white pb-12">
      {/* Header */}
      <div className="neon-card shadow-lg mb-8">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-indigo-400">📉</span> Smart Insight Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Real-time student risk analysis and performance metrics</p>
        </div>
      </div>

      <div className="container mx-auto px-6">

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="neon-card p-6 rounded-xl border-l-4 border-indigo-500 bg-gray-900/50">
            <h3 className="text-gray-400 text-sm font-semibold uppercase">Class Average</h3>
            <div className="text-4xl font-bold text-white mt-2">{Math.round(data?.classAverage || 0)}%</div>
            <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
              <CheckCircle size={14} /> Consistent Performance
            </p>
          </div>

          <div className="neon-card p-6 rounded-xl border-l-4 border-red-500 bg-gray-900/50">
            <h3 className="text-gray-400 text-sm font-semibold uppercase">High Risk Students</h3>
            <div className="text-4xl font-bold text-white mt-2">
              {data?.atRiskStudents?.filter(s => s.metrics.riskScore > 70).length || 0}
            </div>
            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
              <AlertTriangle size={14} /> Immediate Attention Needed
            </p>
          </div>

          <div className="neon-card p-6 rounded-xl border-l-4 border-yellow-500 bg-gray-900/50">
            <h3 className="text-gray-400 text-sm font-semibold uppercase">Late Submissions</h3>
            <div className="text-4xl font-bold text-white mt-2">
              {data?.atRiskStudents?.reduce((acc, curr) => acc + curr.metrics.lateSubmissions, 0) || 0}
            </div>
            <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
              <Clock size={14} /> Last 30 Days
            </p>
          </div>
        </div>

        {/* AT-RISK STUDENTS TABLE */}
        <div className="neon-card rounded-xl overflow-hidden mb-8 shadow-2xl">
          <div className="p-6 border-b border-gray-800 bg-gray-900/80 flex justify-between items-center">
            <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> At-Risk Students
            </h2>
            <span className="text-xs bg-red-900/30 text-red-200 px-3 py-1 rounded-full border border-red-500/30">
              Sorted by Risk Score
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50 text-gray-400 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Risk Score</th>
                  <th className="px-6 py-4 text-center">Avg Grade</th>
                  <th className="px-6 py-4 text-center">Recent Trend</th>
                  <th className="px-6 py-4 text-center">Missed</th>
                  <th className="px-6 py-4 text-center">Procrastination</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.atRiskStudents?.map((item) => {
                  const risk = item.metrics.riskScore;
                  const isHighRisk = risk > 70;
                  const isMediumRisk = risk > 40 && risk <= 70;

                  return (
                    <tr key={item.student.id} className="hover:bg-white/5 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{item.student.name}</div>
                        <div className="text-xs text-gray-400">{item.student.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-flex items-center justify-center">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4"
                              className={isHighRisk ? 'text-red-900' : 'text-gray-700'} fill="none" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4"
                              className={isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-yellow-500' : 'text-green-500'}
                              fill="none" strokeDasharray={125} strokeDashoffset={125 - (125 * risk) / 100} />
                          </svg>
                          <span className="absolute text-xs font-bold">{risk}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        <span className={item.metrics.averageGrade < 60 ? 'text-red-400' : 'text-white'}>
                          {item.metrics.averageGrade}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.metrics.recentTrend < item.metrics.averageGrade - 5 ? (
                            <TrendingDown className="text-red-500" size={16} />
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                          <span className="text-xs text-gray-400 ml-1">
                            {item.metrics.recentTrend}% (Last 3)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.metrics.missedAssignments > 0 ? (
                          <span className="text-red-400 font-bold">{item.metrics.missedAssignments}</span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-xs">
                        {item.metrics.lastMinuteSubmissions > 0 && (
                          <span className="bg-yellow-900/30 text-yellow-200 px-2 py-1 rounded border border-yellow-700/50">
                            {item.metrics.lastMinuteSubmissions} Last Minute
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isHighRisk ? (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-red-500/20 animate-pulse">
                            CRITICAL
                          </span>
                        ) : isMediumRisk ? (
                          <span className="bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/50">
                            WATCH
                          </span>
                        ) : (
                          <span className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-xs font-bold border border-green-500/50">
                            SAFE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Grade Distribution Chart */}
          <div className="neon-card p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-6 text-gray-200">📊 Grade Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.atRiskStudents.map(s => ({
                  name: s.student.name.split(' ')[0],
                  grade: s.metrics.averageGrade
                })).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                  />
                  <Bar dataKey="grade" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Factors Chart */}
          <div className="neon-card p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-6 text-gray-200">⚠️ Risk Compostion</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Safe', value: data?.atRiskStudents.filter(s => s.metrics.riskScore <= 40).length },
                      { name: 'Watch', value: data?.atRiskStudents.filter(s => s.metrics.riskScore > 40 && s.metrics.riskScore <= 70).length },
                      { name: 'Critical', value: data?.atRiskStudents.filter(s => s.metrics.riskScore > 70).length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Safe', color: '#10B981' }, // Green
                      { name: 'Watch', color: '#F59E0B' }, // Yellow
                      { name: 'Critical', color: '#EF4444' } // Red
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;