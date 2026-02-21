import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  PlusCircle,
  ChevronRight,
  Target,
  Activity,
  Bot,
  Award,
  Zap,
  BarChart3,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Download,
  Share2,
  Star,
  PieChart as PieChartIcon,
  Smile,
  Frown,
  Meh,
  BookOpen,
  BarChart2,
} from "lucide-react";
import { format } from "date-fns";
import api from "../../../utils/api";
import { getToken } from "../../../utils/auth";
import OrganizerDashboardAI from "../../../components/ai/organizer/OrganizerDashboardAI";
import { useOrganizerAI } from "../../../hooks/useOrganizerAI";

// ─── Helpers ────────────────────────────────────────────────────────────────

const pct = (num, denom) => (denom > 0 ? Math.round((num / denom) * 100) : 0);
const fmtMoney = (v) => `$${Number(v || 0).toLocaleString()}`;
const fmtNum = (v) => Number(v || 0).toLocaleString();

// ─── Sub-components ─────────────────────────────────────────────────────────

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-white border border-blue-100",
    green:
      "bg-gradient-to-br from-emerald-50 to-white border border-emerald-100",
    purple:
      "bg-gradient-to-br from-purple-50 to-white border border-purple-100",
    orange: "bg-gradient-to-br from-amber-50 to-white border border-amber-100",
    rose: "bg-gradient-to-br from-rose-50 to-white border border-rose-100",
  };
  const iconColorClasses = {
    blue: "from-blue-500 to-indigo-500",
    green: "from-emerald-500 to-green-500",
    purple: "from-purple-500 to-violet-500",
    orange: "from-amber-500 to-yellow-500",
    rose: "from-rose-500 to-pink-500",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${colorClasses[color]} p-6 shadow-md hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${iconColorClasses[color]} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend != null && trendValue != null && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
              trend === "up"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {trend === "up" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
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

const ChartCard = ({ title, children, subtitle, icon: Icon = TrendingUp }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="space-y-8 p-4 md:p-6">
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SentimentBar = ({ label, value, total, color, icon: Icon }) => {
  const width = pct(value, total);
  return (
    <div className="flex items-center gap-3">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-gray-600 w-14">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${
            color.includes("green")
              ? "from-green-400 to-emerald-500"
              : color.includes("yellow")
              ? "from-yellow-400 to-amber-500"
              : "from-rose-400 to-red-500"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">
        {value}
      </span>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Overview = () => {
  // Core state
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Event data
  const [events, setEvents] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Basic stats (computed from events)
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
  });

  // AI Dashboard metrics from backend
  const [aiMetrics, setAiMetrics] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAIDashboard, setShowAIDashboard] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  // Derived AI data
  const [revenueMetrics, setRevenueMetrics] = useState(null);
  const [bookingMetrics, setBookingMetrics] = useState(null);
  const [ratingMetrics, setRatingMetrics] = useState(null);
  const [sentimentMetrics, setSentimentMetrics] = useState(null);
  const [trendsMetrics, setTrendsMetrics] = useState(null);
  const [eventMetrics, setEventMetrics] = useState(null);

  // AI Insights (computed)
  const [aiInsights, setAiInsights] = useState([]);

  const { fetchDashboardMetrics, fetchSentimentAnalysis } = useOrganizerAI(
    userData?._id
  );

  // ── Fetch core event data ──────────────────────────────────────────────────
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("No authentication token found");

      // Decode token safely
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = decodedToken.userId || decodedToken.user?._id || decodedToken.user?.id;

      if (!userId) throw new Error("Unable to verify user identity");

      // Directly fetch user by ID (no email verification)
      const userResponse = await api.get(`/users/${userId}`);
      const user = userResponse.data.user || userResponse.data;

      setUserData(user);
      if (!user?._id) throw new Error("Invalid user credentials");

      // Fetch events
      const eventsResponse = await api.get(`/events/user/${user._id}`);
      const userEvents = eventsResponse.data;

      setEvents(userEvents);

      const totalEvents = userEvents.length;
      const upcomingEvents = userEvents.filter(
        (e) => new Date(e.event_date) > new Date()
      ).length;

      const totalAttendees = userEvents.reduce(
        (s, e) => s + (e.attendees?.length || 0),
        0
      );

      const totalRevenue = userEvents.reduce(
        (s, e) => s + e.price * (e.attendees?.length || 0),
        0
      );

      setStats({
        totalEvents,
        upcomingEvents,
        totalAttendees,
        totalRevenue,
      });

      const cd = userEvents
        .filter((e) => new Date(e.event_date) >= new Date())
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .map((e) => ({
          name: format(new Date(e.event_date), "MMM d"),
          attendees: e.attendees?.length || 0,
          revenue: e.price * (e.attendees?.length || 0),
          capacity: e.totalSlots,
          fillRate: pct(e.attendees?.length || 0, e.totalSlots),
        }));

      setChartData(cd);
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


  // ── Fetch AI dashboard metrics ─────────────────────────────────────────────
  const fetchAIMetrics = useCallback(async (orgId, timeframe) => {
    if (!orgId) return;
    setAiLoading(true);
    try {
      const params = `?dateRange=${timeframe}`;

      const [
        metricsRes,
        revenueRes,
        bookingRes,
        ratingRes,
        sentimentRes,
        trendsRes,
        eventsRes,
      ] = await Promise.allSettled([
        api.get(`/ai/dashboard/metrics/${orgId}${params}`),
        api.get(`/ai/dashboard/revenue/${orgId}${params}`),
        api.get(`/ai/dashboard/bookings/${orgId}${params}`),
        api.get(`/ai/dashboard/ratings/${orgId}${params}`),
        api.get(`/ai/dashboard/sentiment/${orgId}${params}`),
        api.get(`/ai/dashboard/trends/${orgId}${params}`),
        api.get(`/ai/dashboard/events/${orgId}${params}`),
      ]);

      if (metricsRes.status === "fulfilled")
        setAiMetrics(metricsRes.value.data?.data);
      if (revenueRes.status === "fulfilled")
        setRevenueMetrics(revenueRes.value.data?.data);
      if (bookingRes.status === "fulfilled")
        setBookingMetrics(bookingRes.value.data?.data);
      if (ratingRes.status === "fulfilled")
        setRatingMetrics(ratingRes.value.data?.data);
      if (sentimentRes.status === "fulfilled")
        setSentimentMetrics(sentimentRes.value.data?.data);
      if (trendsRes.status === "fulfilled")
        setTrendsMetrics(trendsRes.value.data?.data);
      if (eventsRes.status === "fulfilled")
        setEventMetrics(eventsRes.value.data?.data);
    } catch (err) {
      console.error("AI metrics fetch error:", err);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userData?._id) fetchAIMetrics(userData._id, selectedTimeframe);
  }, [userData, selectedTimeframe, refreshCount, fetchAIMetrics]);

  // ── Generate insights from real data ──────────────────────────────────────
  useEffect(() => {
    const insights = [];

    // Revenue
    const rev = revenueMetrics?.total || stats.totalRevenue;
    if (rev > 10000) {
      insights.push({
        type: "success",
        icon: <DollarSign className="w-4 h-4" />,
        title: "Revenue Milestone",
        message: `You've crossed ${fmtMoney(rev)} in total revenue. Great job!`,
        action: "View breakdown",
      });
    }

    // Ratings
    if (ratingMetrics?.average > 0) {
      const avg = ratingMetrics.average.toFixed(1);
      if (ratingMetrics.average >= 4) {
        insights.push({
          type: "success",
          icon: <Star className="w-4 h-4" />,
          title: "Excellent Ratings",
          message: `Your events average ${avg}★ across ${fmtNum(
            ratingMetrics.total
          )} reviews!`,
          action: "View reviews",
        });
      } else if (ratingMetrics.average < 3) {
        insights.push({
          type: "warning",
          icon: <Star className="w-4 h-4" />,
          title: "Ratings Need Attention",
          message: `Average rating is ${avg}★. Consider improving event quality.`,
          action: "See feedback",
        });
      }
    }

    // Sentiment
    if (sentimentMetrics?.totalAnalyzed > 0) {
      const { positive, negative, neutral } = sentimentMetrics.distribution;
      const total = positive + negative + neutral;
      if (pct(negative, total) > 30) {
        insights.push({
          type: "warning",
          icon: <ThumbsDown className="w-4 h-4" />,
          title: "Negative Feedback Alert",
          message: `${pct(
            negative,
            total
          )}% of reviews show negative sentiment. Check common issues.`,
          action: "View sentiment",
        });
      } else if (pct(positive, total) > 70) {
        insights.push({
          type: "success",
          icon: <ThumbsUp className="w-4 h-4" />,
          title: "Great Attendee Sentiment",
          message: `${pct(
            positive,
            total
          )}% of reviews are positive. Keep it up!`,
          action: "Analyze success",
        });
      }
    }

    // Booking conversion
    if (bookingMetrics?.conversionRate > 0) {
      const convPct = Math.round(bookingMetrics.conversionRate * 100);
      if (convPct > 80) {
        insights.push({
          type: "success",
          icon: <Target className="w-4 h-4" />,
          title: "High Booking Conversion",
          message: `${convPct}% of seats are booked. Events are selling well!`,
          action: "Analyse success",
        });
      } else if (convPct < 40) {
        insights.push({
          type: "warning",
          icon: <Target className="w-4 h-4" />,
          title: "Low Seat Conversion",
          message: `Only ${convPct}% of available seats are booked. Consider marketing.`,
          action: "Get tips",
        });
      }
    }

    // Upcoming events
    if (stats.upcomingEvents === 0) {
      insights.push({
        type: "info",
        icon: <Calendar className="w-4 h-4" />,
        title: "No Upcoming Events",
        message: "You have no upcoming events. Create one now to keep growing!",
        action: "Create Event",
      });
    } else if (stats.upcomingEvents > 5) {
      insights.push({
        type: "info",
        icon: <Calendar className="w-4 h-4" />,
        title: "Busy Schedule",
        message: `You have ${stats.upcomingEvents} upcoming events. Stay organised!`,
        action: "View schedule",
      });
    }

    setAiInsights(insights);
  }, [stats, revenueMetrics, ratingMetrics, sentimentMetrics, bookingMetrics]);

  // ── AI Component effects ───────────────────────────────────────────────────
  useEffect(() => {
    if (userData?._id && showAIDashboard) {
      fetchDashboardMetrics(selectedTimeframe);
      fetchSentimentAnalysis();
    }
  }, [
    userData,
    showAIDashboard,
    selectedTimeframe,
    fetchDashboardMetrics,
    fetchSentimentAnalysis,
  ]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const nextEventDate = chartData.length > 0 ? chartData[0].name : "No events";
  const avgFillRate =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((s, i) => s + i.fillRate, 0) / chartData.length
        )
      : 0;
  const averageAttendance =
    chartData.length > 0
      ? Math.round(
          chartData.reduce((s, i) => s + i.attendees, 0) / chartData.length
        )
      : 0;

  // Trend values from AI metrics vs basic stats
  const realRevenue = revenueMetrics?.total ?? stats.totalRevenue;
  const realBookings = bookingMetrics?.total ?? stats.totalAttendees;
  const conversionPct = bookingMetrics
    ? Math.round((bookingMetrics.conversionRate || 0) * 100)
    : 0;
  const avgRating = ratingMetrics?.average
    ? ratingMetrics.average.toFixed(1)
    : "—";
  const totalReviews = ratingMetrics?.total ?? 0;

  // Sentiment totals
  const sentTotal = sentimentMetrics
    ? sentimentMetrics.distribution.positive +
      sentimentMetrics.distribution.neutral +
      sentimentMetrics.distribution.negative
    : 0;

  // Revenue by month chart
  const revenueChartData =
    revenueMetrics?.byMonth?.map((m) => ({
      name: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
      revenue: m.revenue,
      bookings: m.bookings,
    })) ?? chartData;

  // Pie chart data
  const pieData = [
    { name: "Upcoming", value: stats.upcomingEvents, color: "#3b82f6" },
    {
      name: "Past",
      value: stats.totalEvents - stats.upcomingEvents,
      color: "#94a3b8",
    },
  ].filter((i) => i.value > 0);

  // Popular categories for mini chart
  const categoryData =
    trendsMetrics?.popularCategories?.slice(0, 5).map((c) => ({
      name: c._id || "Other",
      bookings: c.totalBookings,
      events: c.eventCount,
    })) ?? [];

  // Event status breakdown
  const statusData = eventMetrics
    ? Object.entries(eventMetrics.byStatus || {}).map(([k, v]) => ({
        name: k,
        value: v,
      }))
    : [];

  const handleRefresh = () => setRefreshCount((p) => p + 1);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">
              Error Loading Dashboard
            </h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="absolute right-4 top-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* ── Header ── */}
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

            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              {/* Timeframe selector */}
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>

              <button
                onClick={() => setShowAIDashboard((p) => !p)}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Bot className="w-5 h-5" />
                {showAIDashboard ? "Hide AI Insights" : "Show AI Insights"}
              </button>

              <button
                onClick={handleRefresh}
                disabled={aiLoading}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-5 h-5 ${aiLoading ? "animate-spin" : ""}`}
                />
                Refresh Data
              </button>
            </div>
          </div>

          {/* ── AI Insights Banner ── */}
          {aiInsights.length > 0 && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiInsights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    insight.type === "success"
                      ? "bg-green-50 border-green-200"
                      : insight.type === "warning"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      insight.type === "success"
                        ? "bg-green-100 text-green-600"
                        : insight.type === "warning"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {insight.message}
                    </p>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      {insight.action} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Primary Stats Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Total Events"
              value={fmtNum(stats.totalEvents)}
              subtitle={`${stats.upcomingEvents} upcoming events`}
              icon={Calendar}
              trend={eventMetrics?.total > 0 ? "up" : null}
              trendValue={
                eventMetrics
                  ? pct(stats.upcomingEvents, stats.totalEvents)
                  : null
              }
              color="blue"
            />
            <StatCard
              title="Total Revenue"
              value={fmtMoney(realRevenue)}
              subtitle={`${fmtNum(
                revenueMetrics?.totalBookings ?? stats.totalAttendees
              )} paid bookings`}
              icon={DollarSign}
              trend={realRevenue > 0 ? "up" : null}
              trendValue={
                revenueMetrics?.averageBookingValue
                  ? Math.round(revenueMetrics.averageBookingValue)
                  : null
              }
              color="purple"
            />
            <StatCard
              title="Total Bookings"
              value={fmtNum(realBookings)}
              subtitle={`${conversionPct}% seat conversion rate`}
              icon={Users}
              trend={
                conversionPct >= 50 ? "up" : conversionPct > 0 ? "down" : null
              }
              trendValue={conversionPct > 0 ? conversionPct : null}
              color="green"
            />
            <StatCard
              title="Avg Rating"
              value={`${avgRating}${totalReviews > 0 ? "★" : ""}`}
              subtitle={`${fmtNum(totalReviews)} total reviews`}
              icon={Star}
              trend={
                ratingMetrics?.average >= 4
                  ? "up"
                  : ratingMetrics?.average > 0
                  ? "down"
                  : null
              }
              trendValue={
                ratingMetrics?.average
                  ? Math.round(ratingMetrics.average * 20)
                  : null
              }
              color="orange"
            />
          </div>

          {/* ── Secondary Stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Avg Attendance"
              value={fmtNum(averageAttendance)}
              subtitle="Per upcoming event"
              icon={Target}
              color="blue"
            />
            <StatCard
              title="Avg Fill Rate"
              value={`${avgFillRate}%`}
              subtitle="Seats filled per event"
              icon={BarChart2}
              trend={avgFillRate >= 60 ? "up" : avgFillRate > 0 ? "down" : null}
              trendValue={avgFillRate > 0 ? avgFillRate : null}
              color="green"
            />
            <StatCard
              title="Positive Sentiment"
              value={
                sentTotal > 0
                  ? `${pct(sentimentMetrics.distribution.positive, sentTotal)}%`
                  : "—"
              }
              subtitle={`${fmtNum(
                sentimentMetrics?.totalAnalyzed ?? 0
              )} reviews analysed`}
              icon={Smile}
              trend={
                sentTotal > 0 &&
                pct(sentimentMetrics.distribution.positive, sentTotal) > 60
                  ? "up"
                  : null
              }
              trendValue={
                sentTotal > 0
                  ? pct(sentimentMetrics.distribution.positive, sentTotal)
                  : null
              }
              color="purple"
            />
            <StatCard
              title="Unique Attendees"
              value={fmtNum(trendsMetrics?.userDemographics?.uniqueUsers ?? 0)}
              subtitle={`${fmtNum(
                trendsMetrics?.userDemographics?.repeatCustomers ?? 0
              )} repeat customers`}
              icon={Award}
              color="orange"
            />
          </div>

          {/* ── AI Dashboard Section ── */}
          {showAIDashboard && userData && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI-Powered Insights
                </h2>
              </div>
              <OrganizerDashboardAI orgId={userData._id} />
            </div>
          )}

          {/* ── Charts Row 1 ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Attendance vs Capacity */}
            <ChartCard
              title="Attendance Overview"
              subtitle="Attendees vs capacity"
              icon={Users}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
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
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                        padding: "12px 16px",
                      }}
                      labelStyle={{ color: "#334155", fontWeight: 600 }}
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
                      <linearGradient
                        id="attendeesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient
                        id="capacityGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Revenue Trend (AI data if available) */}
            <ChartCard
              title="Revenue Trend"
              subtitle={
                revenueMetrics
                  ? "Monthly earnings from bookings"
                  : "Revenue per upcoming event"
              }
              icon={DollarSign}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
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
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                        padding: "12px 16px",
                      }}
                      formatter={(v) => [fmtMoney(v), "Revenue"]}
                      labelStyle={{ color: "#334155", fontWeight: 600 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="url(#revenueGradient)"
                      strokeWidth={3}
                      dot={{
                        fill: "#3b82f6",
                        strokeWidth: 2,
                        r: 6,
                        stroke: "#fff",
                      }}
                      activeDot={{
                        r: 8,
                        fill: "#1d4ed8",
                        stroke: "#fff",
                        strokeWidth: 3,
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
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

          {/* ── Charts Row 2 ── */}
          {(categoryData.length > 0 || sentimentMetrics) && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* Popular Categories */}
              {categoryData.length > 0 && (
                <ChartCard
                  title="Popular Categories"
                  subtitle="Bookings by event category"
                  icon={BarChart3}
                >
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#f1f5f9"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={55}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "12px 16px",
                          }}
                          formatter={(v) => [fmtNum(v), "Bookings"]}
                        />
                        <Bar
                          dataKey="bookings"
                          fill="url(#catGradient)"
                          radius={[0, 6, 6, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="catGradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              )}

              {/* Sentiment Analysis */}
              {sentimentMetrics && (
                <ChartCard
                  title="Attendee Sentiment"
                  subtitle="AI-analysed review sentiment"
                  icon={MessageCircle}
                >
                  <div className="space-y-4 py-4">
                    {/* Score overview */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-800">
                          {sentimentMetrics.averageScore
                            ? (sentimentMetrics.averageScore > 0 ? "+" : "") +
                              sentimentMetrics.averageScore.toFixed(2)
                            : "—"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Avg sentiment score
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-gray-800">
                          {fmtNum(sentimentMetrics.totalAnalyzed)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Reviews analysed
                        </p>
                      </div>
                    </div>

                    {/* Sentiment bars */}
                    <div className="space-y-3">
                      <SentimentBar
                        label="Positive"
                        value={sentimentMetrics.distribution.positive}
                        total={sentTotal}
                        color="text-green-500"
                        icon={ThumbsUp}
                      />
                      <SentimentBar
                        label="Neutral"
                        value={sentimentMetrics.distribution.neutral}
                        total={sentTotal}
                        color="text-yellow-500"
                        icon={Meh}
                      />
                      <SentimentBar
                        label="Negative"
                        value={sentimentMetrics.distribution.negative}
                        total={sentTotal}
                        color="text-rose-500"
                        icon={ThumbsDown}
                      />
                    </div>

                    {/* Common issues */}
                    {sentimentMetrics.commonIssues?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Top Issues
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sentimentMetrics.commonIssues
                            .slice(0, 5)
                            .map((issue, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-rose-50 text-rose-600 text-xs rounded-full border border-rose-100"
                              >
                                {issue._id} ({issue.count})
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ChartCard>
              )}
            </div>
          )}

          {/* ── Rating Distribution ── */}
          {ratingMetrics && ratingMetrics.total > 0 && (
            <div className="mb-8">
              <ChartCard
                title="Rating Distribution"
                subtitle="Breakdown of star ratings"
                icon={Star}
              >
                <div className="grid grid-cols-5 gap-2 py-4">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count =
                      ratingMetrics.distribution?.[`${star}_star`] || 0;
                    const w = pct(count, ratingMetrics.total);
                    return (
                      <div
                        key={star}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-full bg-gray-100 rounded-full relative"
                          style={{ height: 80 }}
                        >
                          <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                            style={{ height: `${Math.max(w, 4)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {star}★
                        </span>
                        <span className="text-xs text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-2 text-sm text-gray-600">
                  <span>
                    Average:{" "}
                    <strong>{ratingMetrics.average?.toFixed(1)}★</strong>
                  </span>
                  <span>
                    Highest: <strong>{ratingMetrics.max}★</strong>
                  </span>
                  <span>
                    Total: <strong>{fmtNum(ratingMetrics.total)}</strong>
                  </span>
                </div>
              </ChartCard>
            </div>
          )}

          {/* ── Bottom Row ── */}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Event Distribution Pie */}
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" /> Event Distribution
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
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 shadow-md col-span-3">
              <h3 className="text-sm font-medium text-indigo-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => (window.location.href = "/orgdb/create-event")}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center group"
                >
                  <PlusCircle className="w-5 h-5 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">
                    Create Event
                  </span>
                </button>
                <button
                  onClick={() => (window.location.href = "/orgdb/my-events")}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center group"
                >
                  <Eye className="w-5 h-5 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">
                    View Events
                  </span>
                </button>
                <button
                  onClick={() =>
                    (window.location.href = "/orgdb/event-requests")
                  }
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center group"
                >
                  <Target className="w-5 h-5 text-green-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">
                    Requests
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Summary Stats ── */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600">Next Event Date</p>
                  <p className="text-xl font-bold text-gray-800">
                    {nextEventDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600">Seat Conversion Rate</p>
                  <p className="text-xl font-bold text-gray-800">
                    {bookingMetrics ? `${conversionPct}%` : `${avgFillRate}%`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-600">Avg Booking Value</p>
                  <p className="text-xl font-bold text-gray-800">
                    {revenueMetrics?.averageBookingValue
                      ? fmtMoney(Math.round(revenueMetrics.averageBookingValue))
                      : "—"}
                  </p>
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