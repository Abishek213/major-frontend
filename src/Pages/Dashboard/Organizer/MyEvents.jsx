import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Edit, Trash2, Calendar, MapPin, DollarSign, Users, 
  AlertTriangle, Sparkles, TrendingUp, RefreshCw, Clock, Target, 
  Activity, ChevronRight, Bot, Award, Zap, BarChart3, Star,
  ThumbsUp, ThumbsDown, MessageCircle, Share2, Download, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../utils/api';
import { getToken } from '../../../utils/auth';
import AIBadge from '../../../components/ai/user/AIBadge';
import { useOrganizerAI } from '../../../hooks/useOrganizerAI';

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAIAnalytics, setShowAIAnalytics] = useState(false);
  const [eventInsights, setEventInsights] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const { 
    getEventPerformance, 
    getSentimentAnalysis,
    loading: aiLoading 
  } = useOrganizerAI(userData?._id);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (!decodedToken.user?.email) {
          throw new Error("Unable to verify user email");
        }

        const userResponse = await api.get(`/users/email/${decodedToken.user.email}`);
        const userData = userResponse.data.user;
        setUserData(userData);
            
        if (!userData || !userData._id) {
          throw new Error("Unable to verify user credentials");
        }

        const eventsResponse = await api.get(`/events/user/${userData._id}`);
        setEvents(eventsResponse.data);
        
        generateEventInsights(eventsResponse.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        let errorMessage = "Failed to fetch events";
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [refreshCount]);

  const generateEventInsights = (eventsData) => {
    const insights = {};
    
    eventsData.forEach(event => {
      const eventInsight = [];
      const attendees = event.attendees?.length || 0;
      const fillRate = (attendees / event.totalSlots) * 100;
      const daysUntilEvent = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (fillRate >= 80) {
        eventInsight.push({
          type: 'success',
          icon: <Award className="w-4 h-4" />,
          message: '🔥 High demand! Almost sold out!',
          action: 'Consider adding more slots'
        });
      } else if (fillRate <= 30 && daysUntilEvent < 7) {
        eventInsight.push({
          type: 'warning',
          icon: <AlertTriangle className="w-4 h-4" />,
          message: '⚠️ Low attendance risk',
          action: 'Boost promotion now'
        });
      } else if (fillRate <= 50 && daysUntilEvent < 14) {
        eventInsight.push({
          type: 'info',
          icon: <Target className="w-4 h-4" />,
          message: '📊 Room for growth',
          action: 'Run targeted ads'
        });
      }

      if (daysUntilEvent < 0) {
        eventInsight.push({
          type: 'info',
          icon: <Clock className="w-4 h-4" />,
          message: '✅ Event completed',
          action: 'View feedback'
        });
      } else if (daysUntilEvent === 0) {
        eventInsight.push({
          type: 'success',
          icon: <Sparkles className="w-4 h-4" />,
          message: '🎉 Event happening today!',
          action: 'Check-in attendees'
        });
      } else if (daysUntilEvent < 3) {
        eventInsight.push({
          type: 'warning',
          icon: <Clock className="w-4 h-4" />,
          message: `⏰ Only ${daysUntilEvent} days left!`,
          action: 'Send reminders'
        });
      }

      const revenue = event.price * attendees;
      if (revenue > 5000) {
        eventInsight.push({
          type: 'success',
          icon: <DollarSign className="w-4 h-4" />,
          message: `💰 Revenue: $${revenue.toLocaleString()}`,
          action: 'View breakdown'
        });
      }

      if (event.averageRating) {
        if (event.averageRating >= 4.5) {
          eventInsight.push({
            type: 'success',
            icon: <Star className="w-4 h-4 fill-current" />,
            message: `⭐ ${event.averageRating} stars - Excellent!`,
            action: 'See reviews'
          });
        } else if (event.averageRating <= 2.5) {
          eventInsight.push({
            type: 'warning',
            icon: <ThumbsDown className="w-4 h-4" />,
            message: `📉 Low rating (${event.averageRating} stars)`,
            action: 'Address issues'
          });
        }
      }

      insights[event._id] = eventInsight;
    });

    setEventInsights(insights);
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/events/delete/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
    } catch (err) {
      setError("Failed to delete event");
      console.error(err);
    }
  };

  const handleViewAIAnalytics = (event) => {
    setSelectedEvent(event);
    setShowAIAnalytics(true);
  };

  const handleEditEvent = (eventId) => {
    navigate(`/orgdb/edit-event/${eventId}`);
  };

  const handleViewEvent = (eventId) => {
    window.open(`/event/${eventId}`, '_blank');
  };

  const getFilteredAndSortedEvents = () => {
    let filtered = [...events];
    
    if (filterType === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.event_date) > new Date());
    } else if (filterType === 'past') {
      filtered = filtered.filter(e => new Date(e.event_date) <= new Date());
    }
    
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date':
          return new Date(a.event_date) - new Date(b.event_date);
        case 'attendees':
          return (b.attendees?.length || 0) - (a.attendees?.length || 0);
        case 'revenue':
          return (b.price * (b.attendees?.length || 0)) - (a.price * (a.attendees?.length || 0));
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: "from-blue-500 via-blue-600 to-indigo-600",
      green: "from-emerald-500 via-emerald-600 to-green-600", 
      purple: "from-purple-500 via-purple-600 to-violet-600",
      orange: "from-amber-500 via-orange-600 to-yellow-600"
    };

    return (
      <div className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br ${colorClasses[color]} p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white opacity-20 blur-xl"></div>
          <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white opacity-10 blur-xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white/90 tracking-wide">{title}</h3>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Events...</h3>
              <p className="text-gray-600">Fetching your event data with AI insights</p>
              <div className="mt-6 h-2 w-64 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="relative p-6 pl-16 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-2xl shadow-lg animate-fade-in">
          <div className="absolute left-6 top-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="pr-6">
            <h4 className="text-xl font-bold text-red-800 mb-3">Error Loading Events</h4>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="group px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredEvents = getFilteredAndSortedEvents();
  const upcomingEvents = events.filter(e => new Date(e.event_date) > new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) <= new Date());
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
  const totalRevenue = events.reduce((sum, event) => 
    sum + (event.price * (event.attendees?.length || 0)), 0);

  const highDemandEvents = upcomingEvents.filter(e => 
    ((e.attendees?.length || 0) / e.totalSlots) * 100 >= 80
  ).length;
  
  const lowAttendanceEvents = upcomingEvents.filter(e => 
    ((e.attendees?.length || 0) / e.totalSlots) * 100 <= 30 &&
    Math.ceil((new Date(e.event_date) - new Date()) / (1000 * 60 * 60 * 24)) < 7
  ).length;

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* AI Analytics Modal */}
      {showAIAnalytics && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Bot className="w-6 h-6" />
                <h2 className="text-xl font-bold">AI Event Analytics</h2>
              </div>
              <button
                onClick={() => {
                  setShowAIAnalytics(false);
                  setSelectedEvent(null);
                }}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <EventAIAnalytics event={selectedEvent} />
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">My Events</h1>
              <AIBadge type="organizer" agent="dashboard" />
            </div>
            <p className="text-gray-600 text-lg">Manage and monitor all your events with AI-powered insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="group px-5 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/orgdb/create-event')}
              className="group px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              Create Event
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={events.length}
          icon={Calendar}
          color="blue"
        />

        <StatCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          icon={Target}
          color="green"
        />

        <StatCard
          title="Total Attendees"
          value={totalAttendees.toLocaleString()}
          icon={Users}
          color="purple"
        />

        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* AI Insights Summary */}
      {(highDemandEvents > 0 || lowAttendanceEvents > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highDemandEvents > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">High Demand Events</h3>
                  <p className="text-sm text-green-700">
                    You have {highDemandEvents} event{highDemandEvents > 1 ? 's' : ''} with over 80% attendance. 
                    Consider adding more slots!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {lowAttendanceEvents > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800">Attention Needed</h3>
                  <p className="text-sm text-yellow-700">
                    {lowAttendanceEvents} event{lowAttendanceEvents > 1 ? 's are' : ' is'} at risk of low attendance. 
                    Boost promotion now!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'upcoming' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilterType('past')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'past' 
                  ? 'bg-gray-200 text-gray-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="attendees">Attendees</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        {filteredEvents.length > 0 ? (
          <>
            {/* Upcoming Events */}
            {filteredEvents.some(e => new Date(e.event_date) > new Date()) && filterType !== 'past' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Upcoming Events ({filteredEvents.filter(e => new Date(e.event_date) > new Date()).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents
                    .filter(e => new Date(e.event_date) > new Date())
                    .map((event) => (
                      <EventCard 
                        key={event._id} 
                        event={event} 
                        onDelete={handleDeleteEvent}
                        onViewAI={handleViewAIAnalytics}
                        onEdit={handleEditEvent}
                        onView={handleViewEvent}
                        insights={eventInsights[event._id] || []}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {filteredEvents.some(e => new Date(e.event_date) <= new Date()) && filterType !== 'upcoming' && (
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                  Past Events ({filteredEvents.filter(e => new Date(e.event_date) <= new Date()).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents
                    .filter(e => new Date(e.event_date) <= new Date())
                    .map((event) => (
                      <EventCard 
                        key={event._id} 
                        event={event} 
                        onDelete={handleDeleteEvent}
                        onViewAI={handleViewAIAnalytics}
                        onEdit={handleEditEvent}
                        onView={handleViewEvent}
                        insights={eventInsights[event._id] || []}
                        isPast={true}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Events Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filterType !== 'all' 
                ? `No ${filterType} events match your criteria.` 
                : "You haven't created any events yet. Start your journey by creating your first event!"}
            </p>
            <button
              onClick={() => navigate('/orgdb/create-event')}
              className="group px-8 py-4 rounded-xl font-bold flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 mx-auto"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              Create Your First Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, onDelete, onViewAI, onEdit, onView, insights = [], isPast = false }) => {
  const [showInsights, setShowInsights] = useState(false);

  const fillRate = ((event.attendees?.length || 0) / event.totalSlots) * 100;
  const daysUntilEvent = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));
  const revenue = event.price * (event.attendees?.length || 0);

  // Get the correct image URL
  const getImageUrl = () => {
    if (!event.image) return "/default-event.jpg";
    
    // If it's already a full URL
    if (event.image.startsWith('http')) return event.image;
    
    // If it's a relative path from uploads
    if (event.image.includes('/uploads/')) {
      const filename = event.image.split('/').pop();
      return `/uploads/events/${filename}`;
    }
    
    // If it's just a filename
    return `/uploads/events/${event.image}`;
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
          event.status === 'upcoming' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 
          event.status === 'ongoing' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
          event.status === 'completed' ? 'bg-gradient-to-r from-gray-500 to-gray-700' :
          'bg-gradient-to-r from-rose-500 to-pink-500'
        } text-white`}>
          {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Draft'}
        </span>
        
        {/* AI Insight Badge */}
        {insights.length > 0 && (
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="p-1 rounded-full bg-purple-500 text-white shadow-lg hover:bg-purple-600 transition-colors"
            title="AI Insights"
          >
            <Bot className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={event.event_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-event.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Fill Rate Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-between text-white mb-1">
            <span className="text-xs font-medium">Fill Rate</span>
            <span className="text-xs font-bold">{Math.round(fillRate)}%</span>
          </div>
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                fillRate >= 80 ? 'bg-green-400' :
                fillRate >= 50 ? 'bg-yellow-400' :
                'bg-red-400'
              }`}
              style={{ width: `${fillRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-700 transition-colors duration-300 line-clamp-1">
          {event.event_name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* AI Insights Dropdown */}
        {showInsights && insights.length > 0 && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-800">AI Insights</span>
            </div>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <span className={`
                    ${insight.type === 'success' ? 'text-green-600' : 
                      insight.type === 'warning' ? 'text-yellow-600' : 
                      'text-blue-600'}
                  `}>
                    {insight.icon}
                  </span>
                  <div>
                    <p className="text-gray-700">{insight.message}</p>
                    {insight.action && (
                      <button className="text-purple-600 hover:text-purple-800 font-medium mt-1">
                        {insight.action} →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
            {!isPast && daysUntilEvent >= 0 && (
              <span className="ml-auto text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {daysUntilEvent === 0 ? 'Today' : `${daysUntilEvent} days left`}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-purple-500" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Rs. {event.price}</span>
            <span className="ml-auto text-xs font-medium text-emerald-600">
              Revenue: Rs. {revenue.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-orange-500" />
            <span>
              {event.attendees?.length || 0} / {event.totalSlots} attendees
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onViewAI(event)}
              className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors duration-300 hover:scale-110"
              title="AI Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            
            
            
            {event.status === 'upcoming' && (
              <button 
                onClick={() => onDelete(event._id)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-300 hover:scale-110"
                title="Delete Event"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventAIAnalytics = ({ event }) => {
  const attendees = event.attendees?.length || 0;
  const fillRate = (attendees / event.totalSlots) * 100;
  const revenue = event.price * attendees;
  const daysUntilEvent = Math.ceil((new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24));

  const recommendations = [];

  if (fillRate < 50 && daysUntilEvent > 7) {
    recommendations.push({
      title: 'Increase Visibility',
      description: 'Consider running targeted social media ads and email campaigns to boost attendance.',
      action: 'Run Campaign'
    });
  }

  if (fillRate > 80) {
    recommendations.push({
      title: 'Expand Capacity',
      description: 'High demand detected! Consider adding more slots or organizing a second session.',
      action: 'Adjust Slots'
    });
  }

  if (daysUntilEvent < 3 && fillRate < 60) {
    recommendations.push({
      title: 'Last Minute Push',
      description: 'Offer limited-time discounts or bundle deals to attract last-minute attendees.',
      action: 'Create Offer'
    });
  }

  if (event.averageRating && event.averageRating < 3) {
    recommendations.push({
      title: 'Improve Experience',
      description: 'Low ratings detected. Review feedback and address common issues.',
      action: 'View Feedback'
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
          <p className="text-xs text-blue-600 mb-1">Performance Score</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-blue-700">
              {Math.round(fillRate)}%
            </span>
            <span className="text-xs text-blue-500 mb-1">fill rate</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
          <p className="text-xs text-green-600 mb-1">Revenue</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-green-700">
              Rs. {revenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <h4 className="font-medium text-amber-800 mb-1">{rec.title}</h4>
                <p className="text-sm text-amber-700 mb-3">{rec.description}</p>
                <button className="text-sm font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1">
                  {rec.action}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-purple-500" />
          Sentiment Analysis
        </h3>
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <ThumbsUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600">78%</span>
              </div>
              <div className="text-center">
                <ThumbsDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600">12%</span>
              </div>
              <div className="text-center">
                <Minus className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600">10%</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Most attendees praised the organization and content quality. 
            Some mentioned parking issues.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Download Full Report
        </button>
      </div>
    </div>
  );
};

const Minus = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default MyEvents;