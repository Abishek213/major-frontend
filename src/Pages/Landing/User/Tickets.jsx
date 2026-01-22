import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Ticket, Calendar, MapPin, Clock, TrendingUp, AlertTriangle, RefreshCw, Eye, Sparkles, Users, ChevronRight } from 'lucide-react';

const Tickets = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tickets/my-tickets');
        setTickets(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getTicketStatus = (ticket) => {
    const now = new Date();
    const eventDate = new Date(ticket.event.date);
    
    if (eventDate > now) return 'upcoming';
    if (eventDate <= now) return 'ongoing';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return 'from-emerald-500 to-green-500';
      case 'ongoing': return 'from-blue-500 to-cyan-500';
      case 'completed': return 'from-gray-500 to-gray-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const refreshTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets/my-tickets');
      setTickets(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Loading your tickets...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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

  const upcomingTickets = tickets.filter(ticket => getTicketStatus(ticket) === 'upcoming');
  const ongoingTickets = tickets.filter(ticket => getTicketStatus(ticket) === 'ongoing');
  const completedTickets = tickets.filter(ticket => getTicketStatus(ticket) === 'completed');

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
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                My Tickets Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and view all your event tickets in one place
              </p>
            </div>
            
            <button 
              onClick={refreshTickets}
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
                  Refresh Tickets
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{tickets.length}</h3>
              <p className="text-gray-600 font-medium">Total Tickets</p>
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
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{upcomingTickets.length}</h3>
              <p className="text-gray-600 font-medium">Upcoming Events</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: tickets.length > 0 ? `${(upcomingTickets.length / tickets.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Users className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{ongoingTickets.length}</h3>
              <p className="text-gray-600 font-medium">Ongoing Events</p>
              <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: tickets.length > 0 ? `${(ongoingTickets.length / tickets.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tickets Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                  Your Event Tickets
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {tickets.length} tickets across all events
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Ticket className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Tickets Grid */}
            {tickets.length === 0 ? (
              <div className="py-16 text-center border border-gray-200 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Ticket className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Tickets Found</h3>
                <p className="text-gray-500 mb-6">
                  You haven't registered for any events yet. Start exploring events to get tickets!
                </p>
                <button
                  onClick={refreshTickets}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check for New Tickets
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map(ticket => {
                  const status = getTicketStatus(ticket);
                  return (
                    <div 
                      key={ticket._id} 
                      className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                          <Ticket className="w-7 h-7 text-indigo-600" />
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(status)} text-white shadow-md`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors text-lg mb-4 line-clamp-2">
                        {ticket.event.event_name}
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Date</p>
                            <p className="font-medium text-gray-800">
                              {new Date(ticket.event.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Time</p>
                            <p className="font-medium text-gray-800">
                              {new Date(ticket.event.date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-rose-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Location</p>
                            <p className="font-medium text-gray-800 line-clamp-1">
                              {ticket.event.location}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs text-gray-600">Ticket Number</p>
                            <p className="font-bold text-gray-800">{ticket.ticketNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Price</p>
                            <p className="font-bold text-gray-800">Rs. {ticket.event.price || 'Free'}</p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => window.location.href = `/userdb/events/${ticket.event._id}`}
                          className="group/view w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <Eye className="w-5 h-5 group-hover/view:scale-110 transition-transform" />
                          View Event Details
                          <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                        </button>
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

export default Tickets;