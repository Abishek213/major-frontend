import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Download,
  RefreshCw,
  Clock,
  Filter,
  Eye,
  AlertTriangle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  ChevronDown,
  Star,
  Award,
  Target
} from 'lucide-react';
import AIBadge from '../AIBadge';
import adminAIService from '../../../services/adminAIService';

const CohortAnalysisView = ({ timeframe = '6months' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [cohortType, setCohortType] = useState('user');
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCohortData();
  }, [cohortType, timeframe]);

  const fetchCohortData = async () => {
    setLoading(true);
    setError(null);
    setRefreshing(true);
    try {
      const data = await adminAIService.getCohortAnalysis(cohortType, timeframe);
      setCohortData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRetentionColor = (rate) => {
    if (rate >= 70) return 'bg-gradient-to-br from-emerald-500 to-green-500';
    if (rate >= 50) return 'bg-gradient-to-br from-emerald-400 to-green-400';
    if (rate >= 30) return 'bg-gradient-to-br from-amber-400 to-yellow-400';
    if (rate >= 10) return 'bg-gradient-to-br from-orange-400 to-amber-400';
    return 'bg-gradient-to-br from-rose-500 to-pink-500';
  };

  const getRetentionBadge = (rate) => {
    if (rate >= 70) return 'text-emerald-700 bg-emerald-100';
    if (rate >= 50) return 'text-green-700 bg-green-100';
    if (rate >= 30) return 'text-amber-700 bg-amber-100';
    if (rate >= 10) return 'text-orange-700 bg-orange-100';
    return 'text-rose-700 bg-rose-100';
  };

  if (loading && !cohortData) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Users className="w-5 h-5 text-blue-600 animate-pulse" />
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Cohort Analysis
              </h1>
              <p className="text-gray-600">
                Track user retention and behavior patterns across different cohorts
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <AIBadge type="admin" agent="analytics" />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-all duration-300 ${
                    showFilters 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  onClick={fetchCohortData}
                  disabled={refreshing}
                  className={`p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 ${
                    refreshing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-lg animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cohort Type
                  </label>
                  <select
                    value={cohortType}
                    onChange={(e) => setCohortType(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="user">User Cohorts</option>
                    <option value="organizer">Organizer Cohorts</option>
                    <option value="event">Event Cohorts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Range
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => {}}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="12months">Last 12 Months</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {cohortData && (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <Activity className="w-8 h-8 text-blue-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{cohortData.totalCohorts}</h3>
                  <p className="text-gray-600 font-medium">Total Cohorts</p>
                  <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-full"></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <Activity className="w-8 h-8 text-emerald-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{cohortData.avgRetention}%</h3>
                  <p className="text-gray-600 font-medium">Avg Retention</p>
                  <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${cohortData.avgRetention}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <Star className="w-8 h-8 text-purple-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{cohortData.bestCohort}</h3>
                  <p className="text-gray-600 font-medium">Best Performing</p>
                  <div className="mt-3 h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-full"></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <PieChart className="w-8 h-8 text-amber-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">
                    {cohortData.cohorts?.reduce((acc, c) => acc + (c.size || 0), 0) || 0}
                  </h3>
                  <p className="text-gray-600 font-medium">Total Users</p>
                  <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full w-full"></div>
                  </div>
                </div>
              </div>

              {/* Cohort Table Section */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Cohort Retention Matrix
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Monthly retention rates by cohort group
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Cohort Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                          <th className="py-4 pl-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                            Cohort
                          </th>
                          <th className="py-4 px-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                            Size
                          </th>
                          {cohortData.periods?.map((period, idx) => (
                            <th key={idx} className="py-4 px-3 text-center font-bold text-gray-700 text-sm uppercase tracking-wider">
                              M{idx + 1}
                            </th>
                          ))}
                          <th className="py-4 pr-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cohortData.cohorts?.map((cohort, idx) => (
                          <tr 
                            key={idx} 
                            className={`group border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 cursor-pointer ${
                              selectedCohort === cohort.name ? 'bg-gradient-to-r from-blue-50/50 to-cyan-50/50' : ''
                            }`}
                            onClick={() => setSelectedCohort(cohort.name)}
                          >
                            <td className="py-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-semibold text-gray-900">{cohort.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                {cohort.size}
                              </span>
                            </td>
                            {cohort.retention.map((rate, rateIdx) => (
                              <td key={rateIdx} className="py-2 px-3">
                                <div className="flex items-center justify-center">
                                  <div 
                                    className={`w-10 h-10 rounded-lg ${getRetentionColor(rate)} flex items-center justify-center text-white text-xs font-bold shadow-sm hover:scale-110 transition-transform duration-300 cursor-help`}
                                    title={`${rate}% retention rate in month ${rateIdx + 1}`}
                                  >
                                    {rate}%
                                  </div>
                                </div>
                              </td>
                            ))}
                            <td className="py-4 pr-6">
                              <div className="flex items-center gap-2">
                                {cohort.retention[cohort.retention.length - 1] > cohort.retention[0] ? (
                                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <TrendingUp className="w-5 h-5 text-rose-500 rotate-180" />
                                )}
                                <span className={`text-sm font-medium ${
                                  cohort.retention[cohort.retention.length - 1] > cohort.retention[0] 
                                    ? 'text-emerald-600' 
                                    : 'text-rose-600'
                                }`}>
                                  {cohort.retention[cohort.retention.length - 1] - cohort.retention[0]}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Selected Cohort Insights */}
              {selectedCohort && cohortData.insights && (
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-lg animate-fade-in">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    AI Insights for {selectedCohort}
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Insights */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Findings</h4>
                      {cohortData.insights
                        .filter(insight => insight.cohort === selectedCohort)
                        .map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-700">{insight.message}</p>
                          </div>
                        ))}
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">AI Recommendations</h4>
                      {cohortData.recommendations
                        ?.filter(rec => rec.cohort === selectedCohort)
                        .map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100">
                              <ArrowRight className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-sm text-gray-700">{rec.action}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Retention Pattern */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Retention Pattern</h4>
                    <div className="flex items-end justify-around h-32 bg-white rounded-lg p-4 border border-gray-100">
                      {cohortData.cohorts
                        ?.find(c => c.name === selectedCohort)
                        ?.retention.map((rate, idx) => (
                          <div key={idx} className="flex flex-col items-center group relative">
                            <div 
                              className={`w-8 md:w-10 rounded-t-lg transition-all duration-300 group-hover:scale-110 ${getRetentionColor(rate)}`}
                              style={{ height: `${rate * 1.5}px` }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                Month {idx + 1}: {rate}%
                              </div>
                            </div>
                            <span className="text-xs mt-2 text-gray-600">M{idx + 1}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

             
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CohortAnalysisView;