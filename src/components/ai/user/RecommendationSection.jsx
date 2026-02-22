import { Sparkles, RefreshCw, Filter, Calendar, MapPin, DollarSign, Tag, ThumbsUp, Brain, Star, TrendingUp, Clock, Award, Target, Zap, Users, Music, Briefcase, GraduationCap, Film, Utensils, Gamepad2, Heart, Shield, AlertTriangle, CheckCircle, XCircle, Info, ChevronRight, ChevronDown, Sliders, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext"; // Fixed: using @ alias
import AILoadingSpinner from './AILoadingSpinner';
import AIBadge, { AIAgentBadge, AIScoreBadge, AICompactBadge } from './AIBadge';
import recommendationService from "@/services/recommendationService"; // Fixed: using @ alias
import { useRecommendations } from "@/hooks/useRecommendations"; // Fixed: using @ alias
import { getConfidenceLevel } from "@/utils/aiHelpers"; // Fixed: using @ alias

const RecommendationSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: 'any',
    location: '',
    dateRange: 'anytime',
    sortBy: 'relevance',
    eventType: 'all',
    minRating: 0,
    maxDistance: 50,
    tags: [],
    aiPreferences: true
  });

  const [availableCategories] = useState([
    { id: 'tech', name: 'Technology', icon: Briefcase, color: 'blue' },
    { id: 'music', name: 'Music', icon: Music, color: 'purple' },
    { id: 'business', name: 'Business', icon: Briefcase, color: 'green' },
    { id: 'arts', name: 'Arts', icon: Film, color: 'pink' },
    { id: 'food', name: 'Food & Drink', icon: Utensils, color: 'orange' },
    { id: 'sports', name: 'Sports', icon: Target, color: 'red' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: 'indigo' },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'yellow' }
  ]);

  const { 
    recommendations: hookRecommendations, 
    insights, 
    loading: hookLoading, 
    error, 
    fetchRecommendations: hookFetchRecommendations,
    getPersonalizedInsights,
    getSimilarEvents,
    getTrendingCategories
  } = useRecommendations(user?.id);

  // Fetch recommendations with filters
  const fetchRecommendations = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Use hook for AI-powered recommendations
      const data = await hookFetchRecommendations(filters);
      setRecommendations(data);

      // Get AI insights
      const insights = await getPersonalizedInsights();
      setAiInsights(insights);

      // Track user interaction for better recommendations
      if (user?.id) {
        recommendationService.trackRecommendationView(user.id, data.map(r => r.id));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to mock data with enhanced AI features
      const mockData = generateEnhancedMockRecommendations(filters);
      setRecommendations(mockData.recommendations);
      setAiInsights(mockData.insights);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters, hookFetchRecommendations, getPersonalizedInsights]);

  // Generate enhanced mock recommendations with AI scores
  const generateEnhancedMockRecommendations = (currentFilters) => {
    const baseRecommendations = [
      {
        id: 101,
        title: "Tech Networking: AI & ML Summit",
        category: "Technology",
        categoryId: "tech",
        date: "Fri, Jan 15",
        time: "6:00 PM",
        location: "Tech Hub Center, San Francisco",
        price: 25.00,
        originalPrice: 45.00,
        promoted: false,
        goingFast: true,
        salesEndSoon: false,
        tags: ["ai", "networking", "tech", "ml"],
        image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop",
        aiReason: "Matches your interest in technology and networking events",
        aiScore: 95,
        matchReasons: [
          "You attended 3 tech events last month",
          "Similar to events you've liked",
          "Popular among your network"
        ],
        confidence: 94,
        attendees: 234,
        rating: 4.8,
        isVirtual: false,
        distance: 5.2,
        badges: ['trending', 'premium']
      },
      {
        id: 102,
        title: "Advanced JavaScript Workshop",
        category: "Education",
        categoryId: "education",
        date: "Sat, Jan 16",
        time: "10:00 AM",
        location: "Online",
        price: 49.99,
        originalPrice: 79.99,
        promoted: false,
        goingFast: false,
        salesEndSoon: true,
        tags: ["javascript", "programming", "workshop", "online"],
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&h=300&fit=crop",
        aiReason: "Based on your past programming workshop attendance",
        aiScore: 88,
        matchReasons: [
          "You completed JavaScript basics course",
          "Preferred online events",
          "Early bird discount available"
        ],
        confidence: 82,
        attendees: 156,
        rating: 4.6,
        isVirtual: true,
        distance: 0,
        badges: ['discount', 'online']
      },
      {
        id: 103,
        title: "Startup Pitch Night",
        category: "Business",
        categoryId: "business",
        date: "Thu, Jan 14",
        time: "7:00 PM",
        location: "Innovation Hub, Austin",
        price: 15.00,
        originalPrice: 15.00,
        promoted: true,
        goingFast: true,
        salesEndSoon: false,
        tags: ["startup", "pitch", "entrepreneurship", "networking"],
        image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&h=300&fit=crop",
        aiReason: "Recommended for aspiring entrepreneurs",
        aiScore: 91,
        matchReasons: [
          "You follow startup news",
          "Similar to events you've attended",
          "Top pick this week"
        ],
        confidence: 87,
        attendees: 89,
        rating: 4.9,
        isVirtual: false,
        distance: 3.8,
        badges: ['hot', 'limited']
      },
      {
        id: 104,
        title: "Summer Music Festival",
        category: "Music",
        categoryId: "music",
        date: "Sat, Jan 16",
        time: "2:00 PM",
        location: "Central Park, New York",
        price: 89.00,
        originalPrice: 120.00,
        promoted: true,
        goingFast: true,
        salesEndSoon: true,
        tags: ["music", "festival", "outdoor", "summer"],
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&h=300&fit=crop",
        aiReason: "Popular among your age group in NYC",
        aiScore: 86,
        matchReasons: [
          "You attended similar festivals",
          "Your friends are going",
          "Early bird discount available"
        ],
        confidence: 79,
        attendees: 1243,
        rating: 4.7,
        isVirtual: false,
        distance: 12.5,
        badges: ['bestseller', 'limited']
      },
      {
        id: 105,
        title: "Virtual Reality Gaming Expo",
        category: "Gaming",
        categoryId: "gaming",
        date: "Sun, Jan 17",
        time: "11:00 AM",
        location: "Online + Convention Center",
        price: 35.00,
        originalPrice: 35.00,
        promoted: false,
        goingFast: false,
        salesEndSoon: false,
        tags: ["vr", "gaming", "expo", "virtual"],
        image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=500&h=300&fit=crop",
        aiReason: "Trending in gaming communities",
        aiScore: 93,
        matchReasons: [
          "You play VR games",
          "Hybrid event (online + in-person)",
          "Influencers attending"
        ],
        confidence: 91,
        attendees: 567,
        rating: 4.5,
        isVirtual: true,
        distance: 0,
        badges: ['new', 'trending']
      }
    ];

    // Apply filters
    let filtered = [...baseRecommendations];
    
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(r => currentFilters.categories.includes(r.categoryId));
    }
    
    if (currentFilters.priceRange !== 'any') {
      switch(currentFilters.priceRange) {
        case 'free':
          filtered = filtered.filter(r => r.price === 0);
          break;
        case 'under50':
          filtered = filtered.filter(r => r.price < 50);
          break;
        case '50-100':
          filtered = filtered.filter(r => r.price >= 50 && r.price <= 100);
          break;
        case 'over100':
          filtered = filtered.filter(r => r.price > 100);
          break;
      }
    }
    
    if (currentFilters.location) {
      filtered = filtered.filter(r => 
        r.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }
    
    if (currentFilters.eventType !== 'all') {
      if (currentFilters.eventType === 'virtual') {
        filtered = filtered.filter(r => r.isVirtual);
      } else if (currentFilters.eventType === 'in-person') {
        filtered = filtered.filter(r => !r.isVirtual);
      }
    }

    // Apply sorting
    if (currentFilters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentFilters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (currentFilters.sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (currentFilters.sortBy === 'popularity') {
      filtered.sort((a, b) => b.attendees - a.attendees);
    } else {
      // relevance (default) - sort by AI score
      filtered.sort((a, b) => b.aiScore - a.aiScore);
    }

    // Generate insights
    const insights = {
      topMatch: filtered[0],
      matchScore: filtered.reduce((acc, r) => acc + r.aiScore, 0) / filtered.length,
      categories: availableCategories.map(c => ({
        ...c,
        count: filtered.filter(r => r.categoryId === c.id).length
      })).filter(c => c.count > 0),
      trends: [
        { name: 'Virtual Events', growth: 45 },
        { name: 'Tech Conferences', growth: 32 },
        { name: 'Workshops', growth: 28 }
      ],
      summary: `Found ${filtered.length} personalized recommendations based on your profile`,
      recommendations: filtered.length
    };

    return { recommendations: filtered, insights };
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      priceRange: 'any',
      location: '',
      dateRange: 'anytime',
      sortBy: 'relevance',
      eventType: 'all',
      minRating: 0,
      maxDistance: 50,
      tags: [],
      aiPreferences: true
    });
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleLikeEvent = async (eventId) => {
    // Track user preference for better recommendations
    if (user?.id) {
      await recommendationService.trackInteraction(user.id, eventId, 'like');
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setAiInsights(null);
    }
  }, [user, fetchRecommendations]);

  // Apply filters when they change
  useEffect(() => {
    if (user) {
      const debounceTimer = setTimeout(() => {
        fetchRecommendations();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [filters, user, fetchRecommendations]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
              <AIBadge agent="recommendations" size="sm" />
            </div>
            <p className="text-sm text-gray-600">
              Personalized events based on your interests and behavior
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showFilters 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.values(filters).some(v => 
              Array.isArray(v) ? v.length > 0 : v && v !== 'any' && v !== 'all' && v !== 'relevance' && v !== ''
            ) && (
              <span className="ml-1 w-5 h-5 bg-white text-purple-600 rounded-full text-xs flex items-center justify-center">
                {Object.values(filters).filter(v => 
                  Array.isArray(v) ? v.length > 0 : v && v !== 'any' && v !== 'all' && v !== 'relevance' && v !== ''
                ).length}
              </span>
            )}
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh AI
          </button>
        </div>
      </div>

      {/* AI Insights Banner */}
      {aiInsights && !loading && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">AI Insights</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    Match Score: {Math.round(aiInsights.matchScore)}%
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {aiInsights.recommendations} recommendations
                  </span>
                </div>
              </div>
              <p className="text-sm text-white/90 mb-3">{aiInsights.summary}</p>
              <div className="flex flex-wrap gap-2">
                {aiInsights.trends?.map((trend, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs">{trend.name}</span>
                    <span className="text-xs font-bold text-green-300">+{trend.growth}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Refine Recommendations
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = filters.categories.includes(cat.id);
                  const colorClasses = {
                    blue: 'from-blue-500 to-blue-600',
                    purple: 'from-purple-500 to-purple-600',
                    green: 'from-green-500 to-green-600',
                    pink: 'from-pink-500 to-pink-600',
                    orange: 'from-orange-500 to-orange-600',
                    red: 'from-red-500 to-red-600',
                    indigo: 'from-indigo-500 to-indigo-600',
                    yellow: 'from-yellow-500 to-yellow-600'
                  };
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${colorClasses[cat.color]} text-white shadow-sm`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                >
                  <option value="any">Any Price</option>
                  <option value="free">Free Only</option>
                  <option value="under50">Under $50</option>
                  <option value="50-100">$50 - $100</option>
                  <option value="over100">Over $100</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="City, state, or zip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="anytime">Anytime</option>
                  <option value="today">Today</option>
                  <option value="weekend">This Weekend</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="relevance">AI Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="date">Date (Soonest)</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              {showAdvancedFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Advanced Filters
            </button>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={filters.eventType}
                    onChange={(e) => handleFilterChange('eventType', e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="virtual">Virtual Only</option>
                    <option value="in-person">In-Person Only</option>
                    <option value="hybrid">Hybrid Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Distance</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={filters.maxDistance}
                    onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                  >
                    <option value={10}>Within 10 miles</option>
                    <option value={25}>Within 25 miles</option>
                    <option value={50}>Within 50 miles</option>
                    <option value={100}>Within 100 miles</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-12">
          <AILoadingSpinner />
          <p className="text-center text-gray-600 mt-4">AI is analyzing your preferences...</p>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          {recommendations.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Found {recommendations.length} personalized recommendations
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Confidence:</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, recommendations.reduce((acc, r) => acc + (r.confidence || 0), 0) / recommendations.length)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => handleViewDetails(event)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      AI Pick
                    </span>
                    
                    {event.badges?.includes('trending') && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </span>
                    )}
                    
                    {event.badges?.includes('limited') && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        <Clock className="w-3 h-3" />
                        Limited
                      </span>
                    )}
                  </div>

                  {/* AI Score */}
                  <div className="absolute top-3 right-3">
                    <AIScoreBadge score={event.aiScore} size="sm" />
                  </div>

                  {/* Discount Badge */}
                  {event.originalPrice > event.price && (
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                        Save ${(event.originalPrice - event.price).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">{event.title}</h3>
                    <AIBadge 
                      agent="recommendations" 
                      size="sm" 
                      showScore={false}
                      className="ml-2 flex-shrink-0"
                    />
                  </div>
                  
                  {/* Match Reasons */}
                  <div className="mb-3 space-y-1">
                    {event.matchReasons?.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600">{reason}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Event Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{event.location}</span>
                      {event.distance > 0 && (
                        <span className="text-xs text-gray-500 ml-auto">
                          {event.distance.toFixed(1)} mi
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-900">
                          ${event.price.toFixed(2)}
                        </span>
                        {event.originalPrice > event.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ${event.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{event.rating}</span>
                        <span className="text-xs text-gray-500">({event.attendees})</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/event/${event.id}`;
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      className="p-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeEvent(event.id);
                      }}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We're still learning your preferences. Attend more events or adjust your filters to get personalized recommendations.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry AI Analysis
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="relative h-64">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setShowEventDetails(false)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-lg text-white hover:bg-opacity-70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* AI Badge */}
              <div className="absolute top-4 left-4">
                <AIBadge 
                  agent="recommendations" 
                  size="md" 
                  score={selectedEvent.aiScore}
                  reason={selectedEvent.aiReason}
                />
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
              
              {/* AI Insights */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Why we recommended this</span>
                </div>
                <ul className="space-y-2">
                  {selectedEvent.matchReasons?.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                  <p className="font-medium text-gray-900">{selectedEvent.date}</p>
                  <p className="text-sm text-gray-600">{selectedEvent.time}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{selectedEvent.location}</p>
                  {selectedEvent.distance > 0 && (
                    <p className="text-sm text-gray-600">{selectedEvent.distance} miles away</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="font-medium text-gray-900">${selectedEvent.price.toFixed(2)}</p>
                  {selectedEvent.originalPrice > selectedEvent.price && (
                    <p className="text-sm text-green-600">Save ${(selectedEvent.originalPrice - selectedEvent.price).toFixed(2)}</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{selectedEvent.category}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
                  Book Now
                </button>
                <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                  Save for Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationSection;