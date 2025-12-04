import React, { useEffect, useState } from 'react';
import api from '../api';

// Lightweight charts using plain SVG to avoid adding dependencies
const LineChart = ({ data }) => {
  const width = 600; const height = 200; const padding = 30;
  if (!data || data.length === 0) return <div className="text-sm opacity-75">No data</div>;
  const maxY = Math.max(...data.map(d => d.count)) || 1;
  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / Math.max(data.length - 1, 1);
    const y = height - padding - (d.count / maxY) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="bg-transparent">
      <polyline fill="none" stroke="#6366F1" strokeWidth="2" points={points} />
      {data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / Math.max(data.length - 1, 1);
        const y = height - padding - (d.count / maxY) * (height - 2 * padding);
        return <circle key={d.date} cx={x} cy={y} r="3" fill="#22C55E" />;
      })}
    </svg>
  );
};

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(localStorage.getItem('role'));
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/analytics/overview');
      setOverview(res.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      alert(err.response?.data?.msg || err.response?.data?.error || 'Failed to load analytics');
    }
  };

  return (
    <div className="min-h-screen neon-grid-bg text-white">
      <div className="neon-card shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">📈 Analytics</h1>
            <p className="text-sm mt-1">Role: <span className="font-semibold">{role}</span></p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!overview ? (
          <div className="neon-surface p-8 rounded-xl">Loading…</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="neon-card p-6 rounded-xl border-l-4 border-indigo-500">
                <h3 className="text-sm font-semibold opacity-85">Total Assignments</h3>
                <div className="text-3xl font-bold text-indigo-400 mt-2">{overview.assignments.total}</div>
                <div className="text-xs opacity-70 mt-1">Published: {overview.assignments.published}</div>
              </div>
              <div className="neon-card p-6 rounded-xl border-l-4 border-emerald-500">
                <h3 className="text-sm font-semibold opacity-85">Submissions</h3>
                <div className="text-3xl font-bold text-emerald-400 mt-2">
                  {Object.values(overview.submissions.byStatus).reduce((a, b) => a + b, 0)}</div>
                <div className="text-xs opacity-70 mt-1">Graded: {overview.submissions.graded.count}</div>
              </div>
              <div className="neon-card p-6 rounded-xl border-l-4 border-yellow-500">
                <h3 className="text-sm font-semibold opacity-85">Average Grade</h3>
                <div className="text-3xl font-bold text-yellow-300 mt-2">
                  {Math.round((overview.submissions.graded.avgGrade || 0) * 10) / 10}
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="neon-card p-6 rounded-xl mb-8">
              <h3 className="text-lg font-bold mb-4">Status Breakdown</h3>
              <div className="grid gap-4 md:grid-cols-4">
                {Object.entries(overview.submissions.byStatus).map(([status, count]) => (
                  <div key={status} className="neon-surface p-4 rounded-lg">
                    <div className="text-xs opacity-80">{status || 'unknown'}</div>
                    <div className="text-2xl font-bold mt-1">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend */}
            <div className="neon-card p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-2">Submissions (last 14 days)</h3>
              <LineChart data={overview.submissions.trend} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;