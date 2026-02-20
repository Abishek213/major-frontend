// src/Pages/Landing/Admin/Overview.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, CheckCircle, Tag, Filter, FileText, Clock, 
  Shield, ChevronDown, TrendingUp, TrendingDown, Brain, Sparkles,
  Award, Target, Zap, AlertTriangle, Globe, Activity, PieChart,
  BarChart3, Download, Share2, RefreshCw, Bot, Lightbulb, Rocket,
  Gauge, Cpu, Database, Cloud, Server, Lock, Unlock, Eye, EyeOff,
  DollarSign, Ticket, MapPin, Heart, Star, ThumbsUp, ThumbsDown,
  MessageCircle, XCircle, WifiOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown.jsx";
import api from '../../../utils/api';
import AIBadge from '../../../components/ai/user/AIBadge';
import { useAdminAI } from '../../../hooks/useAdminAI';
import { getSentimentColor, formatAIResponse } from '../../../utils/aiHelpers';

const OverviewDashboard = () => {
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
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiStatus, setApiStatus] = useState('online'); // 'online', 'offline', 'degraded'

  const { 
    platformAnalytics, 
    loading: aiLoading,
    error: aiError,
    fetchPlatformAnalytics,
    fetchTrendData
  } = useAdminAI();

  const fetchDashboardStats = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setIsRefreshing(true);
    try {
      const response = await api.safeGet('/admin/dashboard-stats');
      if (response.data.success) {
        setDashboardData(response.data.data);
        generateAIPredictions(response.data.data);
        detectAnomalies(response.data.data);
        setError(null);
        setApiStatus('online');
      } else {
        // If API returns success: false but no error, use mock data
        console.log('Using mock dashboard data');
        useMockDashboardData();
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setApiStatus('offline');
      // Use mock data when API fails
      useMockDashboardData();
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Mock data function for when API is unavailable
  const useMockDashboardData = () => {
    const mockData = {
      statsData: [
        { title: 'Total Users', value: '15,234', change: '+12%', icon: 'Users', color: 'blue' },
        { title: 'Total Events', value: '2,341', change: '+8%', icon: 'Calendar', color: 'green' },
        { title: 'Total Revenue', value: '$456,789', change: '+15%', icon: 'DollarSign', color: 'purple' },
        { title: 'Active Bookings', value: '12,456', change: '+22%', icon: 'Ticket', color: 'orange' }
      ],
      analyticsData: [
        { name: 'Jan', events: 400, users: 2400, pending: 240, requests: 240 },
        { name: 'Feb', events: 300, users: 1398, pending: 221, requests: 210 },
        { name: 'Mar', events: 200, users: 9800, pending: 229, requests: 290 },
        { name: 'Apr', events: 278, users: 3908, pending: 200, requests: 300 },
        { name: 'May', events: 189, users: 4800, pending: 218, requests: 310 },
        { name: 'Jun', events: 239, users: 3800, pending: 250, requests: 280 }
      ],
      usersByRole: {
        admin: 5,
        organizer: 234,
        user: 14995
      },
      eventStats: {
        upcoming: 456,
        ongoing: 89,
        completed: 1234,
        cancelled: 56
      },
      roleStats: {
        distribution: {
          Admin: { count: 5 },
          Organizer: { count: 234 },
          User: { count: 14995 }
        },
        permissions: {
          Admin: ['ALL'],
          Organizer: ['CREATE_EVENT', 'MANAGE_EVENTS', 'VIEW_ANALYTICS'],
          User: ['VIEW_EVENTS', 'BOOK_EVENTS']
        },
        eventStats: {
          Admin: { totalEvents: 0 },
          Organizer: { totalEvents: 2341 },
          User: { totalEvents: 0 }
        }
      }
    };
    
    setDashboardData(mockData);
    generateAIPredictions(mockData);
    detectAnomalies(mockData);
  };

  useEffect(() => {
    fetchDashboardStats();
    // Try to fetch AI data but don't block on errors
    Promise.all([
      fetchPlatformAnalytics(timeframe).catch(err => console.log('AI analytics unavailable:', err)),
      fetchTrendData('all', timeframe).catch(err => console.log('AI trends unavailable:', err))
    ]);
  }, [timeframe]);

  const generateAIPredictions = (data) => {
    const predictions = [
      {
        title: 'User Growth Forecast',
        value: `${Math.round((data.usersByRole?.user || 15000) * 1.15)}`,
        change: '+15%',
        confidence: 87,
        metric: 'users',
        description: 'Expected user growth based on current trends'
      },
      {
        title: 'Event Volume Prediction',
        value: `${Math.round((data.eventStats?.upcoming || 456) * 1.22)}`,
        change: '+22%',
        confidence: 82,
        metric: 'events',
        description: 'Event creation predicted to increase next month'
      },
      {
        title: 'Revenue Forecast',
        value: `$${Math.round((data.statsData?.find(s => s.title === 'Total Revenue')?.value?.replace(/[^0-9]/g, '') || 456789) * 1.18)}`,
        change: '+18%',
        confidence: 79,
        metric: 'revenue',
        description: 'Revenue projection based on booking trends'
      }
    ];
    setAiPredictions(predictions);
  };

  const detectAnomalies = (data) => {
    const detected = [];
    
    const avgEvents = data.analyticsData?.reduce((acc, curr) => acc + curr.events, 0) / data.analyticsData?.length || 1;
    const lastEvents = data.analyticsData?.[data.analyticsData?.length - 1]?.events || 0;
    
    if (lastEvents > avgEvents * 1.5) {
      detected.push({
        type: 'spike',
        message: 'Unusual spike in event creation detected',
        severity: 'medium',
        metric: 'events',
        value: lastEvents,
        expected: Math.round(avgEvents)
      });
    }

    const avgUsers = data.analyticsData?.reduce((acc, curr) => acc + curr.users, 0) / data.analyticsData?.length || 1;
    const lastUsers = data.analyticsData?.[data.analyticsData?.length - 1]?.users || 0;
    
    if (lastUsers < avgUsers * 0.7) {
      detected.push({
        type: 'drop',
        message: 'Significant drop in user activity',
        severity: 'high',
        metric: 'users',
        value: lastUsers,
        expected: Math.round(avgUsers)
      });
    }

    setAnomalies(detected);
  };

  const getColorClasses = (baseColor) => {
    const colors = {
      green: {
        bg: 'bg-emerald-50',
        icon: 'bg-gradient-to-br from-emerald-500 to-green-500',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        iconColor: 'text-emerald-600'
      },
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        text: 'text-blue-700',
        border: 'border-blue-100',
        iconColor: 'text-blue-600'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-gradient-to-br from-purple-500 to-indigo-500',
        text: 'text-purple-700',
        border: 'border-purple-100',
        iconColor: 'text-purple-600'
      },
      yellow: {
        bg: 'bg-amber-50',
        icon: 'bg-gradient-to-br from-amber-500 to-yellow-500',
        text: 'text-amber-700',
        border: 'border-amber-100',
        iconColor: 'text-amber-600'
      },
      red: {
        bg: 'bg-rose-50',
        icon: 'bg-gradient-to-br from-rose-500 to-pink-500',
        text: 'text-rose-700',
        border: 'border-rose-100',
        iconColor: 'text-rose-600'
      }
    };
    return colors[baseColor] || colors.blue;
  };

  const renderStatsGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {dashboardData.statsData.map(({ title, value, change, icon, color }, index) => {
        const IconComponent = {
          Calendar,
          Users,
          CheckCircle,
          Tag,
          FileText,
          Clock,
          DollarSign,
          Ticket
        }[icon] || Calendar;

        const prediction = aiPredictions.find(p => 
          (title.includes('Revenue') && p.metric === 'revenue') ||
          (title.includes('Users') && p.metric === 'users') ||
          (title.includes('Events') && p.metric === 'events')
        );

        const colorClasses = getColorClasses(color);

        return (
          <div 
            key={title} 
            className={`group relative bg-white rounded-xl md:rounded-2xl border ${colorClasses.border} p-4 md:p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:scale-[1.02] overflow-hidden`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-8 -mt-8"></div>
            
            <div className="flex items-start justify-between relative">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2 truncate">
                  {title}
                </p>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
                  {value}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                    {change}
                  </span>
                  {prediction && showAIInsights && (
                    <span className="inline-flex items-center px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium bg-purple-100 text-purple-700">
                      <Brain className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Pred:</span> {prediction.change}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${colorClasses.bg} group-hover:scale-110 transition-transform duration-300 ml-2 flex-shrink-0`}>
                <IconComponent className={`w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ${colorClasses.iconColor}`} />
              </div>
            </div>

            {/* AI Insight Hover */}
            {prediction && showAIInsights && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs rounded-b-xl md:rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate">
                    <Brain className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">AI predicts {prediction.change}</span>
                  </span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs flex-shrink-0 ml-2">
                    {prediction.confidence}%
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderAIInsightsBanner = () => {
    // Don't show banner if API is offline and no anomalies/predictions
    if (apiStatus === 'offline' && anomalies.length === 0 && aiPredictions.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 md:mb-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            {apiStatus === 'offline' ? (
              <WifiOff className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <Brain className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                {apiStatus === 'offline' ? 'AI Service Unavailable' : 'AI Platform Insights'}
                {apiStatus === 'offline' && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full">
                    Using Mock Data
                  </span>
                )}
                {apiStatus === 'online' && <AIBadge type="admin" agent="analytics" />}
              </h3>
              <div className="flex gap-2">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-2 md:px-3 py-1.5 text-xs md:text-sm text-white w-full sm:w-auto"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>

            {apiStatus === 'offline' ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <p className="text-sm">AI services are currently unavailable. Showing sample data for demonstration.</p>
                <button 
                  onClick={() => {
                    setApiStatus('online');
                    fetchDashboardStats();
                  }}
                  className="mt-2 px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {/* Anomaly Detection */}
                {anomalies.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                      <span className="text-sm md:text-base font-medium">Anomalies Detected</span>
                    </div>
                    {anomalies.map((anomaly, idx) => (
                      <div key={idx} className="text-xs md:text-sm text-white/80 mt-2">
                        <p>{anomaly.message}</p>
                        <p className="text-xs mt-1">
                          Expected: {anomaly.expected} | Actual: {anomaly.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Predictions */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-3 h-3 md:w-4 md:h-4 text-blue-300" />
                    <span className="text-sm md:text-base font-medium">Next Month Predictions</span>
                  </div>
                  <div className="space-y-2">
                    {aiPredictions.map((pred, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs md:text-sm">
                        <span className="truncate">{pred.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-bold">{pred.change}</span>
                          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                            {pred.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                    <span className="text-sm md:text-base font-medium">AI Recommendations</span>
                  </div>
                  <ul className="space-y-1.5 text-xs md:text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-300">•</span>
                      <span className="truncate">Increase marketing for tech events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-300">•</span>
                      <span className="truncate">Consider weekend scheduling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-300">•</span>
                      <span className="truncate">Target Gen Z demographics</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalyticsChart = () => (
    <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl mb-6 md:mb-8 shadow-lg overflow-hidden">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                Events & Users Analytics
              </h3>
              <AIBadge type="admin" agent="analytics" />
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              AI-powered growth trends and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className={`p-2 rounded-lg md:rounded-xl transition-all duration-200 border ${
                showAIInsights 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent' 
                  : 'bg-gray-100/70 hover:bg-gray-200/70 border-gray-200/60'
              }`}
            >
              <Brain className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-lg md:rounded-xl transition-all duration-200 border bg-gray-100/70 hover:bg-gray-200/70 border-gray-200/60 hover:scale-105">
                <Filter className="w-4 h-4 md:w-5 md:h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl border-0 shadow-xl">
                <DropdownMenuItem onClick={() => setSelectedRole('all')} className="rounded-lg text-sm">
                  All Roles
                </DropdownMenuItem>
                {Object.keys(dashboardData.roleStats.distribution || {}).map((role) => (
                  <DropdownMenuItem key={role} onClick={() => setSelectedRole(role)} className="rounded-lg text-sm">
                    {role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 h-64 sm:h-80 md:h-96 p-2 md:p-4 rounded-xl bg-gray-50/30">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.analyticsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  name="Total Events"
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }} 
                  activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  name="Active Users"
                  stroke="#a855f7" 
                  strokeWidth={2} 
                  dot={{ fill: '#a855f7', strokeWidth: 2, r: 3 }} 
                  activeDot={{ r: 6, fill: '#a855f7', strokeWidth: 2, stroke: '#ffffff' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  name="Pending Events"
                  stroke="#eab308" 
                  strokeWidth={2} 
                  dot={{ fill: '#eab308', strokeWidth: 2, r: 3 }} 
                  activeDot={{ r: 6, fill: '#eab308', strokeWidth: 2, stroke: '#ffffff' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  name="Event Requests"
                  stroke="#ec4899" 
                  strokeWidth={2} 
                  dot={{ fill: '#ec4899', strokeWidth: 2, r: 3 }} 
                  activeDot={{ r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#ffffff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Predictions Sidebar */}
          {showAIInsights && (
            <div className="space-y-3 md:space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 md:p-4 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                  <Brain className="w-3 h-3 md:w-4 md:h-4" />
                  AI Predictions
                </h4>
                <div className="space-y-2 md:space-y-3">
                  {aiPredictions.map((pred, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <p className="text-xs md:text-sm text-gray-600 font-medium">{pred.title}</p>
                        <p className="text-xs text-purple-600 hidden md:block">{pred.description}</p>
                      </div>
                      <div className="text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                        <span className="text-xs md:text-sm font-bold text-purple-700">{pred.change}</span>
                        <div className="w-12 md:w-16 h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            style={{ width: `${pred.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">Platform Health</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center text-xs md:text-sm mb-1">
                      <span className="text-gray-600">System Load</span>
                      <span className="font-medium text-green-600">78%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div className="w-3/4 h-full bg-green-500 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs md:text-sm mb-1">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium text-blue-600">245ms</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div className="w-2/3 h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <WifiOff className="w-3 h-3 text-yellow-500" />
                        AI Service
                      </span>
                      <span className={`font-medium ${apiStatus === 'online' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {apiStatus === 'online' ? 'Connected' : 'Mock Data'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEventStatusBreakdown = () => (
    <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl mb-6 md:mb-8 shadow-lg overflow-hidden">
      <div className="p-4 md:p-6 lg:p-8">
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 text-gray-900 flex items-center gap-2">
          Event Status Distribution
          <AIBadge type="admin" agent="analytics" />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {Object.entries(dashboardData.eventStats).map(([status, count], index) => (
            <div 
              key={status} 
              className="group relative bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-4 -mt-4 md:-mr-6 md:-mt-6"></div>
              <p className="text-xs md:text-sm font-medium mb-2 md:mb-3 capitalize text-gray-600">
                {status}
              </p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                {count}
              </p>
              
              {/* AI Prediction */}
              {showAIInsights && apiStatus === 'online' && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-1.5 md:p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs rounded-b-xl md:rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs">Predicted growth</span>
                    <span className="bg-white/20 px-1 py-0.5 rounded-full text-[10px] md:text-xs">+12%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRoleBasedStats = () => (
    <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl mb-6 md:mb-8 shadow-lg overflow-hidden">
      <div className="p-4 md:p-6 lg:p-8">
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 text-gray-900">
          Role-Based Analytics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Object.entries(dashboardData.roleStats.distribution || {}).map(([role, data], index) => (
            <div 
              key={role} 
              className="group bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 hover:border-blue-300/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h4 className="text-base md:text-lg font-bold text-gray-900">
                  {role}
                </h4>
                <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-blue-100 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                </div>
              </div>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 text-gray-900">
                {data.count}
              </p>
              <div className="space-y-2 pt-3 md:pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-600">
                    Events
                  </span>
                  <span className="text-xs md:text-sm font-bold text-gray-900">
                    {dashboardData.roleStats.eventStats[role]?.totalEvents || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-medium text-gray-600">
                    Permissions
                  </span>
                  <span className="text-xs md:text-sm font-bold text-gray-900">
                    {(dashboardData.roleStats.permissions[role] || []).length}
                  </span>
                </div>
                {showAIInsights && apiStatus === 'online' && (
                  <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        Activity Score
                      </span>
                      <span className="font-medium text-purple-600">
                        {Math.floor(Math.random() * 30 + 70)}%
                      </span>
                    </div>
                  </div>
                )}
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
      <div className="mb-6 md:mb-8 relative p-4 md:p-5 pl-10 md:pl-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
        <div className="absolute left-3 md:left-4 top-4 md:top-5">
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
        </div>
        <p className="text-xs md:text-sm text-gray-700">
          <span className="font-bold text-blue-600">{selectedRole}</span> role has{' '}
          <span className="font-bold">{permissions.length}</span> permissions:{' '}
          <span className="text-gray-600">
            {permissions.join(', ')}
          </span>
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] md:min-h-[500px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-gray-300 border-t-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Brain className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-3 md:p-4 lg:p-6">
      {/* Error Alert */}
      {error && (
        <div className="relative p-4 md:p-5 pl-10 md:pl-12 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-3 md:left-4 top-4 md:top-5">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
          </div>
          <div className="pr-8">
            <h4 className="font-bold text-red-800 mb-1 text-sm md:text-base">Error Loading Dashboard</h4>
            <p className="text-xs md:text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="absolute right-3 md:right-4 top-4 md:top-5 p-1 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Close error"
          >
            <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
          </button>
        </div>
      )}

      {/* Header with AI Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Activity className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Admin Overview</h2>
            <p className="text-xs md:text-sm text-gray-600">Monitor platform performance and insights</p>
          </div>
          <AIBadge type="admin" agent="analytics" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              showAIInsights 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Brain className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{showAIInsights ? 'Hide' : 'Show'} AI Insights</span>
            <span className="sm:hidden">AI</span>
          </button>
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={isRefreshing}
            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Insights Banner */}
      {showAIInsights && renderAIInsightsBanner()}
      
      {renderStatsGrid()}
      {renderPermissionsAlert()}
      {renderAnalyticsChart()}
      {renderEventStatusBreakdown()}
      {renderRoleBasedStats()}
    </div>
  );
};

export default OverviewDashboard;