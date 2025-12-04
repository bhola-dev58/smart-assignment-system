import React, { useEffect, useState } from 'react';
import api from '../api';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (userId, role) => {
    try {
      setSavingId(userId);
      await api.put(`/admin/users/${userId}/role`, { role });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen neon-grid-bg text-white">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">🛠️ Admin: User Management</h1>
        <div className="neon-card rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 text-white">
              <thead className="bg-gradient-to-r from-indigo-600 to-blue-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr><td className="px-6 py-4" colSpan={4}>Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td className="px-6 py-4" colSpan={4}>No users found</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id}>
                      <td className="px-6 py-3">{u.name}</td>
                      <td className="px-6 py-3">{u.email}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${
                          u.role === 'admin' ? 'border-yellow-400 text-yellow-200' : u.role === 'teacher' ? 'border-blue-400 text-blue-200' : 'border-emerald-400 text-emerald-200'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {['student','teacher','admin'].map(r => (
                            <button
                              key={r}
                              onClick={() => updateRole(u._id, r)}
                              disabled={savingId === u._id}
                              className={`px-3 py-1 rounded neon-btn text-xs ${savingId === u._id ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              Set {r}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;