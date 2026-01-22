import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Calendar, MapPin, DollarSign, Users, AlertTriangle, Sparkles, TrendingUp, RefreshCw, Clock, Target, Activity, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../utils/api';
import { getToken } from '../../../utils/auth';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

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
            
        if (!userData || !userData._id) {
          throw new Error("Unable to verify user credentials");
        }

        const eventsResponse = await api.get(`/events/user/${userData._id}`);
        setEvents(eventsResponse.data);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'from-emerald-500 to-green-500';
      case 'ongoing':
        return 'from-blue-500 to-cyan-500';
      case 'completed':
        return 'from-gray-500 to-gray-700';
      case 'cancelled':
        return 'from-rose-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
              <p className="text-gray-600">Fetching your event data</p>
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

  const upcomingEvents = events.filter(e => new Date(e.event_date) > new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) <= new Date());
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0);
  const totalRevenue = events.reduce((sum, event) => 
    sum + (event.price * (event.attendees?.length || 0)), 0);

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">My Events</h1>
            </div>
            <p className="text-gray-600 text-lg">Manage and monitor all your events in one place</p>
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
              onClick={() => window.location.href = '/orgdb/create-event'}
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

      {/* Events Grid */}
      <div className="space-y-6">
        {events.length > 0 ? (
          <>
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Upcoming Events ({upcomingEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event._id} event={event} onDelete={handleDeleteEvent} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                  Past Events ({pastEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <EventCard key={event._id} event={event} onDelete={handleDeleteEvent} isPast={true} />
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
              You haven't created any events yet. Start your journey by creating your first event!
            </p>
            <button
              onClick={() => window.location.href = '/orgdb/create-event'}
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

const EventCard = ({ event, onDelete, isPast = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${event.status === 'upcoming' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-gray-500 to-gray-700'} text-white`}>
          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </span>
      </div>

      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
          alt={event.event_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-700 transition-colors duration-300 line-clamp-1">
          {event.event_name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-purple-500" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Rs. {event.price}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-orange-500" />
            <span>
              {event.attendees?.length || 0} / {event.totalSlots} attendees
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${((event.attendees?.length || 0) / event.totalSlots) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button 
            onClick={() => window.location.href = `/event/${event._id}`}
            className="group/view px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-sm hover:shadow transition-all duration-300"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.location.href = `/event/edit/${event._id}`}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-300 hover:scale-110"
              title="Edit Event"
            >
              <Edit className="w-5 h-5" />
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

export default MyEvents;