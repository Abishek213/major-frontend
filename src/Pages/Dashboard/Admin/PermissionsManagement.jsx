import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Check, AlertTriangle, RefreshCw, TrendingUp, Settings } from 'lucide-react';
import api from "../../../utils/api";

const Alert = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 border border-gray-200 text-gray-800',
    destructive: 'bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-800',
  };

  return (
    <div className={`relative p-5 pl-14 rounded-lg shadow-sm animate-fade-in ${variants[variant]}`}>
      <div className="absolute left-5 top-5">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <div className="pr-10">
        <h4 className="font-bold text-red-800 mb-1">Action Required</h4>
        <div className="text-sm text-red-600 font-medium">
          {children}
        </div>
      </div>
    </div>
  );
};

const PermissionsManagement = ({ authToken }) => {
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [roles, setRoles] = useState(['Admin', 'Organizer', 'User']);
  const [newPermission, setNewPermission] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPermissionsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
        api.safeGet('/admin/permissions'),
        api.safeGet('/admin/role-permissions')
      ]);

      setPermissions(permissionsResponse.data.data);
      setRolePermissions(rolePermissionsResponse.data.data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err.response?.data?.message || err.message);
      setPermissions([]);
      setRolePermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissionsData();
  }, [authToken]);

  const handleCreatePermission = async () => {
    if (!newPermission.trim()) return;

    try {
      setError(null);
      const response = await api.safePost('/admin/permissions', {
        permissionName: newPermission
      });

      setPermissions([...permissions, response.data.data]);
      setNewPermission('');
    } catch (err) {
      console.error('Error creating permission:', err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    try {
        setError(null);
        setIsUpdating(true);
        
        const response = await api.safeDelete(`/admin/permissions/${permissionId}`);
        
        if (response.status === 200) {
            setPermissions(permissions.filter(p => p._id !== permissionId));
            setRolePermissions(rolePermissions.filter(rp => rp.permission !== permissionId));
        }
    } catch (err) {
        console.error('Error deleting permission:', err);
        setError(err.data?.message || err.message || 'Failed to delete permission');
        await fetchPermissionsData();
    } finally {
        setIsUpdating(false);
    }
};

  const handleTogglePermission = async (roleId, permissionId, hasPermission) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      setError(null);
      
      if (hasPermission) {
        const response = await api.safeDelete(`/admin/role-permissions/${encodeURIComponent(roleId)}/${permissionId}`);
        
        if (response.status === 200) {
          setRolePermissions(rolePermissions.filter(
            rp => !(rp.role === roleId && rp.permission === permissionId)
          ));
        }
      } else {
        const response = await api.safePost('/admin/role-permissions', {
          role: roleId,
          permission: permissionId
        });
        
        if (response.status === 201) {
          setRolePermissions([
            ...rolePermissions,
            { role: roleId, permission: permissionId }
          ]);
        }
      }
    } catch (err) {
      console.error('Error toggling permission:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to update permission. Please try again.'
      );
      await fetchPermissionsData();
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Loading permissions data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {error && (
        <div className="animate-fade-in">
          <Alert variant="destructive">
            {error}
          </Alert>
        </div>
      )}
      
      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                Permissions Management Dashboard
              </h1>
              <p className="text-gray-600">
                Manage system permissions and control role-based access levels
              </p>
            </div>
            
            <button 
              onClick={fetchPermissionsData}
              disabled={isUpdating}
              className={`mt-4 md:mt-0 px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                isUpdating 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Refresh Data
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{permissions.length}</h3>
              <p className="text-gray-600 font-medium">Total Permissions</p>
              <div className="mt-3 h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{rolePermissions.length}</h3>
              <p className="text-gray-600 font-medium">Active Assignments</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{roles.length}</h3>
              <p className="text-gray-600 font-medium">System Roles</p>
              <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Permissions Management Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  Manage Permissions & Access
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {permissions.length} permissions across {roles.length} roles
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Add Permission Form */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 mb-2">Create New Permission</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add a new permission to the system. Permissions control access to specific features.
                </p>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newPermission}
                  onChange={(e) => setNewPermission(e.target.value)}
                  placeholder="Enter permission name (e.g., 'manage_users', 'view_reports')"
                  className={`flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all bg-white`}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreatePermission()}
                />
                <button
                  onClick={handleCreatePermission}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                    isUpdating 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                  }`}
                  disabled={isUpdating || !newPermission.trim()}
                >
                  <Plus className="w-5 h-5" />
                  Add Permission
                </button>
              </div>
            </div>

            {/* Permissions Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="py-4 pl-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Permission
                      </th>
                      {roles.map(role => (
                        <th key={role} className="py-4 text-center font-bold text-gray-700 text-sm uppercase tracking-wider">
                          {role}
                        </th>
                      ))}
                      <th className="py-4 pr-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.length > 0 ? (
                      permissions.map(permission => (
                        <tr 
                          key={permission._id} 
                          className="group border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                        >
                          <td className="py-5 pl-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-sm">
                                <Settings className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                  {permission.permissionName}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  ID: {permission._id.substring(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          {roles.map(role => {
                            const hasPermission = rolePermissions.some(
                              rp => rp.role === role && rp.permission === permission._id
                            );
                            return (
                              <td key={role} className="py-5 text-center">
                                <button
                                  onClick={() => handleTogglePermission(role, permission._id, hasPermission)}
                                  disabled={isUpdating}
                                  className={`group/toggle p-2.5 rounded-xl transition-all duration-300 ${
                                    hasPermission
                                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md hover:shadow-lg hover:scale-110'
                                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 hover:scale-110'
                                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Check className={`w-5 h-5 ${hasPermission ? 'text-white' : 'text-gray-400'}`} />
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-5 pr-6">
                            <button
                              onClick={() => handleDeletePermission(permission._id)}
                              disabled={isUpdating}
                              className={`group/delete p-2.5 rounded-xl transition-all duration-300 ${
                                isUpdating 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                              }`}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={roles.length + 2} className="py-16 text-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Settings className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-700 mb-2">No Permissions Found</h3>
                          <p className="text-gray-500 mb-6">
                            Start by adding your first permission to the system.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Understanding Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Green Check</p>
                    <p className="text-sm text-gray-600">Permission is granted to this role</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <Check className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Gray Check</p>
                    <p className="text-sm text-gray-600">Permission is not granted (click to add)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;