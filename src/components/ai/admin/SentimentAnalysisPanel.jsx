import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown,
  Minus,
  Search,
  Filter,
  AlertTriangle,
  Star,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Brain,
  RefreshCw,
  XCircle,
  ChevronDown,
  Activity,
  Smile,
  Frown,
  Meh,
  Heart,
  Clock,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';
import AIBadge from '../user/AIBadge';
import adminAIService from '../../../services/adminAIService';

const SentimentAnalysisPanel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, reviewsData] = await Promise.all([
        adminAIService.getSentimentOverview(),
        adminAIService.getRecentReviews()
      ]);
      setSentimentData(overview);
      setReviews(reviewsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSentimentData();
  };

  const getSentimentIcon = (score) => {
    if (score > 0.5) {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shadow-sm">
          <Smile className="w-5 h-5 text-emerald-600" />
        </div>
      );
    }
    if (score > -0.5) {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center shadow-sm">
          <Meh className="w-5 h-5 text-amber-600" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shadow-sm">
        <Frown className="w-5 h-5 text-rose-600" />
      </div>
    );
  };

  const getSentimentBadge = (label) => {
    switch(label) {
      case 'positive':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 shadow-sm">
            <ThumbsUp className="w-3 h-3 inline mr-1" />
            Positive
          </span>
        );
      case 'negative':
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200 shadow-sm">
            <ThumbsDown className="w-3 h-3 inline mr-1" />
            Negative
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200 shadow-sm">
            <Minus className="w-3 h-3 inline mr-1" />
            Neutral
          </span>
        );
    }
  };

  const getSentimentColor = (score) => {
    if (score > 0.5) return 'text-emerald-600';
    if (score > -0.5) return 'text-amber-600';
    return 'text-rose-600';
  };

  const filteredReviews = reviews.filter(review => {
    if (filter !== 'all' && review.sentimentLabel !== filter) return false;
    if (searchTerm && !review.comment?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Calculate stats
  const positiveCount = reviews.filter(r => r.sentimentLabel === 'positive').length;
  const negativeCount = reviews.filter(r => r.sentimentLabel === 'negative').length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  if (loading && !reviews.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-purple-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                Sentiment Analysis Dashboard
              </h1>
              <p className="text-gray-600">
                AI-powered sentiment monitoring from user reviews and feedback
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`mt-4 md:mt-0 px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                refreshing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Refresh Data
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{sentimentData?.positive || 0}%</h3>
              <p className="text-gray-600 font-medium">Positive Reviews</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${sentimentData?.positive || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Minus className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{sentimentData?.neutral || 0}%</h3>
              <p className="text-gray-600 font-medium">Neutral Reviews</p>
              <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${sentimentData?.neutral || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <ThumbsDown className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-rose-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{sentimentData?.negative || 0}%</h3>
              <p className="text-gray-600 font-medium">Negative Reviews</p>
              <div className="mt-3 h-2 bg-rose-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${sentimentData?.negative || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <BarChart3 className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{averageRating}</h3>
              <p className="text-gray-600 font-medium">Average Rating</p>
              <div className="mt-3 h-2 bg-purple-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(averageRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Keywords and Trend Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Common Keywords */}
            {sentimentData?.keywords && sentimentData.keywords.length > 0 && (
              <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-md">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Common Keywords in Reviews
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sentimentData.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200 shadow-sm hover:scale-105 transition-all duration-300 cursor-default"
                    >
                      {keyword.word}
                      <span className="ml-2 px-2 py-0.5 bg-white rounded-md text-purple-600 text-xs font-bold">
                        {keyword.count}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-md">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Quick Stats
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold text-gray-900">{sentimentData?.total || 0}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">AI Confidence</span>
                    <span className="font-semibold text-emerald-600">94%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Flagged Content</span>
                    <span className="font-semibold text-rose-600">{negativeCount}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${(negativeCount / (reviews.length || 1)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Trend */}
          {sentimentData?.trend && sentimentData.trend.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-md mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Sentiment Trend (Last 7 days)
              </h4>
              <div className="h-32 bg-white rounded-lg flex items-end justify-around p-4 border border-gray-100">
                {sentimentData.trend.map((point, index) => (
                  <div key={index} className="flex flex-col items-center group relative">
                    <div 
                      className={`w-8 md:w-10 rounded-t-lg transition-all duration-300 group-hover:scale-110 ${
                        point.sentiment > 0.5 ? 'bg-gradient-to-t from-emerald-400 to-green-400' : 
                        point.sentiment > -0.5 ? 'bg-gradient-to-t from-amber-400 to-yellow-400' : 
                        'bg-gradient-to-t from-rose-400 to-pink-400'
                      }`}
                      style={{ height: `${Math.abs(point.sentiment * 50) + 30}px` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                        Score: {point.sentiment}
                      </div>
                    </div>
                    <span className="text-xs mt-2 text-gray-600 font-medium">{point.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  Recent Reviews Analysis
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredReviews.length} reviews available for analysis
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews by content or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300 border ${
                  filterMenuOpen || filter !== 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent shadow-md' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {filter === 'all' ? 'All Sentiments' : filter}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${filterMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Dropdown */}
            {filterMenuOpen && (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-lg animate-fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => { setFilter('all'); setFilterMenuOpen(false); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === 'all' 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setFilter('positive'); setFilterMenuOpen(false); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === 'positive' 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Positive
                  </button>
                  <button
                    onClick={() => { setFilter('neutral'); setFilterMenuOpen(false); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === 'neutral' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Neutral
                  </button>
                  <button
                    onClick={() => { setFilter('negative'); setFilterMenuOpen(false); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === 'negative' 
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Negative
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              {filteredReviews.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className={`group p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer ${
                        selectedReview?.id === review.id ? 'bg-gradient-to-r from-purple-50/50 to-indigo-50/50' : ''
                      }`}
                      onClick={() => setSelectedReview(review)}
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sentiment Icon */}
                        <div className="flex-shrink-0">
                          {getSentimentIcon(review.sentimentScore)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-semibold text-gray-900 text-lg">
                                {review.userName || 'Anonymous User'}
                              </span>
                              <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full">
                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                <span className="text-sm font-medium text-amber-700">{review.rating}</span>
                              </div>
                              {getSentimentBadge(review.sentimentLabel)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            "{review.comment}"
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{review.eventName || 'General Feedback'}</span>
                            </div>
                            
                            {/* Sentiment Score Bar */}
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      review.sentimentScore > 0.5 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                      review.sentimentScore > -0.5 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                      'bg-gradient-to-r from-rose-500 to-pink-500'
                                    }`}
                                    style={{ width: `${Math.abs(review.sentimentScore * 100)}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium ${getSentimentColor(review.sentimentScore)}`}>
                                  Score: {review.sentimentScore.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Toxicity Warning */}
                          {review.toxicityScore > 0.7 && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-rose-50 to-pink-50 border-l-4 border-rose-500 rounded-lg">
                              <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                <span className="text-sm font-medium text-rose-700">
                                  Potential toxic content detected (Confidence: {Math.round(review.toxicityScore * 100)}%)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(review);
                          }}
                          className="flex-shrink-0 p-3 rounded-lg bg-gray-100 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 hover:scale-110 group-hover:shadow-lg"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <MessageCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? 'Try adjusting your search terms' : 'No reviews match the selected filter'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 font-medium hover:from-purple-200 hover:to-indigo-200 transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysisPanel;