import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  MessageSquare,
  Phone,
  TrendingUp,
  Sparkles,
  Plus,
  ChevronRight,
  RefreshCw,
  UserCircle,
  Clock,
  Award
} from 'lucide-react';

const InterestedOrganizers = () => {
  const [eventRequests, setEventRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventRequests = async () => {
      try {
        const response = await api.safeGet("/eventrequest/event-requests-for-user");
        setEventRequests(response.data.eventRequests);
        setError(null);
      } catch (error) {
        setEventRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventRequests();
  }, []);

  const handleSelectOrganizer = async (eventId, organizerId) => {
    try {
      const response = await api.safePut(
        '/eventrequest/event-request/select-organizer',
        { eventId, organizerId }
      );

      if (response.status >= 200 && response.status < 300) {
        const updatedResponse = await api.safeGet("/eventrequest/event-requests-for-user");
        setEventRequests(updatedResponse.data.eventRequests);
        setError(null);
      } else {
        setError(`Error: ${response.data.message || 'Failed to select organizer'}`);
      }
    } catch (error) {
      console.error('Error selecting organizer:', error);
      setError(error.message || 'An error occurred while selecting the organizer.');
    }
  };

  const handleCreateEventRequest = () => {
    navigate('/userdb/eventrequest');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200',
      approved: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200',
      rejected: 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border border-rose-200',
      deal_done: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
    };
    
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusClasses[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Loading your event requests...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !eventRequests.length) {
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

  if (!eventRequests || eventRequests.length === 0) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  Event Requests Dashboard
                </h1>
                <p className="text-gray-600">
                  Connect with organizers for your perfect event
                </p>
              </div>
              
              <button
                onClick={handleCreateEventRequest}
                className="mt-4 md:mt-0 px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create New Event Request
              </button>
            </div>

            {/* Empty State */}
            <div className="py-16 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Users className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Event Requests Found</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any event requests yet. Start planning your perfect event today!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCreateEventRequest}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Event Request
                </button>
              </div>
            </div>
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

      {/* Main Dashboard */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Event Requests Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your event requests and connect with organizers
              </p>
            </div>
            
            <button
              onClick={handleCreateEventRequest}
              className="mt-4 md:mt-0 px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Event Request
            </button>
          </div>

          {/* Event Requests List */}
          <div className="space-y-8">
            {eventRequests.map((event) => (
              <div key={event.eventId} className="border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Event Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                        <FileText className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{event.eventType} Event</h2>
                        <p className="text-sm text-gray-600 mt-1">Request ID: {event.eventId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(event.status)}
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-800">{event.organizers.length} Organizers</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Venue</p>
                        <p className="font-bold text-gray-800">{event.venue}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-bold text-gray-800">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-bold text-gray-800 text-xl">${event.budget}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Organizers</p>
                        <p className="font-bold text-gray-800 text-xl">{event.organizers.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Event Description
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  </div>

                  {/* Organizers Section */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Interested Organizers ({event.organizers.length})
                    </h3>
                    
                    {event.organizers.length === 0 ? (
                      <div className="py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-6">
                          <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No organizers have accepted for this event yet.</p>
                        <p className="text-sm text-gray-500 mt-2">Check back later or update your request details.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {event.organizers.map((organizer, index) => (
                          <div key={index} className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                  <UserCircle className="w-7 h-7 text-indigo-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-800 text-lg">{organizer.fullname}</h4>
                                  <div className="mt-2">{getStatusBadge(organizer.status)}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                  <Phone className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Contact</p>
                                  <p className="font-medium text-gray-800">{organizer.contact}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                                  <DollarSign className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Proposed Budget</p>
                                  <p className="font-bold text-gray-800 text-xl">${organizer.proposedBudget}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Response Date</p>
                                  <p className="font-medium text-gray-800">{new Date(organizer.responseDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
                              <p className="text-sm font-medium text-gray-600 mb-2">Organizer's Message</p>
                              <p className="text-gray-800">{organizer.message}</p>
                            </div>
                            
                            <button
                              onClick={() => handleSelectOrganizer(event.eventId, organizer.organizerId)}
                              className="group/select w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <CheckCircle className="w-5 h-5 group-hover/select:scale-110 transition-transform" />
                              Select This Organizer
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestedOrganizers;