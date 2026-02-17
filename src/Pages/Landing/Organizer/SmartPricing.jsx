// src/components/organizer/SmartPricing.jsx
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Clock,
  Target,
  Brain,
  Sparkles,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Settings,
  Save,
  Play,
  Pause,
  Plus,
  Minus,
  Percent,
  Calculator,
  Download,
  Share2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Edit,
  Trash2
} from 'lucide-react';

const SmartPricing = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchPricingData();
  }, [activeEvent]);

  const fetchPricingData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPricingData(mockPricingData);
      setAiRecommendations(mockAiRecommendations);
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'dynamic', label: 'Dynamic Pricing', icon: Activity },
    { id: 'tiers', label: 'Ticket Tiers', icon: Target },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'competitors', label: 'Competitors', icon: Eye }
  ];

  const LoadingSpinner = () => (
    <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Loading pricing data...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Main Smart Pricing Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                Smart Pricing
              </h1>
              <p className="text-gray-600">
                Dynamic pricing optimization powered by AI
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="flex items-center p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setAutoOptimize(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${!autoOptimize
                      ? 'bg-white shadow-md text-gray-800'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setAutoOptimize(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${autoOptimize
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Auto-Optimize
                </button>
              </div>
              <button className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg">
                <Save className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Event Selector */}
          <div className="mb-8">
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-md text-gray-700"
                value={activeEvent?.id || ''}
                onChange={(e) => setActiveEvent(mockEvents.find(e => e.id === parseInt(e.target.value)))}
              >
                <option value="">Select an event to optimize pricing</option>
                {mockEvents.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {activeEvent && pricingData && (
            <>
              {/* AI Insights Banner */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white shadow-xl mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-20 -mb-20"></div>
                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI Pricing Insights</h3>
                      <p className="text-white/90 text-sm max-w-2xl">
                        Based on demand forecast, we recommend increasing prices by 15% for weekend shows.
                        Early bird tickets are selling 40% faster than expected.
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-white text-orange-600 rounded-xl text-sm font-medium hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap">
                    Apply Recommendations
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex space-x-8 overflow-x-auto pb-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap ${selectedTab === tab.id
                          ? 'border-amber-600 text-amber-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <tab.icon className={`w-4 h-4 mr-2 ${selectedTab === tab.id ? 'text-amber-600' : 'text-gray-400'
                        }`} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {selectedTab === 'overview' && (
                  <OverviewTab
                    pricingData={pricingData}
                    aiRecommendations={aiRecommendations}
                  />
                )}
                {selectedTab === 'dynamic' && (
                  <DynamicPricingTab
                    pricingData={pricingData}
                    autoOptimize={autoOptimize}
                  />
                )}
                {selectedTab === 'tiers' && (
                  <TiersTab
                    pricingData={pricingData}
                  />
                )}
                {selectedTab === 'forecast' && (
                  <ForecastTab
                    pricingData={pricingData}
                  />
                )}
                {selectedTab === 'competitors' && (
                  <CompetitorsTab
                    pricingData={pricingData}
                  />
                )}
              </div>
            </>
          )}

          {!activeEvent && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Select an Event</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Choose an event from the dropdown above to start optimizing your pricing strategy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ pricingData, aiRecommendations }) => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Price"
          value={`$${pricingData.currentPrice}`}
          change={`${pricingData.priceChange > 0 ? '+' : ''}${pricingData.priceChange}%`}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Optimal Price"
          value={`$${pricingData.optimalPrice}`}
          change={`${pricingData.optimalVsCurrent > 0 ? '+' : ''}${pricingData.optimalVsCurrent}%`}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Demand Score"
          value={`${pricingData.demandScore}%`}
          change={`${pricingData.demandChange}%`}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Revenue Potential"
          value={`$${pricingData.revenuePotential.toLocaleString()}`}
          change={`${pricingData.revenueChange}%`}
          icon={Calculator}
          color="amber"
        />
      </div>

      {/* AI Recommendations */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-6 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -mr-20 -mt-20"></div>
        <div className="relative">
          <h3 className="font-semibold text-purple-900 flex items-center text-lg mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                {rec.type === 'positive' ? (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{rec.message}</p>
                  <p className="text-sm text-purple-600 mt-1">Impact: {rec.impact}</p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg">
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-amber-500" />
          Price History & Forecast
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-lg border border-gray-100 border-dashed">
          <div className="text-center">
            <LineChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">[Price Chart Placeholder]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dynamic Pricing Tab
const DynamicPricingTab = ({ pricingData, autoOptimize }) => {
  const [rules, setRules] = useState([
    { id: 1, condition: 'Demand > 80%', action: '+15%', active: true },
    { id: 2, condition: 'Time < 48 hours', action: '+25%', active: true },
    { id: 3, condition: 'Weather = Rain', action: '-10%', active: false },
    { id: 4, condition: 'Competitor price lower', action: '-5%', active: true }
  ]);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`relative overflow-hidden rounded-xl p-6 ${autoOptimize
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100'
          : 'bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200'
        } shadow-md`}>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {autoOptimize ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900 text-lg">Auto-Optimization Active</p>
                  <p className="text-sm text-green-700">Prices will adjust automatically based on AI predictions</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center shadow-lg">
                  <Pause className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Manual Mode</p>
                  <p className="text-sm text-gray-600">Apply AI recommendations manually</p>
                </div>
              </>
            )}
          </div>
          <button className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${autoOptimize
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
              : 'bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white'
            }`}>
            {autoOptimize ? 'Deactivate' : 'Activate'} Auto-Optimize
          </button>
        </div>
      </div>

      {/* Dynamic Rules */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-lg">Dynamic Pricing Rules</h3>
          <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {rules.map(rule => (
            <div key={rule.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div>
                  <p className="font-medium text-gray-800">If <span className="text-amber-600">{rule.condition}</span></p>
                  <p className="text-sm text-gray-500">Then adjust price <span className="font-medium text-gray-700">{rule.action}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:border-l sm:border-gray-200 sm:pl-6">
                <button className={`p-2 rounded-lg transition-colors ${rule.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                  }`}>
                  {rule.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 p-6 shadow-md">
        <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Suggested Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">If ticket sales {'>'} 500 in first week</p>
              <p className="text-xs text-purple-600 mt-1">Then increase price by 10%</p>
            </div>
            <button className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md">
              Add
            </button>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">If event date within 7 days</p>
              <p className="text-xs text-purple-600 mt-1">Then apply last-minute discount 20%</p>
            </div>
            <button className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tiers Tab
const TiersTab = ({ pricingData }) => {
  const [tiers, setTiers] = useState(pricingData?.tiers || []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl">
          <Plus className="w-5 h-5" />
          Add Ticket Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier, index) => (
          <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-6 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-xl mb-1">{tier.name}</h3>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>
                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-medium shadow-sm">
                  {tier.available} left
                </span>
              </div>

              <div className="mb-4">
                <p className="text-4xl font-bold text-gray-800">${tier.price}</p>
                <p className="text-sm text-gray-500 mt-1">per ticket</p>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">Benefits:</p>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">AI Recommendation</p>
                    <p className="text-sm font-medium text-green-600">
                      {tier.recommendation}
                    </p>
                  </div>
                  <button className="px-4 py-2 text-amber-600 hover:text-amber-700 font-medium text-sm hover:bg-amber-50 rounded-lg transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Forecast Tab
const ForecastTab = ({ pricingData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ForecastCard
          title="Expected Sales"
          value="1,234 tickets"
          confidence={85}
          trend="up"
          color="green"
        />
        <ForecastCard
          title="Expected Revenue"
          value="$45,678"
          confidence={78}
          trend="up"
          color="blue"
        />
        <ForecastCard
          title="Optimal Price Point"
          value="$89"
          confidence={92}
          trend="stable"
          color="purple"
        />
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          Demand Forecast
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50/50 rounded-lg border border-gray-100 border-dashed">
          <div className="text-center">
            <LineChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">[Forecast Chart Placeholder]</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-500" />
            Price Elasticity
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">10% price increase</span>
              <span className="text-red-600 font-medium">-5% demand</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">20% price increase</span>
              <span className="text-red-600 font-medium">-12% demand</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">10% price decrease</span>
              <span className="text-green-600 font-medium">+8% demand</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Seasonal Factors
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Weekend multiplier</span>
              <span className="text-green-600 font-medium">1.25x</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Holiday multiplier</span>
              <span className="text-green-600 font-medium">1.45x</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Evening events</span>
              <span className="text-green-600 font-medium">1.15x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Competitors Tab
const CompetitorsTab = ({ pricingData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Competitor</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">vs Your Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockCompetitors.map((comp, index) => (
                <tr key={index} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{comp.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{comp.event}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-semibold text-gray-900">${comp.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${comp.availability > 100 ? 'bg-green-100 text-green-800' :
                        comp.availability > 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {comp.availability} tickets
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 font-medium ${comp.price < pricingData.currentPrice ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {comp.price < pricingData.currentPrice ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      {Math.abs(((comp.price - pricingData.currentPrice) / pricingData.currentPrice * 100)).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full -mr-20 -mt-20"></div>
        <div className="relative">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Competitive Positioning
          </h4>
          <p className="text-blue-800">
            Your prices are 12% above market average with 25% higher perceived value.
            Consider highlighting premium features in marketing.
          </p>
        </div>
      </div>
    </div>
  );
};

// Mock Data
const mockEvents = [
  { id: 1, name: 'Summer Music Festival 2024' },
  { id: 2, name: 'Tech Conference 2024' },
  { id: 3, name: 'Food & Wine Expo' }
];

const mockPricingData = {
  currentPrice: 89,
  optimalPrice: 99,
  priceChange: 11.2,
  optimalVsCurrent: 11.2,
  demandScore: 78,
  demandChange: 15,
  revenuePotential: 45678,
  revenueChange: 23,
  tiers: [
    {
      name: 'Early Bird',
      description: 'Limited early access tickets',
      price: 69,
      available: 45,
      benefits: ['Early entry', '10% merch discount'],
      recommendation: 'Increase by $10'
    },
    {
      name: 'General Admission',
      description: 'Standard access',
      price: 89,
      available: 234,
      benefits: ['Full event access', 'Welcome drink'],
      recommendation: 'Optimal price'
    },
    {
      name: 'VIP',
      description: 'Premium experience',
      price: 199,
      available: 12,
      benefits: ['VIP lounge', 'Meet & greet', 'Premium seating'],
      recommendation: 'Add more perks'
    }
  ]
};

const mockAiRecommendations = [
  {
    type: 'positive',
    message: 'Increase price by $10 for weekend passes - demand is high',
    impact: '+$3,420 potential revenue'
  },
  {
    type: 'warning',
    message: 'Competitor lowering prices for similar event',
    impact: 'May affect your sales'
  },
  {
    type: 'positive',
    message: 'Bundle VIP with merchandise for 20% uptake',
    impact: 'Expected +45 VIP sales'
  }
];

const mockCompetitors = [
  { name: 'EventPro', event: 'Summer Beats Fest', price: 79, availability: 156 },
  { name: 'TicketMaster', event: 'Music Festival 2024', price: 95, availability: 45 },
  { name: 'LiveNation', event: 'Summer Concert Series', price: 85, availability: 234 },
  { name: 'StubHub', event: 'Beach Festival', price: 69, availability: 567 }
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
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-100',
      icon: 'from-amber-500 to-orange-500',
      text: 'text-amber-600'
    }
  };

  const isPositive = change.startsWith('+');

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors[color].bg} border ${colors[color].border} p-6 shadow-md hover:shadow-lg transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-10 -mt-10"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color].icon} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'} bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit shadow-sm`}>
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {change} from last period
        </div>
      </div>
    </div>
  );
};

const ForecastCard = ({ title, value, confidence, trend, color }) => {
  const colors = {
    green: 'from-green-50 to-emerald-50 border-green-100',
    blue: 'from-blue-50 to-cyan-50 border-blue-100',
    purple: 'from-purple-50 to-pink-50 border-purple-100'
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colors[color]} p-6 shadow-md hover:shadow-lg transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-10 -mt-10"></div>
      <div className="relative">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mb-3">{value}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full">
            Confidence: {confidence}%
          </span>
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
          {trend === 'stable' && <Activity className="w-4 h-4 text-blue-600" />}
        </div>
      </div>
    </div>
  );
};

// Missing ChevronDown import
const ChevronDown = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default SmartPricing;