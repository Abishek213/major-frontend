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
  TrendingUp
} from 'lucide-react';

const EventsManagement = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0
  });
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
        
        // Calculate stats
        setStats({
          total: events.length,
          approved: events.filter(e => e.status === 'approved').length,
          rejected: events.filter(e => e.status === 'rejected').length
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
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.message || "Failed to load events. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAction = async (eventId, action) => {
    setIsLoading(true);
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
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(`Failed to ${action} event: ${err.response?.data?.message || err.message}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const viewEventDetails = (eventId) => {
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

      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                Event Management Dashboard
              </h1>
              <p className="text-gray-600">
                Review and manage pending event submissions from organizers
              </p>
            </div>
            <button 
              onClick={fetchEvents}
              disabled={isLoading}
              className={`mt-4 md:mt-0 px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</h3>
              <p className="text-gray-600 font-medium">Pending Events</p>
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
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.approved}</h3>
              <p className="text-gray-600 font-medium">Approved Events</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.approved / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-rose-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.rejected}</h3>
              <p className="text-gray-600 font-medium">Rejected Events</p>
              <div className="mt-3 h-2 bg-rose-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: stats.total > 0 ? `${(stats.rejected / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Events Table Section */}
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
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Events Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              {pendingEvents.length > 0 ? (
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
                      {pendingEvents.map((event) => (
                        <tr 
                          key={event._id} 
                          className="group border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                        >
                          <td className="py-5 pl-6">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                  {event.event_name}
                                </h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                                    {event.category?.categoryName || 'Uncategorized'}
                                  </span>
                                  {event.location && (
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <MapPin className="w-3 h-3" />
                                      {event.location.length > 20 ? `${event.location.substring(0, 20)}...` : event.location}
                                    </div>
                                  )}
                                </div>
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
                                <p className="text-sm text-gray-500">
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
                            </div>
                          </td>
                          <td className="py-5">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                event.status === 'approved' ? 'bg-emerald-500 animate-pulse' : 
                                event.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                              }`} />
                              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                event.status === 'approved' 
                                  ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700' 
                                  : event.status === 'rejected'
                                  ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700'
                                  : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                              }`}>
                                {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || 'Pending'}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 pr-6">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => viewEventDetails(event._id)}
                                className="group/view p-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5 text-blue-600 group-hover/view:scale-110 transition-transform" />
                              </button>
                              <button 
                                onClick={() => handleEventAction(event._id, 'approve')}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                                  isLoading 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                                }`}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleEventAction(event._id, 'reject')}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                                  isLoading 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-md hover:shadow-lg hover:scale-105'
                                }`}
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Pending Events</h3>
                  <p className="text-gray-500 mb-6">
                    All events have been reviewed. Check back later for new submissions.
                  </p>
                  <button
                    onClick={fetchEvents}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Check for New Events
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

export default EventsManagement;