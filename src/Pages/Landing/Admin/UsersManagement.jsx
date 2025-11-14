import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import api from "../../../utils/api";

const UsersManagement = ({ isDarkMode }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const componentClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/all');
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-lg">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!userData?.users) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-lg">No user data available</p>
      </div>
    );
  }

  return (
    <div className={`${componentClass} border rounded-xl`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Users by Role</h3>
            <p className="text-sm opacity-60">Total Users: {userData?.counts?.total || 0}</p>
          </div>
          <Users className="w-6 h-6 text-indigo-500" />
        </div>

        {Object.entries(userData.users).map(([role, users]) => (
          <div key={role} className="mb-8 last:mb-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{role}</h3>
              <span className="px-3 py-1 text-sm bg-indigo-500/10 text-indigo-500 rounded-full">
                {userData.counts.byRole[role]} users
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left font-medium opacity-60">Full Name</th>
                    <th className="px-4 py-3 text-left font-medium opacity-60">Email</th>
                    <th className="px-4 py-3 text-left font-medium opacity-60">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-4 py-3">{user.fullname}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersManagement;