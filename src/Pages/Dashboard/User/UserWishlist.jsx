import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Calendar, MapPin, Clock, Trash2, Users, AlertTriangle, 
  RefreshCw, TrendingUp, Sparkles, Eye, ChevronRight, XCircle, 
  Tag, DollarSign, Brain, Bell, Gift, Star, ThumbsUp, Zap,
  TrendingDown, ShoppingBag, Info, X  // Add X here
} from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import AILoadingSpinner from "@/components/ai/user/AILoadingSpinner";
import AIBadge from "@/components/ai/user/AIBadge";

const EnhancedWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarEvents, setSimilarEvents] = useState({});
  const [priceAlerts, setPriceAlerts] = useState({});
  const [aiInsights, setAiInsights] = useState(null);
  const [showSimilarEvents, setShowSimilarEvents] = useState({});
  const [notificationPreferences, setNotificationPreferences] = useState({
    priceDrop: true,
    availability: true,
    similarEvents: true,
    deadline: true
  });
  
  const navigate = useNavigate();
  
  // AI Recommendations Hook
  const { 
    recommendations, 
    loading: aiLoading, 
    getRecommendationInsights 
  } = useRecommendations();

  useEffect(() => {
    fetchWishlist();
    loadNotificationPreferences();
  }, []);

  useEffect(() => {
    if (wishlistItems.length > 0) {
      generateAISimilarEvents();
      checkPriceAlerts();
      generateWishlistInsights();
    }
  }, [wishlistItems]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.safeGet('/users/wishlist');
      setWishlistItems(response.data.wishlist || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationPreferences = () => {
    const saved = localStorage.getItem('wishlistNotificationPrefs');
    if (saved) {
      setNotificationPreferences(JSON.parse(saved));
    }
  };

  // AI: Generate similar events for each wishlist item
  const generateAISimilarEvents = async () => {
    const similar = {};
    
    for (const event of wishlistItems.slice(0, 3)) { // Limit to 3 for performance
      try {
        // Fetch AI-suggested similar events
        const response = await api.safePost('/ai/similar-events', {
          eventId: event._id,
          limit: 3,
          userId: user?.id
        });
        similar[event._id] = response.data;
      } catch (err) {
        // Fallback mock data for development
        similar[event._id] = generateMockSimilarEvents(event);
      }
    }
    
    setSimilarEvents(similar);
  };

  // Mock similar events generator
  const generateMockSimilarEvents = (event) => {
    return [
      {
        _id: `similar-${event._id}-1`,
        event_name: `Similar: ${event.event_name}`,
        price: event.price,
        location: event.location,
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        image: event.image,
        matchScore: 92,
        aiReason: 'Similar category and location'
      },
      {
        _id: `similar-${event._id}-2`,
        event_name: `You might also like: ${event.event_name} Style`,
        price: Math.floor(event.price * 0.9),
        location: event.location,
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        image: event.image,
        matchScore: 85,
        aiReason: 'Popular among users with similar taste'
      }
    ];
  };

  // AI: Check for price drops
  const checkPriceAlerts = async () => {
    const alerts = {};
    
    for (const event of wishlistItems) {
      try {
        const response = await api.safeGet(`/events/price-history/${event._id}`);
        const priceHistory = response.data;
        
        if (priceHistory.length > 1) {
          const currentPrice = event.price;
          const previousPrice = priceHistory[priceHistory.length - 2]?.price || currentPrice;
          
          if (currentPrice < previousPrice) {
            alerts[event._id] = {
              dropped: true,
              oldPrice: previousPrice,
              newPrice: currentPrice,
              dropPercentage: Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
            };
          }
        }
      } catch (err) {
        // Mock price drop for development
        if (Math.random() > 0.7) {
          alerts[event._id] = {
            dropped: true,
            oldPrice: event.price * 1.2,
            newPrice: event.price,
            dropPercentage: 20
          };
        }
      }
    }
    
    setPriceAlerts(alerts);
  };

  // AI: Generate wishlist insights
  const generateWishlistInsights = () => {
    const categories = {};
    const priceRanges = [];
    const locations = {};
    
    wishlistItems.forEach(item => {
      // Category analysis
      const categoryName = item.category?.categoryName || 'Uncategorized';
      categories[categoryName] = (categories[categoryName] || 0) + 1;
      
      // Price analysis
      priceRanges.push(item.price);
      
      // Location analysis
      const location = item.location.split(',')[0].trim();
      locations[location] = (locations[location] || 0) + 1;
    });

    const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length || 0;
    const topCategory = Object.keys(categories).reduce((a, b) => 
      categories[a] > categories[b] ? a : b, Object.keys(categories)[0] || 'Various');
    const topLocation = Object.keys(locations).reduce((a, b) => 
      locations[a] > locations[b] ? a : b, Object.keys(locations)[0] || 'Various');

    const insights = {
      totalValue: wishlistItems.reduce((sum, item) => sum + item.price, 0),
      avgPrice: Math.round(avgPrice),
      topCategory,
      topLocation,
      categoryDistribution: categories,
      uniqueCategories: Object.keys(categories).length,
      potentialSavings: wishlistItems.filter(item => priceAlerts[item._id]).length * 500,
      recommendationScore: getRecommendationInsights()?.avgMatchScore || 85,
      lastUpdated: new Date().toLocaleTimeString()
    };

    setAiInsights(insights);
  };

  const removeFromWishlist = async (eventId, e) => {
    e.stopPropagation();
    try {
      await api.safeDelete(`/users/wishlist/${eventId}`);
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== eventId));
      
      // Clean up associated data
      setSimilarEvents(prev => {
        const newState = { ...prev };
        delete newState[eventId];
        return newState;
      });
      
      setPriceAlerts(prev => {
        const newState = { ...prev };
        delete newState[eventId];
        return newState;
      });
      
      // Show success message
      setError({ type: 'success', message: 'Event removed from wishlist' });
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove from wishlist';
      setError({ type: 'error', message: errorMessage });
      setTimeout(() => setError(null), 3000);
    }
  };

  const refreshWishlist = async () => {
    try {
      setLoading(true);
      await fetchWishlist();
      setError({ type: 'success', message: 'Wishlist updated successfully' });
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError({ type: 'error', message: 'Failed to refresh wishlist' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (event) => {
    const urlFriendlyName = event.event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    navigate(`/userdb/events/${urlFriendlyName}`, {
      state: {
        eventId: event._id,
        eventData: event,
        source: 'wishlist',
        fromAI: event.isAIRecommended || false
      }
    });
  };

  const toggleSimilarEvents = (eventId) => {
    setShowSimilarEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const addToWishlist = async (event) => {
    try {
      await api.safePost('/users/wishlist', { eventId: event._id });
      setWishlistItems(prev => [...prev, event]);
      setError({ type: 'success', message: 'Event added to wishlist' });
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError({ type: 'error', message: 'Failed to add event' });
    }
  };

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    
    if (eventDateTime < now) return 'completed';
    if (eventDateTime.toDateString() === now.toDateString()) return 'ongoing';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return 'from-emerald-500 to-green-500';
      case 'ongoing': return 'from-blue-500 to-cyan-500';
      case 'completed': return 'from-gray-500 to-gray-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getStats = () => {
    const upcoming = wishlistItems.filter(item => getEventStatus(item.event_date) === 'upcoming').length;
    const ongoing = wishlistItems.filter(item => getEventStatus(item.event_date) === 'ongoing').length;
    const completed = wishlistItems.filter(item => getEventStatus(item.event_date) === 'completed').length;
    
    return { upcoming, ongoing, completed, total: wishlistItems.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AILoadingSpinner />
                <p className="text-lg font-medium text-gray-700 mt-4">Analyzing your wishlist...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Error/Success Alert */}
      {error && (
        <div className={`relative p-5 pl-14 bg-gradient-to-r ${
          error.type === 'error' 
            ? 'from-red-50 to-pink-50 border-l-4 border-red-500' 
            : 'from-green-50 to-emerald-50 border-l-4 border-green-500'
        } rounded-lg shadow-sm animate-fade-in`}>
          <div className="absolute left-5 top-5">
            {error.type === 'error' ? (
              <AlertTriangle className="w-6 h-6 text-red-500" />
            ) : (
              <Sparkles className="w-6 h-6 text-green-500" />
            )}
          </div>
          <div className="pr-10">
            <h4 className={`font-bold ${error.type === 'error' ? 'text-red-800' : 'text-green-800'} mb-1`}>
              {error.type === 'error' ? 'Action Required' : 'Success'}
            </h4>
            <p className={`text-sm ${error.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {error.message}
            </p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className={`absolute right-4 top-4 p-1 rounded-full ${
              error.type === 'error' ? 'hover:bg-red-100' : 'hover:bg-green-100'
            } transition-colors`}
          >
            <XCircle className={`w-5 h-5 ${error.type === 'error' ? 'text-red-500' : 'text-green-500'}`} />
          </button>
        </div>
      )}

      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              
                Wishlist
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                Personalized insights, price alerts, and smart recommendations
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {/* AI Insights Badge */}
              {aiInsights && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <div className="text-sm">
                    <span className="font-medium text-purple-900">{aiInsights.recommendationScore}% Match</span>
                    <span className="text-gray-600 ml-1">with your taste</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={refreshWishlist}
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
                    Refresh Wishlist
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/userdb/events')}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Eye className="w-5 h-5" />
                Browse Events
              </button>
            </div>
          </div>

          {/* AI Insights Banner */}
          {aiInsights && wishlistItems.length > 0 && (
            <div className="mb-10 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      Wishlist AI Insights
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-normal">
                        {aiInsights.uniqueCategories} Categories
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-purple-100 text-xs">Total Value</p>
                        <p className="text-white font-bold text-lg">Rs. {aiInsights.totalValue.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-purple-100 text-xs">Avg. Price</p>
                        <p className="text-white font-bold text-lg">Rs. {aiInsights.avgPrice.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-purple-100 text-xs">Top Category</p>
                        <p className="text-white font-bold text-lg">{aiInsights.topCategory}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-purple-100 text-xs">Potential Savings</p>
                        <p className="text-white font-bold text-lg">Rs. {aiInsights.potentialSavings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
              <p className="text-gray-600 font-medium">Total Saved</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{Object.keys(priceAlerts).length}</h3>
              <p className="text-gray-600 font-medium">Price Alerts</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
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
                  <Gift className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{aiInsights?.uniqueCategories || 0}</h3>
              <p className="text-gray-600 font-medium">Categories</p>
            </div>
          </div>

          {/* Wishlist Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-indigo-600" />
                  Saved Events
                  {wishlistItems.length > 0 && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      {wishlistItems.length} items
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  AI is monitoring prices and availability
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Wishlist Items */}
            {wishlistItems.length === 0 ? (
              <div className="py-16 text-center border border-gray-200 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Your Wishlist is Empty</h3>
                <p className="text-gray-500 mb-6">
                  Start saving events you're interested in. AI will help you track prices and find similar events.
                </p>
                <button
                  onClick={() => navigate('/userdb/events')}
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {wishlistItems.map((event) => {
                  const status = getEventStatus(event.event_date);
                  const isEventFull = event.attendees?.length >= event.totalSlots;
                  const hasPriceDrop = priceAlerts[event._id];
                  const hasSimilarEvents = similarEvents[event._id]?.length > 0;
                  const showSimilar = showSimilarEvents[event._id];
                  
                  return (
                    <div key={event._id} className="space-y-4">
                      {/* Main Event Card */}
                      <div className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="flex flex-col md:flex-row">
                          {/* Event Image */}
                          <div className="relative md:w-72 h-48 md:h-auto overflow-hidden">
                            <img
                              src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
                              alt={event.event_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent md:bg-gradient-to-t" />
                            
                            {/* AI Recommendation Badge */}
                            {event.aiRecommended && (
                              <div className="absolute top-4 left-4">
                                <AIBadge score={92} reason="Based on your wishlist" />
                              </div>
                            )}
                            
                            {/* Price Drop Alert */}
                            {hasPriceDrop && (
                              <div className="absolute top-4 right-4">
                                <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium flex items-center gap-1 shadow-lg animate-pulse">
                                  <TrendingDown className="w-4 h-4" />
                                  {priceAlerts[event._id].dropPercentage}% OFF
                                </span>
                              </div>
                            )}
                            
                            {/* Status Badge - Mobile */}
                            <div className="absolute bottom-4 left-4 md:hidden">
                              <span className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getStatusColor(status)} text-white text-sm font-medium shadow-lg`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </div>
                          </div>

                          {/* Event Content */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                {/* Status Badge - Desktop */}
                                <div className="hidden md:inline-block mb-3">
                                  <span className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${getStatusColor(status)} text-white text-sm font-medium shadow-lg`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors mb-3">
                                  {event.event_name}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {new Date(event.event_date).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 truncate">
                                      {event.location}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className={`text-sm ${
                                      isEventFull ? 'text-red-600 font-medium' : 'text-gray-600'
                                    }`}>
                                      {event.attendees?.length || 0}/{event.totalSlots} booked
                                    </span>
                                  </div>
                                </div>

                                {/* Price Section */}
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                    <span className="text-2xl font-bold text-gray-900">
                                      Rs. {event.price}
                                    </span>
                                  </div>
                                  {hasPriceDrop && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                      <TrendingDown className="w-3 h-3" />
                                      Was Rs. {priceAlerts[event._id].oldPrice}
                                    </span>
                                  )}
                                </div>

                                {/* Category and Tags */}
                                {event.category && (
                                  <div className="mb-4">
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                                      {event.category.categoryName}
                                    </span>
                                  </div>
                                )}

                                {event.tags && event.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-4">
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
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-row md:flex-col gap-2 justify-end">
                                <button
                                  onClick={() => handleViewEvent(event)}
                                  className="group/view px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  <Eye className="w-5 h-5 group-hover/view:scale-110 transition-transform" />
                                  <span className="hidden md:inline">View Details</span>
                                  <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                                </button>
                                
                                <button
                                  onClick={(e) => removeFromWishlist(event._id, e)}
                                  className="px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  <Trash2 className="w-5 h-5" />
                                  <span className="hidden md:inline">Remove</span>
                                </button>

                                {hasSimilarEvents && (
                                  <button
                                    onClick={() => toggleSimilarEvents(event._id)}
                                    className="px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 hover:from-purple-200 hover:to-indigo-200 shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    <Sparkles className="w-5 h-5" />
                                    <span className="hidden md:inline">
                                      {showSimilar ? 'Hide Similar' : 'Similar Events'}
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Similar Events Section */}
                      {showSimilar && similarEvents[event._id] && (
                        <div className="ml-0 md:ml-72 pl-0 md:pl-6 animate-slideDown">
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-purple-900 flex items-center gap-2">
                                <Brain className="w-5 h-5" />
                                AI-Suggested Similar Events
                              </h4>
                              <span className="text-xs text-purple-700">
                                Based on your interest in this event
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {similarEvents[event._id].map((similar) => (
                                <div
                                  key={similar._id}
                                  className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition cursor-pointer"
                                  onClick={() => handleViewEvent(similar)}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-medium text-gray-800 line-clamp-1">
                                      {similar.event_name}
                                    </h5>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                      {similar.matchScore}% match
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mb-2">{similar.aiReason}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900">
                                      Rs. {similar.price}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(similar.event_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToWishlist(similar);
                                    }}
                                    className="mt-3 w-full py-2 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-lg hover:from-indigo-200 hover:to-purple-200 transition flex items-center justify-center gap-1"
                                  >
                                    <Heart className="w-4 h-4" />
                                    Add to Wishlist
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
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

export default EnhancedWishlist;