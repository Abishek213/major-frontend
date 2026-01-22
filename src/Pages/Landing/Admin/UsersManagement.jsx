import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import websocketManager from '@/utils/websocketManager';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Filter, 
  Eye,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
  UserCircle,
  TrendingUp,
  Shield,
  Award,
  BarChart3,
  Download,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Star,
  Clock3,
  CheckSquare,
  XSquare,
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';

const EventsManagement = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    thisMonth: 0,
    highPriority: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'event_date', direction: 'asc' });
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.get("/admin/pending-events", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response?.data?.data)) {
        const events = response.data.data;
        setPendingEvents(events);
        
        // Calculate comprehensive stats
        const now = new Date();
        const thisMonth = events.filter(e => {
          const eventDate = new Date(e.event_date);
          return eventDate.getMonth() === now.getMonth() && 
                 eventDate.getFullYear() === now.getFullYear();
        }).length;

        const highPriority = events.filter(e => 
          e.priority === 'high' || 
          new Date(e.event_date) < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        ).length;

        setStats({
          total: events.length,
          approved: events.filter(e => e.status === 'approved').length,
          rejected: events.filter(e => e.status === 'rejected').length,
          thisMonth,
          highPriority
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 403) {
        setError("You don't have permission to access this resource. Please ensure you have admin privileges.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again");
        setTimeout(() => navigate('/loginsignup'), 2000);
      } else {
        setError(err.message || "Failed to load events. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAction = async (eventId, action) => {
    setActionLoading(eventId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const notificationData = {
        eventId,
        status: action === 'approve' ? 'approved' : 'rejected',
        message: `Your event has been ${action === 'approve' ? 'approved' : 'rejected'}`,
        type: 'event_response'
      };
      const eventResponse = await api.post(`/admin/approve-event/${eventId}`, {
        status: action === 'approve' ? 'approved' : 'rejected'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
   
      if (eventResponse?.data?.success) {
        let persistentNotificationResponse;
        try {
          persistentNotificationResponse = await api.post(`/notifications/events/${eventId}/approve`, notificationData);
        } catch (notificationError) {
          console.warn('Failed to create persistent notification:', notificationError);
        }
   
        if (
          (!persistentNotificationResponse ||
           persistentNotificationResponse.status === 200 ||
           persistentNotificationResponse.status === 201) &&
          websocketManager?.isConnected()
        ) {
          try {
            websocketManager.send('event_response', {
              ...notificationData,
              notificationId: persistentNotificationResponse?.data?.notificationId || Date.now()
            });
          } catch (wsError) {
            console.warn('WebSocket notification failed:', wsError);
          }
        }
        setPendingEvents(prev => prev.filter(event => event._id !== eventId));
        setError(null);
        fetchEvents(); // Refresh stats
        
        // Close modal if the event in modal was just processed
        if (showEventModal && selectedEvent?._id === eventId) {
          setShowEventModal(false);
          setSelectedEvent(null);
        }
      } else {
        throw new Error('Failed to update event status');
      }
      return eventResponse;
    } catch (err) {
      console.error('Action error:', err);
      if (err.response?.status === 403) {
        setError("You don't have permission to perform this action");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again");
        setTimeout(() => navigate('/loginsignup'), 2000);
      } else {
        setError(`Failed to ${action} event: ${err.response?.data?.message || err.message}`);
      }
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  // Updated viewEventDetails function - opens a modal instead of navigating
  const viewEventDetails = (eventId) => {
    const event = pendingEvents.find(e => e._id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  };

  // Alternative: If you want to navigate to a separate page, use this function
  const navigateToEventPage = (eventId) => {
    // Make sure the route exists in your router
    navigate(`/admin/events/${eventId}`);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilEvent = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (event) => {
    const daysUntil = getDaysUntilEvent(event.event_date);
    if (daysUntil <= 2) return 'from-red-500 to-pink-500';
    if (daysUntil <= 7) return 'from-orange-500 to-amber-500';
    return 'from-blue-500 to-cyan-500';
  };

  const filteredEvents = pendingEvents.filter(event => 
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortConfig.key === 'event_date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.event_date) - new Date(b.event_date)
        : new Date(b.event_date) - new Date(a.event_date);
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleExpandEvent = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const downloadReport = () => {
    const csvContent = [
      ['Event Name', 'Organizer', 'Date', 'Time', 'Location', 'Category', 'Status'],
      ...pendingEvents.map(event => [
        event.event_name,
        event.organizer?.name || 'Unknown',
        formatDate(event.event_date),
        formatTime(event.event_date),
        event.location,
        event.category?.categoryName || 'Uncategorized',
        event.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Event Detail Modal Component
  const EventDetailModal = () => {
    if (!selectedEvent) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPriorityColor(selectedEvent)} flex items-center justify-center`}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedEvent.event_name}</h2>
                <p className="text-gray-600">Submitted by: {selectedEvent.organizer?.name || 'Unknown'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowEventModal(false);
                setSelectedEvent(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Event Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Category</label>
                      <p className="font-medium">{selectedEvent.category?.categoryName || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Description</label>
                      <p className="text-gray-700">{selectedEvent.description || 'No description provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Attendance
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Expected Attendance</label>
                      <p className="font-medium">{selectedEvent.expected_attendance || 'Not specified'} people</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Current Registrations</label>
                      <p className="font-medium">{selectedEvent.registered_attendees || 0} people</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Date & Time
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Date</label>
                      <p className="font-medium">{formatDate(selectedEvent.event_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Time</label>
                      <p className="font-medium">{formatTime(selectedEvent.event_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Days Remaining</label>
                      <p className="font-medium">{getDaysUntilEvent(selectedEvent.event_date)} days</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    Location
                  </h3>
                  <div>
                    <label className="text-sm text-gray-500">Venue</label>
                    <p className="font-medium">{selectedEvent.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-orange-500" />
                Organizer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">{selectedEvent.organizer?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{selectedEvent.organizer?.email || 'No email provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Contact</label>
                  <p className="font-medium">{selectedEvent.organizer?.phone || 'No contact provided'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-wrap gap-4 justify-end">
                <button
                  onClick={() => {
                    // Alternative: Navigate to full event page
                    navigateToEventPage(selectedEvent._id);
                  }}
                  className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 hover:from-blue-200 hover:to-cyan-200 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Details Page
                </button>
                <button 
                  onClick={() => handleEventAction(selectedEvent._id, 'approve')}
                  disabled={actionLoading === selectedEvent._id}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                    actionLoading === selectedEvent._id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {actionLoading === selectedEvent._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Approve Event
                </button>
                <button 
                  onClick={() => handleEventAction(selectedEvent._id, 'reject')}
                  disabled={actionLoading === selectedEvent._id}
                  className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                    actionLoading === selectedEvent._id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {actionLoading === selectedEvent._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            aria-label="Close error"
          >
            <XCircle className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                Events Management Dashboard
              </h1>
              <p className="text-gray-600">
                Review and manage pending event submissions from organizers
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <button 
                onClick={downloadReport}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-gray-200 hover:to-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
              <button 
                onClick={fetchEvents}
                disabled={isLoading}
                className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                  isLoading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {isLoading ? (
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
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {/* ... (Stats cards remain the same) ... */}
          </div>

          {/* Search and Events Table Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600" />
                  Pending Review Events
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingEvents.length} events awaiting your approval
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={() => handleSort('event_date')}
                  className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 transition-all duration-300"
                >
                  <Filter className="w-5 h-5" />
                  Sort by Date
                  {sortConfig.key === 'event_date' && (
                    sortConfig.direction === 'asc' ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Events Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              {sortedEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <th className="py-4 pl-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Event Details
                        </th>
                        <th className="py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Organizer
                        </th>
                        <th className="py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="py-4 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-4 pr-6 text-left font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEvents.map((event) => (
                        <React.Fragment key={event._id}>
                          <tr 
                            className="group border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                          >
                            <td className="py-5 pl-6">
                              <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getPriorityColor(event)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                  <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                        {event.event_name}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                                          {event.category?.categoryName || 'Uncategorized'}
                                        </span>
                                        {event.tags?.map(tag => (
                                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => toggleExpandEvent(event._id)}
                                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      {expandedEvent === event._id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-500" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                      <MapPin className="w-4 h-4" />
                                      {event.location.length > 25 ? `${event.location.substring(0, 25)}...` : event.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center shadow-sm">
                                  <UserCircle className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{event.organizer?.name || 'Unknown'}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-[150px]">
                                    {event.organizer?.email || 'No email provided'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-indigo-500" />
                                  <span className="font-medium text-gray-800">
                                    {formatDate(event.event_date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {formatTime(event.event_date)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {getDaysUntilEvent(event.event_date)} days remaining
                                </div>
                              </div>
                            </td>
                            <td className="py-5">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    event.status === 'approved' ? 'bg-emerald-500' : 
                                    event.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                  }`} />
                                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                    event.status === 'approved' 
                                      ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' 
                                      : event.status === 'rejected'
                                      ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700'
                                      : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                                  }`}>
                                    {event.status?.charAt(0).toUpperCase() + event.status?.slice(1)}
                                  </span>
                                </div>
                                {getDaysUntilEvent(event.event_date) <= 7 && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-red-100 to-pink-100 text-red-700">
                                    High Priority
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-5 pr-6">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => viewEventDetails(event._id)}
                                  className="group/view p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                                  title="View Event Details"
                                >
                                  <Eye className="w-5 h-5 text-blue-600 group-hover/view:scale-110 transition-transform" />
                                </button>
                                <button 
                                  onClick={() => handleEventAction(event._id, 'approve')}
                                  disabled={actionLoading === event._id}
                                  className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                                    actionLoading === event._id
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                                  }`}
                                >
                                  {actionLoading === event._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleEventAction(event._id, 'reject')}
                                  disabled={actionLoading === event._id}
                                  className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                                    actionLoading === event._id
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-md hover:shadow-lg hover:scale-105'
                                  }`}
                                >
                                  {actionLoading === event._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* ... (expanded row remains the same) ... */}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  {/* ... (empty state remains the same) ... */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventModal && <EventDetailModal />}
    </div>
  );
};

export default EventsManagement;