import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Users, DollarSign, Clock, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../utils/api';
import { getToken } from '../../../utils/auth';


const Overview = ({ isDarkMode }) => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          }));

        setChartData(chartData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue" }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600", 
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600"
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-xl`}>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-white opacity-10">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white opacity-20"></div>
          <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white opacity-10"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            {trend && (
              <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
                {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                <span>{trendValue}%</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white/80">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/70">{subtitle}</p>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
    </div>
  );

  const ChartCard = ({ title, children, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-xl">⚠</span>
          </div>
          <div>
            <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const nextEventDate = chartData.length > 0 ? chartData[0].name : "No events";

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Track your event performance and key metrics</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          title="Next Event"
          value={nextEventDate}
          subtitle="Upcoming event date"
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ChartCard 
          title="Attendance Overview" 
          subtitle="Compare attendees vs capacity"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="attendees" 
                  fill="#3b82f6" 
                  name="Attendees"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="capacity" 
                  fill="#93c5fd" 
                  name="Capacity"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="Revenue Trend" 
          subtitle="Track earnings over time"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Quick Actions or Additional Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to create your next event?</h3>
            <p className="text-blue-100">Start planning and reach more attendees with our powerful tools.</p>
          </div>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg">
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;
