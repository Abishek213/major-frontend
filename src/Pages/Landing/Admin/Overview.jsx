import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, Tag, Filter, FileText, Clock, Shield, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '../../../Components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../Components/ui/dropdown";
import api from '../../../utils/api';

const OverviewDashboard = ({ isDarkMode }) => {
  const [dashboardData, setDashboardData] = useState({
    statsData: [],
    analyticsData: [],
    usersByRole: {},
    eventStats: {},
    categoryStats: {},
    requestStats: {},
    roleStats: {
      distribution: {},
      permissions: {},
      eventStats: {}
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');

  const componentClass = isDarkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.safeGet('/admin/dashboard-stats');
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const renderStatsGrid = () => (
    <div className="grid grid-cols-1 gap-8 mb-10 md:grid-cols-2 lg:grid-cols-4">
      {dashboardData.statsData.map(({ title, value, change, icon, color }, index) => {
        const IconComponent = {
          Calendar,
          Users,
          CheckCircle,
          Tag,
          FileText,
          Clock
        }[icon] || Calendar;

        return (
          <div 
            key={title} 
            className={`${componentClass} border rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl group relative overflow-hidden`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {title}
                </p>
                <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </h3>
                <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium ${
                  color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  color === 'purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {change}
                </span>
              </div>
              <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${
                color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-gray-100 dark:bg-gray-900/30'
              }`}>
                <IconComponent className={`w-7 h-7 ${
                  color === 'green' ? 'text-green-600 dark:text-green-400' :
                  color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                  color === 'red' ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderAnalyticsChart = () => (
    <div className={`${componentClass} border rounded-2xl mb-10 shadow-lg`}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Events & Users Analytics
            </h3>
            <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Monthly growth trends and performance metrics
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className={`p-3 rounded-xl transition-all duration-200 border ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700/70 border-gray-600/50' : 'bg-gray-100/70 hover:bg-gray-200/70 border-gray-200/60'} hover:scale-105`}>
              <Filter className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl border-0 shadow-xl">
              <DropdownMenuItem onClick={() => setSelectedRole('all')} className="rounded-lg">
                All Roles
              </DropdownMenuItem>
              {Object.keys(dashboardData.roleStats.distribution || {}).map((role) => (
                <DropdownMenuItem key={role} onClick={() => setSelectedRole(role)} className="rounded-lg">
                  {role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className={`h-96 p-4 rounded-xl ${
          isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50/30'
        }`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboardData.analyticsData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis 
                dataKey="name" 
                stroke={isDarkMode ? '#94a3b8' : '#64748b'} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={isDarkMode ? '#94a3b8' : '#64748b'} 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="events" 
                name="Total Events"
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 8, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }} 
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                name="Active Users"
                stroke="#a855f7" 
                strokeWidth={3} 
                dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 8, fill: '#a855f7', strokeWidth: 2, stroke: '#ffffff' }} 
              />
              <Line 
                type="monotone" 
                dataKey="pending" 
                name="Pending Events"
                stroke="#eab308" 
                strokeWidth={3} 
                dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 8, fill: '#eab308', strokeWidth: 2, stroke: '#ffffff' }} 
              />
              <Line 
                type="monotone" 
                dataKey="requests" 
                name="Event Requests"
                stroke="#ec4899" 
                strokeWidth={3} 
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 8, fill: '#ec4899', strokeWidth: 2, stroke: '#ffffff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderEventStatusBreakdown = () => (
    <div className={`${componentClass} border rounded-2xl mb-10 shadow-lg`}>
      <div className="p-8">
        <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Event Status Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(dashboardData.eventStats).map(([status, count], index) => (
            <div 
              key={status} 
              className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 border ${
                isDarkMode ? 'bg-gray-700/50 border-gray-600/50' : 'bg-white border-gray-200'
              } shadow-sm hover:shadow-md`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <p className={`text-sm font-medium mb-3 capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {status}
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoleBasedStats = () => (
    <div className={`${componentClass} border rounded-2xl mb-10 shadow-lg`}>
      <div className="p-8">
        <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Role-Based Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(dashboardData.roleStats.distribution || {}).map(([role, data], index) => (
            <div 
              key={role} 
              className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 border group ${
                isDarkMode ? 'bg-gray-700/50 border-gray-600/50 hover:border-blue-400/50' : 'bg-white border-gray-200 hover:border-blue-300/50'
              } shadow-sm hover:shadow-lg`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {role}
                </h4>
                <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <p className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {data.count}
              </p>
              <div className="space-y-3 pt-4 border-t border-gray-200/20 dark:border-gray-700/30">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Events
                  </span>
                  <span className="text-sm font-bold">
                    {dashboardData.roleStats.eventStats[role]?.totalEvents || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Permissions
                  </span>
                  <span className="text-sm font-bold">
                    {(dashboardData.roleStats.permissions[role] || []).length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPermissionsAlert = () => {
    if (selectedRole === 'all') return null;
    const permissions = dashboardData.roleStats.permissions[selectedRole] || [];
    
    return (
      <Alert className={`mb-10 border-l-4 border-l-blue-500 rounded-2xl ${isDarkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50/50 border-blue-200/50'} shadow-sm`}>
        <AlertDescription className="text-base">
          <span className="font-bold text-blue-600 dark:text-blue-400">{selectedRole}</span> role has{' '}
          <span className="font-bold">{permissions.length}</span> permissions:{' '}
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {permissions.join(', ')}
          </span>
        </AlertDescription>
      </Alert>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {renderStatsGrid()}
      {renderPermissionsAlert()}
      {renderAnalyticsChart()}
      {renderEventStatusBreakdown()}
      {renderRoleBasedStats()}
    </div>
  );
};

export default OverviewDashboard;
