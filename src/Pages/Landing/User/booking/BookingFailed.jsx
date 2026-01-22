import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  Users, 
  DollarSign, 
  ArrowLeft, 
  RefreshCw,
  Ticket,
  MapPin,
  ChevronRight
} from 'lucide-react';

const BookingFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const pidx = searchParams.get('pidx');
  const transactionId = searchParams.get('transaction_id');
  const status = searchParams.get('status');
  const message = searchParams.get('message') || 'Your payment could not be processed.';
  const eventId = searchParams.get('eventId');
  const seats = searchParams.get('seats');
  const amount = searchParams.get('amount');
  const eventName = searchParams.get('eventName');

  const handleRetry = () => {
    if (!eventId) {
      navigate('/userdb/events');
      return;
    }

    navigate(`/userdb/events/${eventId}`, {
      state: { 
        showBooking: true,
        preselectedSeats: seats 
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/userdb/events')}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 transition-all duration-300"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Events
      </button>

      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Payment Failed</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              We encountered an issue while processing your payment. Please review the details below.
            </p>
          </div>

          {/* Error Alert */}
          <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl shadow-sm mb-8">
            <div className="absolute left-5 top-5">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="pr-10">
              <h4 className="font-bold text-red-800 mb-1">Payment Error</h4>
              <p className="text-sm text-red-600">{message}</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Left Column: Payment Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-600" />
                Payment Details
              </h2>
              
              <div className="space-y-4">
                {status && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-bold text-gray-800">{status.toUpperCase()}</p>
                    </div>
                  </div>
                )}
                
                {pidx && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <div className="text-sm font-bold text-blue-600">ID</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment ID</p>
                      <p className="font-medium text-gray-800 text-sm">{pidx}</p>
                    </div>
                  </div>
                )}
                
                {transactionId && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <div className="text-sm font-bold text-indigo-600">TXN</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-medium text-gray-800 text-sm">{transactionId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Event Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Event Information
              </h2>
              
              {eventName ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Event</p>
                      <p className="font-bold text-gray-800">{eventName}</p>
                    </div>
                  </div>
                  
                  {seats && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Selected Seats</p>
                        <p className="font-bold text-gray-800 text-xl">{seats}</p>
                      </div>
                    </div>
                  )}
                  
                  {amount && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-bold text-gray-800 text-xl">NPR {parseInt(amount).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No event details available</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/userdb/events')}
                className="group/browse flex-1 py-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <MapPin className="w-5 h-5 group-hover/browse:scale-110 transition-transform" />
                Browse More Events
                <ChevronRight className="w-4 h-4 group-hover/browse:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={handleRetry}
                disabled={!eventId}
                className={`group/retry flex-1 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                  !eventId
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                <RefreshCw className="w-5 h-5 group-hover/retry:rotate-180 transition-transform" />
                Try Booking Again
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Check Payment Method</p>
                  <p className="text-gray-600 text-xs">Ensure your payment method has sufficient funds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Verify Details</p>
                  <p className="text-gray-600 text-xs">Double-check your booking details before retrying</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Contact Support</p>
                  <p className="text-gray-600 text-xs">If issues persist, contact our support team</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Alternative Payment</p>
                  <p className="text-gray-600 text-xs">Try using a different payment method</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFailed;