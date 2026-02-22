import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCircle,
  Calendar,
  Mail,
  Search,
  Filter,
  RefreshCw,
  Clock,
  TrendingUp,
  ChevronDown,
  Eye,
  Shield,
  UserCheck,
  UserX,
  AlertTriangle,
  XCircle,
  Download,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';
import api from "../../../utils/api";

const UsersManagement = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const response = await api.get('/users/all');
      setUserData(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRoleIcon = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return <Shield className="w-5 h-5 text-rose-500" />;
      case 'organizer':
        return <UserCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <UserCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-rose-200';
      case 'organizer':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200';
    }
  };

  const filterUsersByRole = () => {
    if (!userData?.users) return {};
    
    if (selectedRole === 'all') {
      return userData.users;
    }
    
    return {
      [selectedRole]: userData.users[selectedRole] || []
    };
  };

  const filterUsersBySearch = (users) => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredRoles = filterUsersByRole();
  const totalFilteredUsers = Object.values(filteredRoles).reduce((acc, users) => acc + users.length, 0);

  if (loading && !userData) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Users className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Error Alert */}
      {error && (
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Error Loading Users</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Close error"
          >
            <XCircle className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Users Management
              </h1>
              <p className="text-gray-600">
                View and manage all users across the platform
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchUsers}
                disabled={refreshing}
                className={`p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{userData?.counts?.total || 0}</h3>
              <p className="text-gray-600 font-medium">Total Users</p>
              <div className="mt-3 h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{userData?.counts?.byRole?.user || 0}</h3>
              <p className="text-gray-600 font-medium">Regular Users</p>
              <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: userData?.counts?.total ? `${((userData?.counts?.byRole?.user || 0) / userData?.counts?.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <BarChart3 className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{userData?.counts?.byRole?.organizer || 0}</h3>
              <p className="text-gray-600 font-medium">Organizers</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: userData?.counts?.total ? `${((userData?.counts?.byRole?.organizer || 0) / userData?.counts?.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <PieChart className="w-8 h-8 text-rose-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{userData?.counts?.byRole?.admin || 0}</h3>
              <p className="text-gray-600 font-medium">Admins</p>
              <div className="mt-3 h-2 bg-rose-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: userData?.counts?.total ? `${((userData?.counts?.byRole?.admin || 0) / userData?.counts?.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                User Directory
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {totalFilteredUsers} users found
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
              
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300 border ${
                  filterMenuOpen || selectedRole !== 'all'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-md' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {selectedRole === 'all' ? 'All Roles' : selectedRole}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${filterMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Dropdown */}
          {filterMenuOpen && (
            <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-lg animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => { setSelectedRole('all'); setFilterMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedRole === 'all' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  All Roles
                </button>
                <button
                  onClick={() => { setSelectedRole('user'); setFilterMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedRole === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => { setSelectedRole('organizer'); setFilterMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedRole === 'organizer' 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Organizers
                </button>
                <button
                  onClick={() => { setSelectedRole('admin'); setFilterMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedRole === 'admin' 
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Admins
                </button>
              </div>
            </div>
          )}

          {/* Users by Role Sections */}
          <div className="space-y-8">
            {Object.entries(filteredRoles).map(([role, users]) => {
              const filteredUsers = filterUsersBySearch(users);
              const isExpanded = expandedRole === role;
              
              if (filteredUsers.length === 0) return null;
              
              return (
                <div key={role} className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                  {/* Role Header */}
                  <div 
                    className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => setExpandedRole(isExpanded ? null : role)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${getRoleBadgeColor(role)} flex items-center justify-center`}>
                          {getRoleIcon(role)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 capitalize">{role}s</h3>
                          <p className="text-sm text-gray-600">
                            {filteredUsers.length} of {users.length} users
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                          {users.length} total
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Users Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                            <th className="py-4 pl-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                              User
                            </th>
                            <th className="py-4 px-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                              Email
                            </th>
                            <th className="py-4 px-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                              Joined Date
                            </th>
                            <th className="py-4 pr-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr 
                              key={user._id} 
                              className="group border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                            >
                              <td className="py-4 pl-6">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full ${getRoleBadgeColor(role)} flex items-center justify-center`}>
                                    {getRoleIcon(role)}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                                      {user.fullname || 'N/A'}
                                    </span>
                                    {user.isVerified && (
                                      <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700">{user.email}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 pr-6">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                                  <span className={`text-sm font-medium ${user.isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            {/* No Results */}
            {totalFilteredUsers === 0 && (
              <div className="py-16 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Users Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'No users match the selected filters'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('all');
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Last Updated Footer */}
          <div className="mt-6 flex items-center justify-end gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;