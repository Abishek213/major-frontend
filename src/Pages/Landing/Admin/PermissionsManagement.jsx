import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Check } from 'lucide-react';
import api from "../../../utils/api";

const Alert = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 border-gray-200 text-gray-800',
    destructive: 'bg-red-100 border-red-200 text-red-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${variants[variant]}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children }) => (
  <div className="text-sm font-medium">
    {children}
  </div>
);

const PermissionsManagement = ({ isDarkMode, authToken }) => {
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [roles, setRoles] = useState(['Admin', 'Organizer', 'User']);
  const [newPermission, setNewPermission] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const componentClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

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
        // Refresh data to ensure UI is in sync
        await fetchPermissionsData();
    } finally {
        setIsUpdating(false);
    }
};

  const handleTogglePermission = async (roleId, permissionId, hasPermission) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates
    
    try {
      setIsUpdating(true);
      setError(null);
      
      if (hasPermission) {
        // When removing permission
        const response = await api.safeDelete(`/admin/role-permissions/${encodeURIComponent(roleId)}/${permissionId}`);
        
        // Update local state only if the server request was successful
        if (response.status === 200) {
          setRolePermissions(rolePermissions.filter(
            rp => !(rp.role === roleId && rp.permission === permissionId)
          ));
        }
      } else {
        // When adding permission
        const response = await api.safePost('/admin/role-permissions', {
          role: roleId,
          permission: permissionId
        });
        
        // Update local state only if the server request was successful
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
      // Refresh data from server in case of error to ensure UI is in sync
      await fetchPermissionsData();
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className={`${componentClass} border rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Permissions Management</h3>
            <p className="text-sm opacity-60">Manage system permissions and role access</p>
          </div>
          <Shield className="w-6 h-6 text-indigo-500" />
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPermission}
              onChange={(e) => setNewPermission(e.target.value)}
              placeholder="Enter new permission name"
              className={`flex-1 px-4 py-2 rounded-xl border ${
                isDarkMode 
                  ? 'bg-gray-700/30 border-gray-700 focus:border-indigo-500' 
                  : 'bg-gray-100 border-gray-200 focus:border-indigo-500'
              } focus:outline-none`}
            />
            <button
              onClick={handleCreatePermission}
              className="px-4 py-2 text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2"
              disabled={isUpdating}
            >
              <Plus className="w-4 h-4" />
              Add Permission
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-left font-medium opacity-60">Permission</th>
                {roles.map(role => (
                  <th key={role} className="pb-3 text-center font-medium opacity-60">{role}</th>
                ))}
                <th className="pb-3 text-right font-medium opacity-60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(permission => (
                <tr key={permission._id} className="border-b border-gray-700">
                  <td className="py-4">{permission.permissionName}</td>
                  {roles.map(role => {
                    const hasPermission = rolePermissions.some(
                      rp => rp.role === role && rp.permission === permission._id
                    );
                    return (
                      <td key={role} className="py-4 text-center">
                        <button
                          onClick={() => handleTogglePermission(role, permission._id, hasPermission)}
                          disabled={isUpdating}
                          className={`p-2 rounded-lg transition-colors ${
                            hasPermission
                              ? 'bg-green-500/20 text-green-500'
                              : isDarkMode
                              ? 'bg-gray-700/30 hover:bg-gray-700/50'
                              : 'bg-gray-100 hover:bg-gray-200'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Check className={`w-4 h-4 ${hasPermission ? 'opacity-100' : 'opacity-30'}`} />
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDeletePermission(permission._id)}
                      disabled={isUpdating}
                      className={`p-2 text-red-400 rounded-lg hover:bg-gray-700/30 transition-colors ${
                        isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;