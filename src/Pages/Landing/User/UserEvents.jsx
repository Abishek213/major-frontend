import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Search, TrendingUp, Sparkles, Filter, Tag, AlertTriangle, RefreshCw, ChevronRight, DollarSign, Clock, Eye } from 'lucide-react';
import api from '../../../utils/api';

const UserEvents = ({ user }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState('all');
  const [selectedChildCategory, setSelectedChildCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

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
          status: determineEventStatus(event.event_date)
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
  }, [selectedParentCategory, selectedChildCategory]);

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
    
    setFilteredEvents(filtered);
  }, [searchTerm, events, activeTab]);

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
        status: determineEventStatus(event.event_date)
      }));
      setEvents(processedEvents);
      setFilteredEvents(processedEvents);
      setError(null);
    } catch (err) {
      setError('Failed to refresh events');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event) => {
    const urlFriendlyName = event.event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    navigate(`/userdb/events/${urlFriendlyName}`, {
      state: {
        eventId: event._id,
        eventData: event,
        source: 'events' 
      }
    });
  };

  const getStats = () => {
    const upcoming = events.filter(e => e.status === 'upcoming').length;
    const ongoing = events.filter(e => e.status === 'ongoing').length;
    const completed = events.filter(e => e.status === 'completed').length;
    
    return { upcoming, ongoing, completed, total: events.length };
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
                <p className="text-lg font-medium text-gray-700">Loading events...</p>
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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                Events Dashboard
              </h1>
              <p className="text-gray-600">
                Discover and explore amazing events around you
              </p>
            </div>
            
            <button 
              onClick={refreshEvents}
              disabled={loading}
              className={`mt-4 md:mt-0 px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
              <p className="text-gray-600 font-medium">Total Events</p>
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
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-300" />
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

          {/* Filters Section */}
          <div className="space-y-6 mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" />
                  Discover Events
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredEvents.length} events found
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Status Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  {['all', 'upcoming', 'ongoing', 'completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
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

              {/* Categories Navigation */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  Categories
                </h3>
                
                {/* Parent Categories */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedParentCategory('all');
                      setSelectedChildCategory('all');
                    }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      selectedParentCategory === 'all'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleParentCategoryChange(category._id)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        selectedParentCategory === category._id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      {category.categoryName}
                    </button>
                  ))}
                </div>

                {/* Child Categories */}
                {selectedParentCategory !== 'all' && categories.find(cat => cat._id === selectedParentCategory)?.children?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-4">
                    <button
                      onClick={() => setSelectedChildCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedChildCategory === 'all'
                          ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      All {categories.find(cat => cat._id === selectedParentCategory)?.categoryName} Events
                    </button>
                    {categories
                      .find(cat => cat._id === selectedParentCategory)
                      ?.children.map((child) => (
                        <button
                          key={child._id}
                          onClick={() => setSelectedChildCategory(child._id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                            selectedChildCategory === child._id
                              ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                          }`}
                        >
                          {child.categoryName}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="space-y-6">
            {filteredEvents.length === 0 ? (
              <div className="py-16 text-center border border-gray-200 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
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
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            status === 'upcoming' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                            status === 'ongoing' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            'bg-gradient-to-r from-gray-500 to-gray-700'
                          } text-white shadow-lg`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white font-medium shadow-lg">
                            Rs. {event.price}
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
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {event.attendees?.length || 0}/{event.totalSlots}
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