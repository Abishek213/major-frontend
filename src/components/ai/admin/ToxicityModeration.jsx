import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Flag,
  User,
  Calendar,
  MessageSquare,
  Filter,
  RefreshCw,
  Clock,
  TrendingUp,
  Brain,
  ChevronDown,
  Activity,
  Gauge,
  AlertOctagon,
  Ban,
  Users,
  MessageCircle
} from 'lucide-react';
import AIBadge from '../AIBadge';
import adminAIService from '../../../services/adminAIService';

const ToxicityModeration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toxicContent, setToxicContent] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  useEffect(() => {
    fetchToxicContent();
  }, []);

  const fetchToxicContent = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    try {
      const data = await adminAIService.getToxicityAlerts(0.5);
      setToxicContent(data.alerts || []);
      
      // Calculate stats
      const newStats = (data.alerts || []).reduce((acc, item) => {
        acc.total++;
        if (item.toxicityScore > 0.8) acc.high++;
        else if (item.toxicityScore > 0.6) acc.medium++;
        else acc.low++;
        return acc;
      }, { total: 0, high: 0, medium: 0, low: 0 });
      
      setStats(newStats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleModerate = async (id, action) => {
    try {
      await adminAIService.moderateContent(id, action);
      setToxicContent(prev => prev.filter(item => item.id !== id));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        [action === 'remove' ? 'high' : 'medium']: prev[action === 'remove' ? 'high' : 'medium'] - 1
      }));
    } catch (err) {
      console.error('Failed to moderate content:', err);
    }
  };

  const getToxicityLevel = (score) => {
    if (score > 0.8) return { 
      label: 'High', 
      color: 'destructive',
      bg: 'bg-gradient-to-r from-rose-100 to-pink-100',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: 'text-rose-500'
    };
    if (score > 0.6) return { 
      label: 'Medium', 
      color: 'warning',
      bg: 'bg-gradient-to-r from-amber-100 to-yellow-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: 'text-amber-500'
    };
    return { 
      label: 'Low', 
      color: 'secondary',
      bg: 'bg-gradient-to-r from-emerald-100 to-green-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: 'text-emerald-500'
    };
  };

  const filteredContent = toxicContent.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'high') return item.toxicityScore > 0.8;
    if (filter === 'medium') return item.toxicityScore > 0.6 && item.toxicityScore <= 0.8;
    if (filter === 'low') return item.toxicityScore <= 0.6;
    return true;
  });

  if (loading && !toxicContent.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-rose-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Shield className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Error Alert */}
      {error && (
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Error Loading Data</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Close error"
          >
            <XCircle className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                Toxicity Moderation
              </h1>
              <p className="text-gray-600">
                AI-powered content moderation to detect and manage toxic content
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <AIBadge type="admin" agent="sentiment" />
              <button
                onClick={fetchToxicContent}
                disabled={refreshing}
                className={`p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
                  <AlertOctagon className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
              <p className="text-gray-600 font-medium">Total Alerts</p>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gray-500 to-slate-500 rounded-full w-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-rose-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.high}</h3>
              <p className="text-gray-600 font-medium">High Risk</p>
              <div className="mt-3 h-2 bg-rose-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.high / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.medium}</h3>
              <p className="text-gray-600 font-medium">Medium Risk</p>
              <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.medium / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.low}</h3>
              <p className="text-gray-600 font-medium">Low Risk</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.low / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-600" />
                Toxic Content Alerts
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredContent.length} items requiring moderation
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300 border ${
                  filterMenuOpen || filter !== 'all'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-md' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {filter === 'all' ? 'All Risks' : `${filter} Risk`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${filterMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Dropdown */}
          {filterMenuOpen && (
            <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-lg animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => { setFilter('all'); setFilterMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === 'all' 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  All Risks
                </button>
                <button
                  onClick={() => { setFilter('high'); setFilterMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === 'high' 
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  High Risk
                </button>
                <button
                  onClick={() => { setFilter('medium'); setFilterMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === 'medium' 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Medium Risk
                </button>
                <button
                  onClick={() => { setFilter('low'); setFilterMenuOpen(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filter === 'low' 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Low Risk
                </button>
              </div>
            </div>
          )}

          {/* Toxic Content List */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            {filteredContent.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Toxic Content Detected</h3>
                <p className="text-gray-500 mb-6">
                  All content appears to be clean. Keep monitoring for potential issues.
                </p>
                <button
                  onClick={() => {
                    setFilter('all');
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 font-medium hover:from-rose-200 hover:to-pink-200 transition-all duration-300"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredContent.map((item) => {
                  const level = getToxicityLevel(item.toxicityScore);
                  
                  return (
                    <div
                      key={item.id}
                      className={`group p-6 hover:bg-gradient-to-r hover:from-rose-50/50 hover:to-pink-50/50 transition-all duration-300 ${
                        selectedItem === item.id ? 'bg-gradient-to-r from-rose-50/50 to-pink-50/50' : ''
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Left Section - Icon and Badge */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-xl ${level.bg} flex items-center justify-center shadow-sm`}>
                            <AlertTriangle className={`w-6 h-6 ${level.icon}`} />
                          </div>
                        </div>

                        {/* Middle Section - Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${level.bg} ${level.text} border ${level.border} shadow-sm`}>
                                {level.label} Toxicity
                              </span>
                              <div className="flex items-center gap-1">
                                <Gauge className={`w-4 h-4 ${level.icon}`} />
                                <span className={`text-sm font-medium ${level.text}`}>
                                  {(item.toxicityScore * 100).toFixed(0)}% confidence
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex items-start gap-3 mb-3">
                            <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700 flex-1 leading-relaxed">"{item.content}"</p>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{item.userName}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                              <MessageCircle className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{item.type}</span>
                            </div>
                          </div>

                          {/* Toxic Categories */}
                          {item.categories && item.categories.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Brain className="w-3 h-3" />
                                Categories:
                              </span>
                              {item.categories.map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Toxicity Score Bar */}
                          <div className="mt-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    item.toxicityScore > 0.8 ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
                                    item.toxicityScore > 0.6 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                    'bg-gradient-to-r from-emerald-500 to-green-500'
                                  }`}
                                  style={{ width: `${item.toxicityScore * 100}%` }}
                                />
                              </div>
                              <span className={`text-sm font-medium ${
                                item.toxicityScore > 0.8 ? 'text-rose-600' :
                                item.toxicityScore > 0.6 ? 'text-amber-600' :
                                'text-emerald-600'
                              }`}>
                                Toxicity Score: {Math.round(item.toxicityScore * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex flex-row lg:flex-col gap-2 justify-end">
                          <button
                            onClick={() => handleModerate(item.id, 'hide')}
                            className="p-3 rounded-lg bg-gray-100 hover:bg-amber-100 transition-all duration-300 hover:scale-110 group-hover:shadow-lg"
                            title="Hide Content"
                          >
                            <EyeOff className="w-5 h-5 text-gray-600 hover:text-amber-600" />
                          </button>
                          <button
                            onClick={() => handleModerate(item.id, 'remove')}
                            className="p-3 rounded-lg bg-gray-100 hover:bg-rose-100 transition-all duration-300 hover:scale-110 group-hover:shadow-lg"
                            title="Remove Content"
                          >
                            <Ban className="w-5 h-5 text-gray-600 hover:text-rose-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions Footer */}
          {toxicContent.length > 0 && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  // Mark all as reviewed
                  setToxicContent([]);
                  setStats({ total: 0, high: 0, medium: 0, low: 0 });
                }}
                className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium flex items-center gap-2 transition-all duration-300 hover:bg-gray-50 hover:scale-105"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Mark All Reviewed
              </button>
              <button
                onClick={fetchToxicContent}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToxicityModeration;