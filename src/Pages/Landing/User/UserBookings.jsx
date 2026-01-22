import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  DollarSign,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Clock,
  ChevronRight,
  Loader2,
  ArrowRight,
  Ticket,
  Users,
  MapPin
} from 'lucide-react';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.safeGet('/bookings/MyEvents');
        
        if (!mounted) return;

        if (response.data?.bookedEvents) {
          setBookings(response.data.bookedEvents);
        } else {
          setError('No booking data available');
        }
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load bookings');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchBookings();
    
    return () => {
      mounted = false;
    };
  }, []);

  const refreshBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.safeGet('/bookings/MyEvents');
      if (response.data?.bookedEvents) {
        setBookings(response.data.bookedEvents);
      }
    } catch (err) {
      setError('Failed to refresh bookings');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentStatus = (status) => {
    const statusConfig = {
      completed: { 
        icon: CheckCircle, 
        color: 'from-emerald-500 to-green-500',
        text: 'Paid',
        bgColor: 'from-emerald-100 to-green-100'
      },
      pending: { 
        icon: AlertTriangle, 
        color: 'from-amber-500 to-yellow-500',
        text: 'Pending',
        bgColor: 'from-amber-100 to-yellow-100'
      },
      failed: { 
        icon: XCircle, 
        color: 'from-rose-500 to-pink-500',
        text: 'Failed',
        bgColor: 'from-rose-100 to-pink-100'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${config.bgColor} ${config.color.includes('emerald') ? 'text-emerald-800' : config.color.includes('amber') ? 'text-amber-800' : 'text-rose-800'} border border-transparent`}>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          {config.text}
        </div>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalRevenue = () => {
    return bookings.reduce((total, booking) => {
      const amount = parseFloat(booking.totalAmount) || 0;
      const status = booking.event.payment?.status;
      return status === 'completed' ? total + amount : total;
    }, 0);
  };

  const getCompletedBookings = () => {
    return bookings.filter(booking => booking.event.payment?.status === 'completed').length;
  };

  const getPendingBookings = () => {
    return bookings.filter(booking => booking.event.payment?.status === 'pending').length;
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Loading your bookings...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !bookings.length) {
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
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                My Bookings Dashboard
              </h1>
              <p className="text-gray-600">
                View and manage all your event bookings and payments
              </p>
            </div>
            
            <button 
              onClick={refreshBookings}
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
                  Refresh Bookings
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
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{bookings.length}</h3>
              <p className="text-gray-600 font-medium">Total Bookings</p>
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
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">NPR {getTotalRevenue()}</h3>
              <p className="text-gray-600 font-medium">Total Spent</p>
              <div className="mt-3 h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <Clock className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{getCompletedBookings()}</h3>
              <p className="text-gray-600 font-medium">Confirmed Bookings</p>
              <div className="mt-3 h-2 bg-amber-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: bookings.length > 0 ? `${(getCompletedBookings() / bookings.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                  Your Event Bookings
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {bookings.length} bookings across all events
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Bookings List */}
            {bookings.length === 0 ? (
              <div className="py-16 text-center border border-gray-200 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Ticket className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
                <p className="text-gray-500 mb-6">
                  You haven't made any bookings yet. Explore our events and find something exciting to attend!
                </p>
                <button
                  onClick={() => navigate('/userdb/events')}
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 transition-all duration-300"
                >
                  <ArrowRight className="w-4 h-4" />
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div 
                    key={booking.bookingId} 
                    className="group border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {/* Booking Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                            <Ticket className="w-7 h-7 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                              {booking.event.event_name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Booking ID: {booking.bookingId}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          {renderPaymentStatus(booking.event.payment?.status || 'pending')}
                          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-medium">
                            {booking.numberOfSeats} seats
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Event Date</p>
                            <p className="font-bold text-gray-800">{formatDate(booking.event.event_date)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Organizer</p>
                            <p className="font-bold text-gray-800">{booking.event.org_ID?.fullname}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-bold text-gray-800 text-xl">NPR {booking.totalAmount}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-bold text-gray-800">{booking.event.location}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-indigo-600" />
                          Payment Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-medium text-gray-800">{booking.paymentMethod || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Booking Date</p>
                            <p className="font-medium text-gray-800">{formatDate(booking.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Event Description */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                          Event Description
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {booking.event.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookings;