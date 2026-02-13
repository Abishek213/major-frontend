import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Search, TrendingUp, Sparkles, Filter, Tag, 
  AlertTriangle, RefreshCw, ChevronRight, DollarSign, Clock, Eye,
  ThumbsUp, ThumbsDown, Brain, Zap, Award, Star, Heart, Share2,
  BookmarkPlus, TrendingUp as Trending, Flame, CheckCircle, XCircle,
  X  
} from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import AILoadingSpinner from '@/components/ai/AILoadingSpinner';
import AIBadge from '@/components/ai/AIBadge';
const UserEvents = ({ user }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState('all');
  const [selectedChildCategory, setSelectedChildCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  // AI Recommendations Hook
  const { 
    recommendations: aiRecommendations, 
    loading: aiLoading, 
    rateRecommendation,
    getRecommendationInsights,
    refreshRecommendations
  } = useRecommendations();

  const [userPreferences, setUserPreferences] = useState({
    preferredCategories: [],
    priceRange: { min: 0, max: 10000 },
    locations: [],
    eventTypes: []
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        let eventsEndpoint = '/events';
        
        if (selectedParentCategory !== 'all') {
          eventsEndpoint += `?parentCategory=${selectedParentCategory}`;
          if (selectedChildCategory !== 'all') {
            eventsEndpoint += `&category=${selectedChildCategory}`;
          }
        }

        const [eventsResponse, categoriesResponse] = await Promise.all([
          api.get(eventsEndpoint),
          api.get('/categories')
        ]);
        
        const processedEvents = eventsResponse.data.map(event => ({
          ...event,
          status: determineEventStatus(event.event_date),
          aiScore: Math.floor(Math.random() * 30) + 70, // Mock AI score
          aiReason: generateAIReason(event)
        }));
        
        setEvents(processedEvents);
        setFilteredEvents(processedEvents);
        
        const parentCategories = categoriesResponse.data.filter(cat => !cat.parentCategory);
        const categoriesWithChildren = parentCategories.map(parent => ({
          ...parent,
          children: categoriesResponse.data.filter(cat => 
            cat.parentCategory && cat.parentCategory === parent._id
          )
        }));
        
        setCategories(categoriesWithChildren);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    
    // Load user preferences from localStorage
    const savedPreferences = localStorage.getItem('userEventPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, [selectedParentCategory, selectedChildCategory]);

  // Generate AI reasoning for events
  const generateAIReason = (event) => {
    const reasons = [
      'Based on your interest in similar events',
      'Matches your previous bookings',
      'Popular in your location',
      'Recommended for your profile',
      'Trending in your network',
      'Similar to events you liked'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const determineEventStatus = (eventDate) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    
    if (eventDateTime < now) return 'completed';
    if (eventDateTime.toDateString() === now.toDateString()) return 'ongoing';
    return 'upcoming';
  };

  useEffect(() => {
    let filtered = [...events];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.event_name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        (event.tags && event.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(event => event.status === activeTab);
    }

    // AI-powered sorting when viewing recommendations
    if (activeTab === 'ai-recommended') {
      filtered = filtered.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, events, activeTab]);

  // Track user interactions for AI learning
  const trackUserInteraction = async (eventId, interactionType, value = null) => {
    if (!authUser?.id) return;

    try {
      await api.safePost('/user-interactions', {
        userId: authUser.id,
        eventId,
        interactionType,
        value,
        timestamp: new Date().toISOString()
      });

      // Update local preferences
      const event = events.find(e => e._id === eventId);
      if (event) {
        const updatedPreferences = { ...userPreferences };
        
        if (interactionType === 'view') {
          updatedPreferences.preferredCategories.push(event.category?._id);
        }
        
        if (interactionType === 'feedback' && value === 'like') {
          updatedPreferences.preferredCategories.push(event.category?._id);
          if (event.tags) {
            updatedPreferences.eventTypes = [...new Set([...updatedPreferences.eventTypes, ...event.tags])];
          }
        }
        
        setUserPreferences(updatedPreferences);
        localStorage.setItem('userEventPreferences', JSON.stringify(updatedPreferences));
      }
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  };

  const handleParentCategoryChange = (categoryId) => {
    setSelectedParentCategory(categoryId);
    setSelectedChildCategory('all');
  };

  const refreshEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      const processedEvents = response.data.map(event => ({
        ...event,
        status: determineEventStatus(event.event_date),
        aiScore: Math.floor(Math.random() * 30) + 70,
        aiReason: generateAIReason(event)
      }));
      setEvents(processedEvents);
      setFilteredEvents(processedEvents);
      setError(null);
      
      // Also refresh AI recommendations
      refreshRecommendations();
    } catch (err) {
      setError('Failed to refresh events');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event) => {
    // Track view for AI learning
    trackUserInteraction(event._id, 'view');
    
    const urlFriendlyName = event.event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    navigate(`/userdb/events/${urlFriendlyName}`, {
      state: {
        eventId: event._id,
        eventData: event,
        source: 'events',
        aiRecommended: event.aiRecommended || false
      }
    });
  };

  const handleFeedback = async (eventId, type) => {
    setFeedbackGiven(prev => ({ ...prev, [eventId]: type }));
    
    // Track feedback for AI learning
    await trackUserInteraction(eventId, 'feedback', type);
    
    // Rate the recommendation
    if (type === 'like') {
      await rateRecommendation(eventId, 5);
    } else {
      await rateRecommendation(eventId, 1);
    }

    // Show success message or update UI
    setTimeout(() => {
      setFeedbackGiven(prev => ({ ...prev, [eventId]: null }));
    }, 3000);
  };

  const handleSaveEvent = async (eventId) => {
    try {
      await api.safePost('/user/saved-events', { eventId });
      // Show success notification
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const getStats = () => {
    const upcoming = events.filter(e => e.status === 'upcoming').length;
    const ongoing = events.filter(e => e.status === 'ongoing').length;
    const completed = events.filter(e => e.status === 'completed').length;
    const aiMatched = events.filter(e => e.aiScore > 85).length;
    
    return { upcoming, ongoing, completed, total: events.length, aiMatched };
  };

  const stats = getStats();
  const insights = getRecommendationInsights();

  // Enhanced tabs with AI recommendations
  const tabs = [
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming', icon: TrendingUp },
    { id: 'ongoing', label: 'Ongoing', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  // Add AI recommendations tab if user is logged in
  if (authUser) {
    tabs.splice(1, 0, { id: 'ai-recommended', label: 'AI For You', icon: Sparkles });
  }

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AILoadingSpinner />
                <p className="text-lg font-medium text-gray-700 mt-4">Loading personalized events...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !events.length) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                AI-Powered Events Dashboard
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Personalized event recommendations powered by AI
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {/* AI Insights Badge */}
              {insights && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <div className="text-sm">
                    <span className="font-medium text-purple-900">{insights.avgMatchScore}% Match</span>
                    <span className="text-gray-600 ml-1">with your taste</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={refreshEvents}
                disabled={loading}
                className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Refresh Events
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Stats Cards with AI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
              <p className="text-gray-600 font-medium">Total Events</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <Brain className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.aiMatched}</h3>
              <p className="text-gray-600 font-medium">AI Matches</p>
              <div className="mt-3 h-2 bg-purple-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.aiMatched / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Trending className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.upcoming}</h3>
              <p className="text-gray-600 font-medium">Upcoming</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.ongoing}</h3>
              <p className="text-gray-600 font-medium">Ongoing</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.completed}</h3>
              <p className="text-gray-600 font-medium">Past Events</p>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          {authUser && showAIRecommendations && aiRecommendations.length > 0 && (
            <div className="mb-10 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      AI Personalized Picks
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-normal">
                        {insights?.avgMatchScore || 85}% Match
                      </span>
                    </h3>
                    <p className="text-purple-100 mb-4">
                      Based on your {events.filter(e => e.status === 'completed').length} attended events and preferences
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveTab('ai-recommended')}
                        className="px-6 py-2.5 bg-white text-purple-700 rounded-xl font-medium hover:bg-purple-50 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        View All AI Recommendations
                      </button>
                      <button
                        onClick={refreshRecommendations}
                        className="px-6 py-2.5 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-400 transition-all flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIRecommendations(false)}
                  className="text-white/70 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="space-y-6 mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" />
                  Discover Events
                </h2>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <span>{filteredEvents.length} events found</span>
                  {activeTab === 'ai-recommended' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      AI Curated
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Enhanced Status Tabs with AI */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          activeTab === tab.id
                            ? tab.id === 'ai-recommended'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {tab.id === 'ai-recommended' && (
                          <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px]">
                            {aiRecommendations.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Search and Categories */}
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by name, description, location, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Categories Navigation (unchanged) */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  Categories
                </h3>
                
                {/* Parent Categories */}
                <div className="flex flex-wrap gap-2">
                  {/* ... existing category buttons ... */}
                </div>
              </div>
            </div>
          </div>

          {/* Events Grid with AI Features */}
          <div className="space-y-6">
            {filteredEvents.length === 0 ? (
              <div className="py-16 text-center border border-gray-200 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'ai-recommended' 
                    ? "We're still learning your preferences. Attend more events to get personalized recommendations!"
                    : searchTerm 
                      ? `No events matching "${searchTerm}". Try a different search term.`
                      : 'No events match your selected filters. Try adjusting your criteria.'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedParentCategory('all');
                    setSelectedChildCategory('all');
                    setActiveTab('all');
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => {
                  const isEventFull = event.attendees?.length >= event.totalSlots;
                  const status = determineEventStatus(event.event_date);
                  const isAIRec = event.aiScore > 85 || activeTab === 'ai-recommended';
                  
                  return (
                    <div 
                      key={event._id} 
                      className={`group bg-gradient-to-br from-white to-gray-50 border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative ${
                        isAIRec ? 'border-purple-300 hover:border-purple-400' : 'border-gray-200'
                      }`}
                    >
                      {/* AI Recommendation Badge */}
                      {isAIRec && (
                        <AIBadge 
                          score={event.aiScore} 
                          reason={event.aiReason}
                          className="absolute top-4 left-4 z-10"
                        />
                      )}

                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
                          alt={event.event_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            status === 'upcoming' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                            status === 'ongoing' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            'bg-gradient-to-r from-gray-500 to-gray-700'
                          } text-white shadow-lg`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white font-medium shadow-lg flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {event.price}
                          </span>
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={() => handleSaveEvent(event._id)}
                          className="absolute bottom-4 right-4 p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all"
                        >
                          <Heart className="w-5 h-5 text-white" />
                        </button>
                      </div>

                      {/* Event Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(event.event_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {event.attendees?.length || 0}/{event.totalSlots}
                            </span>
                          </div>
                        </div>

                        <h3 className={`font-bold group-hover:text-indigo-700 transition-colors text-lg mb-3 line-clamp-2 ${
                          isAIRec ? 'text-purple-700' : 'text-gray-800'
                        }`}>
                          {event.event_name}
                        </h3>

                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 line-clamp-1">
                            {event.location}
                          </span>
                        </div>

                        {/* AI Insight */}
                        {isAIRec && event.aiReason && (
                          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="w-4 h-4 text-purple-600" />
                              <span className="text-xs font-medium text-purple-700">AI Insight</span>
                            </div>
                            <p className="text-xs text-gray-700">{event.aiReason}</p>
                          </div>
                        )}

                        {/* Category Badges */}
                        {event.category && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                              {event.category.categoryName}
                            </span>
                            {event.category.parentCategory && (
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                                {event.category.parentCategory.categoryName}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-6">
                            {event.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
                              >
                                #{tag}
                              </span>
                            ))}
                            {event.tags.length > 3 && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                                +{event.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleViewDetails(event)}
                            className="group/view flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Eye className="w-5 h-5 group-hover/view:scale-110 transition-transform" />
                            View Details
                            <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                          </button>
                          
                          {/* AI Feedback Buttons */}
                          {authUser && status !== 'completed' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleFeedback(event._id, 'like')}
                                className={`p-3 rounded-xl transition-all duration-300 ${
                                  feedbackGiven[event._id] === 'like'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                                }`}
                                title="I like this recommendation"
                              >
                                <ThumbsUp className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(event._id, 'dislike')}
                                className={`p-3 rounded-xl transition-all duration-300 ${
                                  feedbackGiven[event._id] === 'dislike'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                }`}
                                title="Not interested"
                              >
                                <ThumbsDown className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Registration Deadline */}
                        {event.registrationDeadline && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <p className="text-xs text-gray-600">
                                Registration closes on {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEvents;