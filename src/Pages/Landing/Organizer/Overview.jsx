import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  Calendar, Users, DollarSign, Clock, TrendingUp, ArrowUp, ArrowDown, 
  Sparkles, RefreshCw, AlertTriangle, PlusCircle, ChevronRight, Target, 
  Activity, Bot, Award, Zap, BarChart3, MessageCircle, ThumbsUp, 
  ThumbsDown, Eye, Download, Share2, Star, PieChart as PieChartIcon
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../utils/api';
import { getToken } from '../../../utils/auth';
import OrganizerDashboardAI from '../../../components/ai/organizer/OrganizerDashboardAI';
import AIBadge from '../../../components/ai/AIBadge';
import { useOrganizerAI } from '../../../hooks/useOrganizerAI';

const Overview = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [showAIDashboard, setShowAIDashboard] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  const { 
    fetchDashboardMetrics, 
    fetchSentimentAnalysis,
    dashboardMetrics,
    sentimentData,
    loading: aiLoading 
  } = useOrganizerAI(userData?._id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (!decodedToken.user?.email) {
          throw new Error("Unable to verify user email");
        }

        // First get user data
        const userResponse = await api.get(`/users/email/${decodedToken.user.email}`);
        const userData = userResponse.data.user;
        setUserData(userData);
            
        if (!userData || !userData._id) {
          throw new Error("Unable to verify user credentials");
        }

        // Then fetch user events
        const eventsResponse = await api.get(`/events/user/${userData._id}`);
        const userEvents = eventsResponse.data;

        // Calculate stats
        const totalEvents = userEvents.length;
        const upcomingEvents = userEvents.filter(e => new Date(e.event_date) > new Date()).length;
        const totalAttendees = userEvents.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
        const totalRevenue = userEvents.reduce((sum, event) => 
          sum + (event.price * (event.attendees?.length || 0)), 0);

        setStats({
          totalEvents,
          upcomingEvents,
          totalAttendees,
          totalRevenue,
        });

        // Prepare chart data - sort by date and only include future events
        const chartData = userEvents
          .filter(event => new Date(event.event_date) >= new Date())
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .map(event => ({
            name: format(new Date(event.event_date), 'MMM d'),
            attendees: event.attendees?.length || 0,
            revenue: event.price * (event.attendees?.length || 0),
            capacity: event.totalSlots,
            fillRate: ((event.attendees?.length || 0) / event.totalSlots) * 100,
          }));

        setChartData(chartData);

        // Generate AI insights
        generateAIInsights(userEvents, stats);
        
        setError("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshCount]);

  // Fetch AI dashboard data when userData is available
  useEffect(() => {
    if (userData?._id && showAIDashboard) {
      fetchDashboardMetrics(selectedTimeframe);
      fetchSentimentAnalysis();
    }
  }, [userData, showAIDashboard, selectedTimeframe, fetchDashboardMetrics, fetchSentimentAnalysis]);

  const generateAIInsights = (events, currentStats) => {
    const insights = [];

    // Revenue insights
    if (currentStats.totalRevenue > 10000) {
      insights.push({
        type: 'success',
        icon: <DollarSign className="w-4 h-4" />,
        title: 'Revenue Milestone',
        message: `You've crossed $10,000 in total revenue! Great job!`,
        action: 'View breakdown'
      });
    }

    // Attendance insights
    const avgAttendance = currentStats.totalAttendees / (currentStats.totalEvents || 1);
    if (avgAttendance > 50) {
      insights.push({
        type: 'success',
        icon: <Users className="w-4 h-4" />,
        title: 'High Attendance',
        message: `Average attendance of ${Math.round(avgAttendance)} per event - above industry average!`,
        action: 'See trends'
      });
    } else if (avgAttendance < 20) {
      insights.push({
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Attendance Alert',
        message: `Average attendance is ${Math.round(avgAttendance)}. Consider promoting your events more.`,
        action: 'Get tips'
      });
    }

    // Upcoming events insights
    if (currentStats.upcomingEvents === 0) {
      insights.push({
        type: 'info',
        icon: <Calendar className="w-4 h-4" />,
        title: 'No Upcoming Events',
        message: 'You have no upcoming events. Create one now to keep growing!',
        action: 'Create Event'
      });
    } else if (currentStats.upcomingEvents > 5) {
      insights.push({
        type: 'info',
        icon: <Calendar className="w-4 h-4" />,
        title: 'Busy Schedule',
        message: `You have ${currentStats.upcomingEvents} upcoming events. Stay organized!`,
        action: 'View schedule'
      });
    }

    // Fill rate insights
    if (chartData.length > 0) {
      const avgFillRate = chartData.reduce((sum, item) => sum + item.fillRate, 0) / chartData.length;
      if (avgFillRate > 80) {
        insights.push({
          type: 'success',
          icon: <Target className="w-4 h-4" />,
          title: 'Excellent Fill Rate',
          message: `Average fill rate of ${Math.round(avgFillRate)}% - events are very popular!`,
          action: 'Analyze success'
        });
      } else if (avgFillRate < 40) {
        insights.push({
          type: 'warning',
          icon: <Target className="w-4 h-4" />,
          title: 'Low Fill Rate',
          message: `Average fill rate is ${Math.round(avgFillRate)}%. Consider optimizing pricing or marketing.`,
          action: 'Get recommendations'
        });
      }
    }

    setAiInsights(insights);
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-gradient-to-br from-blue-50 to-white border border-blue-100",
      green: "bg-gradient-to-br from-emerald-50 to-white border border-emerald-100", 
      purple: "bg-gradient-to-br from-purple-50 to-white border border-purple-100",
      orange: "bg-gradient-to-br from-amber-50 to-white border border-amber-100"
    };

    const iconColorClasses = {
      blue: "from-blue-500 to-indigo-500",
      green: "from-emerald-500 to-green-500",
      purple: "from-purple-500 to-violet-500", 
      orange: "from-amber-500 to-yellow-500"
    };

    return (
      <div className={`relative overflow-hidden rounded-xl ${colorClasses[color]} p-6 shadow-md hover:shadow-lg transition-shadow duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${iconColorClasses[color]} flex items-center justify-center shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{trendValue}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-gray-600 font-medium">{title}</h3>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, subtitle, icon: Icon = TrendingUp }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Error Loading Dashboard</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="absolute right-4 top-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const nextEventDate = chartData.length > 0 ? chartData[0].name : "No events";
  const averageAttendance = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, item) => sum + item.attendees, 0) / chartData.length)
    : 0;

  // Prepare pie chart data for event distribution
  const pieData = [
    { name: 'Upcoming', value: stats.upcomingEvents, color: '#3b82f6' },
    { name: 'Past', value: stats.totalEvents - stats.upcomingEvents, color: '#94a3b8' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Dashboard Overview
                </h1>
              </div>
              <p className="text-gray-600">
                Track your event performance and key metrics 
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={() => setShowAIDashboard(!showAIDashboard)}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Bot className="w-5 h-5" />
                {showAIDashboard ? 'Hide AI Insights' : 'Show AI Insights'}
              </button>
              <button
                onClick={handleRefresh}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Data
              </button>
            </div>
          </div>

          {/* AI Insights Banner */}
          {aiInsights.length > 0 && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    insight.type === 'success' ? 'bg-green-50 border-green-200' :
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  } flex items-start gap-3`}
                >
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'success' ? 'bg-green-100 text-green-600' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{insight.message}</p>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      {insight.action}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Total Events"
              value={stats.totalEvents}
              subtitle={`${stats.upcomingEvents} upcoming events`}
              icon={Calendar}
              trend="up"
              trendValue="12"
              color="blue"
            />

            <StatCard
              title="Total Attendees" 
              value={stats.totalAttendees.toLocaleString()}
              subtitle="Across all events"
              icon={Users}
              trend="up"
              trendValue="8"
              color="green"
            />

            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              subtitle="All time earnings"
              icon={DollarSign}
              trend="up"
              trendValue="15"
              color="purple"
            />

            <StatCard
              title="Avg Attendance"
              value={averageAttendance}
              subtitle="Per upcoming event"
              icon={Target}
              trend="up"
              trendValue="5"
              color="orange"
            />
          </div>

          {/* AI Dashboard Section */}
          {showAIDashboard && userData && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI-Powered Insights
                </h2>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <OrganizerDashboardAI orgId={userData._id} />
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ChartCard 
              title="Attendance Overview" 
              subtitle="Compare attendees vs capacity"
              icon={Users}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        padding: '12px 16px'
                      }}
                      formatter={(value) => [value, '']}
                      labelStyle={{ color: '#334155', fontWeight: 600 }}
                    />
                    <Bar 
                      dataKey="attendees" 
                      fill="url(#attendeesGradient)"
                      name="Attendees"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      dataKey="capacity" 
                      fill="url(#capacityGradient)"
                      name="Capacity"
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="attendeesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard 
              title="Revenue Trend" 
              subtitle="Track earnings over time"
              icon={DollarSign}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        padding: '12px 16px'
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                      labelStyle={{ color: '#334155', fontWeight: 600 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="url(#revenueGradient)"
                      strokeWidth={3}
                      dot={{ 
                        fill: '#3b82f6', 
                        strokeWidth: 2, 
                        r: 6,
                        stroke: '#ffffff'
                      }}
                      activeDot={{ 
                        r: 8, 
                        fill: '#1d4ed8',
                        stroke: '#ffffff',
                        strokeWidth: 3
                      }}
                    />
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Quick Stats Row */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Event Distribution Pie Chart */}
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Event Distribution
              </h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 shadow-md col-span-3">
              <h3 className="text-sm font-medium text-indigo-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => window.location.href = '/orgdb/create-event'}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center group"
                >
                  <PlusCircle className="w-5 h-5 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Create Event</span>
                </button>
                <button
                  onClick={() => window.location.href = '/orgdb/my-events'}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center group"
                >
                  <Eye className="w-5 h-5 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">View Events</span>
                </button>
                <button
                  onClick={() => window.location.href = '/orgdb/event-requests'}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center group"
                >
                  <Target className="w-5 h-5 text-green-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Requests</span>
                </button>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600">Next Event Date</p>
                  <p className="text-xl font-bold text-gray-800">{nextEventDate}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600">Average Fill Rate</p>
                  <p className="text-xl font-bold text-gray-800">
                    {chartData.length > 0 
                      ? `${Math.round(chartData.reduce((sum, item) => sum + item.fillRate, 0) / chartData.length)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600">Growth Rate</p>
                  <p className="text-xl font-bold text-gray-800">+15%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;