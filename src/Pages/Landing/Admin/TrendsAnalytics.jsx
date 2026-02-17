// src/components/admin/TrendsAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Globe,
  Clock,
  Award,
  Star,
  Heart,
  Zap,
  Brain,
  Sparkles,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Filter,
  Download,
  Share2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Sunrise,
  Sunset,
  Music,
  Film,
  Utensils,
  Wine,
  Coffee,
  Gamepad2,
  Briefcase,
  GraduationCap,
  Users as UsersIcon,
  Users2,
  UserPlus,
  UserCheck,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Map,
  Navigation,
  Compass,
  Flag,
  Award as AwardIcon,
  Trophy,
  Medal,
  Crown,
  Gem,
  Sparkle,
  Zap as ZapIcon,
  Ticket,
  Bot,
  Gauge,
  Network,
  Cpu,
  HardDrive,
  Database,
  Cloud as CloudIcon,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Lightbulb,
  Rocket,
  Satellite,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAdminAI } from '../../../hooks/useAdminAI';
import AIBadge from '../../../components/ai/AIBadge';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';

const TrendsAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [trendsData, setTrendsData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [location, setLocation] = useState('global');
  const [predictions, setPredictions] = useState([]);
  const [showAIPredictions, setShowAIPredictions] = useState(true);
  const [analysisType, setAnalysisType] = useState('trends'); // trends, cohorts, revenue
  const [forecastPeriod, setForecastPeriod] = useState('90d');
  const [insights, setInsights] = useState([]);

  const { 
    platformAnalytics, 
    trendData, 
    cohortData,
    loading: aiLoading,
    fetchPlatformAnalytics,
    fetchTrendData,
    fetchCohortAnalysis
  } = useAdminAI();

  useEffect(() => {
    fetchTrendsData();
    fetchPlatformAnalytics(dateRange);
    fetchTrendData(selectedCategory, dateRange);
    fetchCohortAnalysis('user', '6months');
  }, [selectedCategory, dateRange, location, analysisType]);

  const fetchTrendsData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrendsData(mockTrendsData);
      setPredictions(mockPredictions);
      generateInsights();
    } catch (error) {
      console.error('Error fetching trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = () => {
    const newInsights = [
      {
        type: 'opportunity',
        title: 'Virtual Events Growth',
        description: 'Virtual event attendance projected to grow 45% in next quarter',
        impact: 'high',
        action: 'Invest in VR/AR experiences'
      },
      {
        type: 'trend',
        title: 'Gen Z Preference Shift',
        description: 'Younger demographics showing 35% higher interest in sustainable events',
        impact: 'medium',
        action: 'Implement green initiatives'
      },
      {
        type: 'warning',
        title: 'Market Saturation',
        description: 'Music festival market approaching saturation in major cities',
        impact: 'high',
        action: 'Consider secondary markets'
      }
    ];
    setInsights(newInsights);
  };

  const categories = [
    { id: 'all', label: 'All Categories', icon: PieChart },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'food', label: 'Food & Drink', icon: Utensils },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'tech', label: 'Technology', icon: Zap },
    { id: 'arts', label: 'Arts & Culture', icon: Film },
    { id: 'education', label: 'Education', icon: GraduationCap }
  ];

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
          <Brain className="w-8 h-8 text-purple-500 absolute top-4 left-1/2 transform -translate-x-1/2 animate-pulse" />
        </div>
        <p className="text-lg font-medium text-gray-700">AI analyzing market trends...</p>
        <p className="text-sm text-gray-500 mt-2">Processing millions of data points</p>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Main Container */}
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section with AI Badge */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Trend Forecasting</h1>
                  <AIBadge type="admin" agent="analytics" />
                </div>
                <p className="text-sm text-gray-600">AI-powered predictive analytics for event industry</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="trends">📊 Trend Analysis</option>
                <option value="cohorts">👥 Cohort Analysis</option>
                <option value="revenue">💰 Revenue Forecast</option>
              </select>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white min-w-[120px]"
              >
                <option value="global">🌍 Global</option>
                <option value="na">🇺🇸 N. America</option>
                <option value="eu">🇪🇺 Europe</option>
                <option value="asia">🌏 Asia</option>
                <option value="sa">🌎 S. America</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white min-w-[100px]"
              >
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="1y">1 year</option>
              </select>
              <button
                onClick={() => setShowAIPredictions(!showAIPredictions)}
                className={`p-2 rounded-lg border transition-all duration-300 ${
                  showAIPredictions 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <Brain className="w-4 h-4" />
              </button>
              <button
                onClick={fetchTrendsData}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-sm"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Banner */}
        {showAIPredictions && (
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-2">AI-Generated Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {insights.map((insight, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {insight.type === 'opportunity' && <Rocket className="w-4 h-4 text-green-300" />}
                        {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-blue-300" />}
                        {insight.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-300" />}
                        <span className="text-sm font-medium">{insight.title}</span>
                      </div>
                      <p className="text-xs text-white/80 mb-2">{insight.description}</p>
                      <button className="text-xs bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30 transition-colors">
                        {insight.action} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Type Content */}
        {analysisType === 'trends' && (
          <>
            {/* Category Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 text-sm ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <category.icon className="w-3.5 h-3.5 mr-1.5" />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <MetricCard
                title="Market Size"
                value="$12.4B"
                change="+15.3%"
                trend="up"
                icon={DollarSign}
                color="green"
                prediction="+18.2%"
              />
              <MetricCard
                title="Active Events"
                value="45.2K"
                change="+8.7%"
                trend="up"
                icon={Calendar}
                color="blue"
                prediction="+12.5%"
              />
              <MetricCard
                title="Total Attendees"
                value="2.3M"
                change="+12.1%"
                trend="up"
                icon={Users}
                color="purple"
                prediction="+15.8%"
              />
              <MetricCard
                title="Avg Ticket Price"
                value="$89"
                change="+5.2%"
                trend="up"
                icon={Ticket}
                color="amber"
                prediction="+7.5%"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Popular Categories with AI Predictions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  Popular Categories
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">
                    AI Forecast
                  </span>
                </h3>
                <div className="space-y-3">
                  {trendsData?.popularCategories.map((cat, index) => (
                    <CategoryTrend key={index} category={cat} showPrediction={true} />
                  ))}
                </div>
              </div>

              {/* Geographic Distribution with Heat Map */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4 text-purple-500" />
                  Geographic Distribution
                </h3>
                <div className="space-y-4">
                  {trendsData?.geographicData.map((region, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{region.region}</span>
                        <span className="font-medium text-gray-900">{region.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${region.percentage}%` }}
                        />
                      </div>
                      {region.predicted && (
                        <p className="text-xs text-green-600">Predicted growth: +{region.predicted}%</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-amber-500" />
                Event Format Trends with AI Prediction
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendsData?.timelineWithPrediction || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="virtual" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="inPerson" fill="#82ca9d" stroke="#82ca9d" fillOpacity={0.3} />
                    <Line type="monotone" dataKey="predictedVirtual" stroke="#ff7300" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="predictedInPerson" stroke="#ff7300" strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {analysisType === 'cohorts' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-indigo-500" />
              Cohort Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Cohort</th>
                    <th className="text-center py-3 px-4">Size</th>
                    <th className="text-center py-3 px-4">Month 1</th>
                    <th className="text-center py-3 px-4">Month 2</th>
                    <th className="text-center py-3 px-4">Month 3</th>
                    <th className="text-center py-3 px-4">Month 4</th>
                    <th className="text-center py-3 px-4">Month 5</th>
                    <th className="text-center py-3 px-4">Month 6</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCohortData.map((cohort, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{cohort.cohort}</td>
                      <td className="py-3 px-4 text-center">{cohort.size}</td>
                      {cohort.retention.map((rate, i) => (
                        <td key={i} className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <div 
                              className="w-10 h-10 rounded flex items-center justify-center text-white text-xs"
                              style={{ 
                                backgroundColor: `rgba(79, 70, 229, ${rate / 100})`,
                                opacity: rate / 100
                              }}
                            >
                              {rate}%
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {analysisType === 'revenue' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Revenue Forecast
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                    name="Actual Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stackId="2" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                    name="Predicted Revenue"
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI Predictions Section */}
        {showAIPredictions && (
          <>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-base">
              <Brain className="w-4 h-4 text-purple-500" />
              AI Predictive Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((prediction, index) => (
                <PredictionCard key={index} prediction={prediction} />
              ))}
            </div>
          </>
        )}

        {/* Emerging Trends with AI Scores */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Emerging Trends (AI Confidence Scores)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {trendsData?.emergingTrends.map((trend, index) => (
              <EmergingTrend key={index} trend={trend} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Category Trend Component with Predictions
const CategoryTrend = ({ category, showPrediction = false }) => {
  const getColorClass = (color) => {
    switch(color) {
      case 'bg-purple-600': return 'from-purple-500 to-purple-600';
      case 'bg-blue-600': return 'from-blue-500 to-blue-600';
      case 'bg-green-600': return 'from-green-500 to-green-600';
      case 'bg-red-600': return 'from-red-500 to-red-600';
      case 'bg-yellow-600': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-all duration-300">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={`w-2 h-2 rounded-full ${category.color} flex-shrink-0`} />
        <span className="text-sm text-gray-700 truncate">{category.name}</span>
      </div>
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm text-gray-600 w-10 text-right">{category.percentage}%</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
          <div
            className={`h-full bg-gradient-to-r ${getColorClass(category.color)} rounded-full transition-all duration-500`}
            style={{ width: `${category.percentage}%` }}
          />
        </div>
        <span className={`text-xs flex items-center gap-0.5 min-w-[45px] ${
          category.growth > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {category.growth > 0 ? (
            <TrendingUp className="w-3 h-3 flex-shrink-0" />
          ) : (
            <TrendingDown className="w-3 h-3 flex-shrink-0" />
          )}
          <span>{Math.abs(category.growth)}%</span>
        </span>
      </div>
      {showPrediction && category.predictedGrowth && (
        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full ml-2">
          Predicted: +{category.predictedGrowth}%
        </span>
      )}
    </div>
  );
};

// Enhanced Prediction Card with Confidence Indicator
const PredictionCard = ({ prediction }) => {
  const confidenceColors = {
    high: 'from-green-500 to-emerald-500',
    medium: 'from-yellow-500 to-amber-500',
    low: 'from-red-500 to-rose-500'
  };

  const confidenceLevel = prediction.confidence > 80 ? 'high' : prediction.confidence > 60 ? 'medium' : 'low';

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${confidenceColors[confidenceLevel]}`}>
          {prediction.confidence}% confidence
        </span>
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-purple-600" />
        </div>
      </div>
      
      <h4 className="font-semibold text-gray-900 text-base mb-1">{prediction.title}</h4>
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{prediction.description}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Target className="w-3 h-3" />
          {prediction.impact}
        </span>
        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          {prediction.timeline}
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">AI Confidence</span>
          <span className="font-medium text-gray-700">{prediction.confidence}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${confidenceColors[confidenceLevel]} rounded-full`}
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Enhanced Emerging Trend Component
const EmergingTrend = ({ trend }) => {
  const momentumColors = {
    high: 'from-green-500 to-emerald-500',
    medium: 'from-yellow-500 to-amber-500',
    low: 'from-blue-500 to-cyan-500'
  };

  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-gray-800 text-sm truncate">{trend.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">Growth: <span className="text-green-600 font-medium">+{trend.growth}%</span></p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-lg text-white bg-gradient-to-r ${momentumColors[trend.momentum]} ml-2 flex-shrink-0`}>
          {trend.momentum}
        </span>
      </div>
      
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Reach</span>
          <span className="font-medium text-gray-700">{trend.reach}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${trend.reachPercent}%` }}
          />
        </div>
      </div>

      {/* AI Score */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI Score
          </span>
          <span className="font-medium text-purple-600">{trend.aiScore || 85}/100</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Metric Card Component with Predictions
const MetricCard = ({ title, value, change, trend, icon: Icon, color, prediction }) => {
  const colors = {
    green: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      icon: 'from-green-500 to-emerald-500',
    },
    blue: {
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-100',
      icon: 'from-blue-500 to-cyan-500',
    },
    purple: {
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-100',
      icon: 'from-purple-500 to-pink-500',
    },
    amber: {
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-100',
      icon: 'from-amber-500 to-orange-500',
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors[color].bg} border ${colors[color].border} p-3 lg:p-4 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-8 -mt-8"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">{title}</p>
            <p className="text-lg lg:text-xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${colors[color].icon} flex items-center justify-center shadow-md`}>
            <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
        </div>
        <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'} bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full w-fit shadow-sm`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {change}
        </div>
        {prediction && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center text-xs">
              <Brain className="w-3 h-3 text-purple-500 mr-1" />
              <span className="text-gray-600">Predicted:</span>
              <span className="ml-1 font-medium text-purple-600">{prediction}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock Data with Predictions
const mockTrendsData = {
  popularCategories: [
    { name: 'Music Festivals', percentage: 85, growth: 23, color: 'bg-purple-600', predictedGrowth: 28 },
    { name: 'Tech Conferences', percentage: 72, growth: 45, color: 'bg-blue-600', predictedGrowth: 52 },
    { name: 'Food Events', percentage: 68, growth: 12, color: 'bg-green-600', predictedGrowth: 15 },
    { name: 'Sports', percentage: 54, growth: -5, color: 'bg-red-600', predictedGrowth: -2 },
    { name: 'Arts & Culture', percentage: 41, growth: 8, color: 'bg-yellow-600', predictedGrowth: 12 }
  ],
  geographicData: [
    { region: 'North America', percentage: 45, predicted: 8 },
    { region: 'Europe', percentage: 28, predicted: 12 },
    { region: 'Asia Pacific', percentage: 18, predicted: 25 },
    { region: 'Latin America', percentage: 6, predicted: 15 },
    { region: 'Middle East & Africa', percentage: 3, predicted: 20 }
  ],
  timelineData: [
    { month: 'Jan', virtual: 65, inPerson: 35 },
    { month: 'Feb', virtual: 68, inPerson: 32 },
    { month: 'Mar', virtual: 72, inPerson: 28 },
    { month: 'Apr', virtual: 75, inPerson: 25 },
    { month: 'May', virtual: 78, inPerson: 22 },
    { month: 'Jun', virtual: 82, inPerson: 18 }
  ],
  timelineWithPrediction: [
    { month: 'Jan', virtual: 65, inPerson: 35 },
    { month: 'Feb', virtual: 68, inPerson: 32 },
    { month: 'Mar', virtual: 72, inPerson: 28 },
    { month: 'Apr', virtual: 75, inPerson: 25 },
    { month: 'May', virtual: 78, inPerson: 22 },
    { month: 'Jun', virtual: 82, inPerson: 18 },
    { month: 'Jul', predictedVirtual: 85, predictedInPerson: 15 },
    { month: 'Aug', predictedVirtual: 88, predictedInPerson: 12 },
    { month: 'Sep', predictedVirtual: 86, predictedInPerson: 14 }
  ],
  emergingTrends: [
    { name: 'Virtual Reality Events', growth: 156, momentum: 'high', reach: '450K', reachPercent: 85, aiScore: 92 },
    { name: 'Hybrid Conferences', growth: 89, momentum: 'high', reach: '320K', reachPercent: 72, aiScore: 88 },
    { name: 'Sustainable Events', growth: 67, momentum: 'medium', reach: '280K', reachPercent: 58, aiScore: 76 },
    { name: 'Micro-Festivals', growth: 45, momentum: 'medium', reach: '190K', reachPercent: 43, aiScore: 71 }
  ]
};

const mockPredictions = [
  {
    title: 'Virtual Events Surge',
    description: 'Virtual and hybrid events expected to dominate Q3 2024 with 45% growth in attendance',
    confidence: 92,
    impact: '+45% attendance',
    timeline: 'Q3 2024'
  },
  {
    title: 'Price Sensitivity',
    description: 'Ticket prices expected to stabilize with 5-8% increase, demand remains elastic',
    confidence: 78,
    impact: 'Moderate revenue growth',
    timeline: 'Next 6 months'
  },
  {
    title: 'New Demographics',
    description: 'Gen Z attendance projected to increase by 35%, focus on sustainable experiences',
    confidence: 85,
    impact: 'New market segment',
    timeline: '2024-2025'
  }
];

const mockCohortData = [
  { cohort: 'Jan 2024', size: 1250, retention: [100, 68, 54, 42, 38, 32] },
  { cohort: 'Feb 2024', size: 1420, retention: [100, 72, 58, 45, 40, 35] },
  { cohort: 'Mar 2024', size: 1380, retention: [100, 70, 55, 44, 39, 33] },
  { cohort: 'Apr 2024', size: 1510, retention: [100, 75, 62, 48, 42, 36] },
  { cohort: 'May 2024', size: 1650, retention: [100, 78, 65, 52, 45, 38] },
  { cohort: 'Jun 2024', size: 1720, retention: [100, 80, 68, 55, 48, 42] }
];

const mockRevenueForecast = [
  { month: 'Jan', actual: 125000, predicted: 125000 },
  { month: 'Feb', actual: 142000, predicted: 140000 },
  { month: 'Mar', actual: 168000, predicted: 165000 },
  { month: 'Apr', actual: 189000, predicted: 185000 },
  { month: 'May', actual: 215000, predicted: 210000 },
  { month: 'Jun', actual: 248000, predicted: 240000 },
  { month: 'Jul', actual: null, predicted: 275000 },
  { month: 'Aug', actual: null, predicted: 310000 },
  { month: 'Sep', actual: null, predicted: 295000 }
];

export default TrendsAnalytics;