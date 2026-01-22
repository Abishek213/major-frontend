import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Calendar, MapPin, Clock, Trash2, Users, AlertTriangle, RefreshCw, TrendingUp, Sparkles, Eye, ChevronRight, XCircle, Tag, DollarSign
} from 'lucide-react';
import api from '../../../utils/api';

const EnhancedWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

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

  const removeFromWishlist = async (eventId, e) => {
    e.stopPropagation();
    try {
      await api.safeDelete(`/users/wishlist/${eventId}`);
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== eventId));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to remove from wishlist';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const refreshWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.safeGet('/users/wishlist');
      setWishlistItems(response.data.wishlist || []);
      setError(null);
    } catch (err) {
      setError('Failed to refresh wishlist');
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
        source: 'wishlist' 
      }
    });
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
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Loading your wishlist...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !wishlistItems.length) {
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
      {/* Error Alert */}
      {error && (
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Action Required</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-red-100 transition-colors"
          >
            <XCircle className="w-5 h-5 text-red-500" />
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                Wishlist Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your saved events and never miss out on exciting experiences
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
              <p className="text-gray-600 font-medium">Total Saved</p>
              <div className="mt-3 h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.upcoming}</h3>
              <p className="text-gray-600 font-medium">Upcoming Events</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.upcoming / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.ongoing}</h3>
              <p className="text-gray-600 font-medium">Ongoing Events</p>
              <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.ongoing / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.completed}</h3>
              <p className="text-gray-600 font-medium">Past Events</p>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gray-500 to-gray-700 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Wishlist Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-indigo-600" />
                  Saved Events
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {wishlistItems.length} events in your wishlist
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  Browse events and add them to your wishlist to keep track of events you're interested in.
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((event) => {
                  const status = getEventStatus(event.event_date);
                  const isEventFull = event.attendees?.length >= event.totalSlots;
                  
                  return (
                    <div 
                      key={event._id} 
                      className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
                          alt={event.event_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {/* Remove Button */}
                        <button
                          onClick={(e) => removeFromWishlist(event._id, e)}
                          className="absolute top-4 right-4 p-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(status)} text-white shadow-lg`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        
                        {/* Price Badge */}
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white font-medium shadow-lg flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Rs. {event.price}
                          </span>
                        </div>
                        
                        {/* Capacity Badge */}
                        <div className="absolute bottom-4 right-4">
                          <span className={`px-3 py-1.5 rounded-lg backdrop-blur-sm font-medium shadow-lg flex items-center gap-1 ${
                            isEventFull
                              ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-100'
                              : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-100'
                          }`}>
                            <Users className="w-4 h-4" />
                            {event.attendees?.length || 0}/{event.totalSlots}
                          </span>
                        </div>
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
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(event.event_date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors text-lg mb-3 line-clamp-2">
                          {event.event_name}
                        </h3>

                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 line-clamp-1">
                            {event.location}
                          </span>
                        </div>

                        {/* Category Badge */}
                        {event.category && (
                          <div className="mb-4">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                              {event.category.categoryName}
                            </span>
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

                        {/* View Details Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEvent(event);
                          }}
                          className="group/view w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <Eye className="w-5 h-5 group-hover/view:scale-110 transition-transform" />
                          View Event Details
                          <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                        </button>

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

export default EnhancedWishlist;