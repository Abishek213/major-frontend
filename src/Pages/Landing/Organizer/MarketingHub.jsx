// src/components/organizer/MarketingHub.jsx
import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Users,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Mail,
  Send,
  Share2,
  Globe,
  Clock,
  Calendar,
  Award,
  Zap,
  Brain,
  Sparkles,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  MousePointer,
  MessageSquare,
  ThumbsUp,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Users2,
  UserCheck,
  UserPlus,
  UserMinus,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail as MailIcon,
  Link,
  Code,
  Image,
  Video,
  FileText,
  Layout,
  Palette,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Minus,
  Plus as PlusIcon,
  Search,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Sunrise,
  Sunset
} from 'lucide-react';

const MarketingHub = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [dateRange, setDateRange] = useState('30d');

  // Mock data - Replace with API calls
  useEffect(() => {
    fetchMarketingData();
    fetchAISuggestions();
  }, []);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCampaigns(mockCampaigns);
      setAudiences(mockAudiences);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    // Simulate AI suggestions
    setAiSuggestions(mockAISuggestions);
  };

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'audiences', label: 'Audiences', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'content', label: 'Content Studio', icon: FileText },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'email', label: 'Email Marketing', icon: Mail }
  ];

  const LoadingSpinner = () => (
    <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Loading marketing data...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Main Marketing Hub Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                Marketing Hub
              </h1>
              <p className="text-gray-600">
                Intelligent promotion and audience targeting
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Campaign
              </button>
              <button
                onClick={fetchMarketingData}
                className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8 overflow-x-auto pb-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${
                    activeTab === tab.id ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'campaigns' && (
              <CampaignsTab
                campaigns={campaigns}
                aiSuggestions={aiSuggestions}
                onSelect={setSelectedCampaign}
                onRefresh={fetchMarketingData}
              />
            )}
            {activeTab === 'audiences' && (
              <AudiencesTab
                audiences={audiences}
                aiSuggestions={aiSuggestions}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab
                analytics={analytics}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
            {activeTab === 'content' && (
              <ContentStudioTab />
            )}
            {activeTab === 'social' && (
              <SocialMediaTab />
            )}
            {activeTab === 'email' && (
              <EmailMarketingTab />
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="mt-10 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold">AI-Powered Marketing</h3>
                </div>
                <p className="text-white/90 text-lg">Get intelligent suggestions for your next campaign based on audience insights and past performance.</p>
              </div>
              <button className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-medium flex items-center gap-2 hover:bg-white/30 transition-all duration-300 shadow-lg">
                Explore AI Features
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSave={(campaign) => {
            console.log('Save campaign:', campaign);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Campaigns Tab Component
const CampaignsTab = ({ campaigns, aiSuggestions, onSelect, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-6 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -mr-20 -mt-20"></div>
        <div className="relative">
          <h3 className="font-semibold text-purple-900 flex items-center text-lg mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Suggestions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <p className="text-sm text-gray-700">{suggestion.message}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Impact: {suggestion.impact}
                  </span>
                  <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-semibold text-gray-800 text-lg">Active Campaigns</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full sm:w-64"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="all">All Campaigns</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {campaigns.map(campaign => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Campaign Row Component
const CampaignRow = ({ campaign, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'paused': return 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white';
      case 'completed': return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  return (
    <div 
      className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white cursor-pointer transition-all duration-300 group"
      onClick={() => onSelect(campaign)}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900 text-lg">{campaign.name}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(campaign.status)}`}>
              {campaign.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
              <Target className="w-3 h-3 mr-1.5 text-purple-500" />
              {campaign.reach.toLocaleString()} reached
            </span>
            <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
              <MousePointer className="w-3 h-3 mr-1.5 text-blue-500" />
              {campaign.clicks.toLocaleString()} clicks
            </span>
            <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
              <DollarSign className="w-3 h-3 mr-1.5 text-green-500" />
              {campaign.conversions} conversions
            </span>
            <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1.5 text-amber-500" />
              ROI {campaign.roi}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:border-l lg:border-gray-200 lg:pl-6">
          <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group">
            <Edit className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-colors" />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
            {campaign.status === 'active' ? (
              <Pause className="w-4 h-4 text-gray-500 hover:text-amber-600 transition-colors" />
            ) : (
              <Play className="w-4 h-4 text-gray-500 hover:text-green-600 transition-colors" />
            )}
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Copy className="w-4 h-4 text-gray-500 hover:text-purple-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Audiences Tab Component
const AudiencesTab = ({ audiences, aiSuggestions }) => {
  return (
    <div className="space-y-6">
      {/* AI Audience Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-6 shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -mr-10 -mt-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Audience</p>
              <p className="text-3xl font-bold text-blue-900">45.2K</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-full w-fit">
            <TrendingUp className="w-3 h-3 mr-1" />
            ↑ 12% from last month
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-6 shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -mr-10 -mt-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Engagement Rate</p>
              <p className="text-3xl font-bold text-green-900">68%</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 bg-green-100/50 px-3 py-1.5 rounded-full w-fit">
            <TrendingUp className="w-3 h-3 mr-1" />
            ↑ 5% from last month
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-6 shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -mr-10 -mt-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Match Score</p>
              <p className="text-3xl font-bold text-purple-900">92%</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-purple-600 bg-purple-100/50 px-3 py-1.5 rounded-full w-fit">
            <Sparkles className="w-3 h-3 mr-1" />
            High relevance audience
          </div>
        </div>
      </div>

      {/* Audience Segments */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-lg">Audience Segments</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audiences.map((audience, index) => (
              <AudienceSegment key={index} audience={audience} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics, dateRange, onDateRangeChange }) => {
  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white shadow-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Impressions"
          value="1.2M"
          change="+15%"
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Clicks"
          value="45.2K"
          change="+8%"
          icon={MousePointer}
          color="green"
        />
        <MetricCard
          title="Conversions"
          value="3.4K"
          change="+12%"
          icon={Target}
          color="purple"
        />
        <MetricCard
          title="Revenue"
          value="$89.2K"
          change="+23%"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Campaign Performance
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-lg border border-gray-100 border-dashed">
            <div className="text-center">
              <BarChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">[Performance Chart Placeholder]</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-pink-500" />
            Audience Engagement
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-lg border border-gray-100 border-dashed">
            <div className="text-center">
              <PieChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">[Engagement Chart Placeholder]</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-20 -mb-20"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold">AI Predictions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <p className="text-sm opacity-90 mb-1">Next 30 days</p>
              <p className="text-3xl font-bold mb-1">+24%</p>
              <p className="text-sm opacity-90">Expected growth</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <p className="text-sm opacity-90 mb-1">Best time to post</p>
              <p className="text-3xl font-bold mb-1">6:00 PM</p>
              <p className="text-sm opacity-90">Weekdays</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
              <p className="text-sm opacity-90 mb-1">Top performing</p>
              <p className="text-3xl font-bold mb-1">Video Ads</p>
              <p className="text-sm opacity-90">65% engagement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock Data
const mockCampaigns = [
  {
    id: 1,
    name: 'Summer Music Festival',
    description: 'Promoting our annual summer music festival',
    status: 'active',
    reach: 45000,
    clicks: 3200,
    conversions: 450,
    roi: 185
  },
  {
    id: 2,
    name: 'Early Bird Special',
    description: 'Early bird discount campaign',
    status: 'paused',
    reach: 28000,
    clicks: 2100,
    conversions: 320,
    roi: 145
  },
  {
    id: 3,
    name: 'VIP Experience',
    description: 'Premium package promotion',
    status: 'active',
    reach: 15000,
    clicks: 980,
    conversions: 120,
    roi: 210
  }
];

const mockAudiences = [
  {
    name: 'Music Enthusiasts',
    size: 15200,
    engagement: 78,
    matchScore: 95,
    interests: ['Rock', 'Pop', 'Electronic']
  },
  {
    name: 'Early Adopters',
    size: 8900,
    engagement: 82,
    matchScore: 88,
    interests: ['New events', 'Exclusive access']
  },
  {
    name: 'Premium Buyers',
    size: 5600,
    engagement: 91,
    matchScore: 92,
    interests: ['VIP', 'Luxury experiences']
  }
];

const mockAnalytics = {
  impressions: 1200000,
  clicks: 45200,
  conversions: 3400,
  revenue: 89200,
  ctr: 3.77,
  conversionRate: 7.52
};

const mockAISuggestions = [
  {
    message: 'Target users who attended similar events last year',
    impact: '+35% engagement'
  },
  {
    message: 'Optimize ad schedule for weekend mornings',
    impact: '+22% conversions'
  },
  {
    message: 'Use video content for better reach',
    impact: '+45% views'
  }
];

// Helper Components
const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  const colors = {
    blue: {
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-100',
      icon: 'from-blue-500 to-cyan-500',
      text: 'text-blue-600'
    },
    green: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-100',
      icon: 'from-green-500 to-emerald-500',
      text: 'text-green-600'
    },
    purple: {
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-100',
      icon: 'from-purple-500 to-pink-500',
      text: 'text-purple-600'
    },
    amber: {
      bg: 'from-amber-50 to-yellow-50',
      border: 'border-amber-100',
      icon: 'from-amber-500 to-yellow-500',
      text: 'text-amber-600'
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors[color].bg} border ${colors[color].border} p-6 shadow-md hover:shadow-lg transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-10 -mt-10"></div>
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color].icon} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className={`flex items-center text-xs ${colors[color].text} bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit shadow-sm`}>
        <TrendingUp className="w-3 h-3 mr-1" />
        {change} from last period
      </div>
    </div>
  );
};

const AudienceSegment = ({ audience }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-semibold text-gray-900 text-lg mb-1">{audience.name}</h4>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-400" />
          {audience.size.toLocaleString()} users
        </p>
      </div>
      <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-medium shadow-sm">
        Match {audience.matchScore}%
      </span>
    </div>
    
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Engagement Rate</span>
        <span className="font-medium">{audience.engagement}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${audience.engagement}%` }}
        />
      </div>
    </div>
    
    <div className="flex flex-wrap gap-2">
      {audience.interests.map((interest, i) => (
        <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg text-xs border border-gray-200 shadow-sm">
          {interest}
        </span>
      ))}
    </div>
  </div>
);

const ContentStudioTab = () => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-lg p-12 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
      <FileText className="w-10 h-10 text-purple-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Studio</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">Create and manage your marketing content with our AI-powered tools</p>
    <button className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105">
      <Plus className="w-5 h-5" />
      Create Content
    </button>
  </div>
);

const SocialMediaTab = () => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-lg p-12 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mx-auto mb-4">
      <Share2 className="w-10 h-10 text-blue-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Social Media Management</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">Schedule and analyze social media posts across all major platforms</p>
    <button className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all duration-300 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105">
      <Plus className="w-5 h-5" />
      Connect Accounts
    </button>
  </div>
);

const EmailMarketingTab = () => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-lg p-12 text-center">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
      <Mail className="w-10 h-10 text-green-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Marketing</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">Create and send beautiful email campaigns with our drag-and-drop builder</p>
    <button className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105">
      <Plus className="w-5 h-5" />
      Create Campaign
    </button>
  </div>
);

const CreateCampaignModal = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: '',
    audience: '',
    budget: '',
    schedule: '',
    content: ''
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-xl font-semibold text-gray-800">Create New Campaign</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 px-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`relative`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    i <= step 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i}
                  </div>
                  {i < 4 && (
                    <div className={`absolute top-1/2 left-full w-full h-1 -translate-y-1/2 ${
                      i < step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'
                    }`} style={{ width: 'calc(100% - 2.5rem)' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 text-lg">Campaign Details</h3>
                <input
                  type="text"
                  placeholder="Campaign Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                />
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  value={campaignData.objective}
                  onChange={(e) => setCampaignData({...campaignData, objective: e.target.value})}
                >
                  <option value="">Select Objective</option>
                  <option value="awareness">Brand Awareness</option>
                  <option value="traffic">Traffic</option>
                  <option value="conversions">Conversions</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 text-lg">Target Audience</h3>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  value={campaignData.audience}
                  onChange={(e) => setCampaignData({...campaignData, audience: e.target.value})}
                >
                  <option value="">Select Audience</option>
                  <option value="music">Music Enthusiasts</option>
                  <option value="early">Early Adopters</option>
                  <option value="premium">Premium Buyers</option>
                </select>
                <input
                  type="number"
                  placeholder="Budget ($)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  value={campaignData.budget}
                  onChange={(e) => setCampaignData({...campaignData, budget: e.target.value})}
                />
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 text-lg">Schedule</h3>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  value={campaignData.schedule}
                  onChange={(e) => setCampaignData({...campaignData, schedule: e.target.value})}
                />
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 text-lg">Content</h3>
                <textarea
                  placeholder="Campaign Description"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  value={campaignData.content}
                  onChange={(e) => setCampaignData({...campaignData, content: e.target.value})}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between bg-gray-50">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-3 border border-gray-300 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => step === 4 ? onSave(campaignData) : setStep(step + 1)}
            className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl"
          >
            {step === 4 ? 'Create Campaign' : 'Next'}
            {step < 4 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketingHub;