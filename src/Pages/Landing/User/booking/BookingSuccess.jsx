import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import api from '../../../../utils/api';
import ReactQR from 'react-qr-code';
import { CheckCircle, AlertTriangle, RefreshCw, Home, Calendar, ChevronRight, Sparkles, User, Ticket, CreditCard } from 'lucide-react';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const pidx = searchParams.get('pidx');
  const transactionId = searchParams.get('transaction_id');

  const updatePaymentStatus = async (bookingData) => {
    try {
      setUpdatingStatus(true);
      
      const response = await api.safePatch(`/bookings/update-status/${transactionId}`, {
        paymentStatus: 'completed',
        pidx: pidx
      });

      if (response?.data?.success) {
        setBookingDetails(prev => ({
          ...prev,
          paymentStatus: 'completed'
        }));
      } else {
        console.error('Failed to update payment status');
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const verifyBooking = async () => {
      try {
        setLoading(true);
        setError(null);
  
        if (!transactionId || !pidx) {
          throw new Error('Missing payment verification details');
        }
  
        const response = await api.safeGet(`/bookings/booking-details/${transactionId}`);
  
        if (!response?.data?.success) {
          throw new Error('Payment verification failed');
        }
  
        setBookingDetails(response.data);
        setRetryCount(0);

        if (response.data.paymentStatus === 'pending') {
          await updatePaymentStatus(response.data);
        }
    
      } catch (err) {
        console.error('Booking verification failed:', {
          error: err,
          errorMessage: err.message,
          errorStatus: err.status,
          transactionId,
          pidx
        });
  
        if (err.status === 404 && retryCount < 3) {
          console.log(`Retry attempt ${retryCount + 1} of 3`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => verifyBooking(), 2000);
          return;
        }
  
        let errorMessage = 'Failed to verify booking';
        
        if (err.status === 404) {
          errorMessage = 'Booking verification is taking longer than expected. Please check your email for confirmation.';
        } else if (err.status === 401) {
          errorMessage = 'Session expired. Please login and check your bookings.';
        } else if (err.message) {
          errorMessage = err.message;
        }
  
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  
    verifyBooking();
  }, [transactionId, pidx, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <RefreshCw className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {retryCount > 0 ? 'Verifying Payment...' : 'Processing Your Booking'}
                  </h3>
                  <p className="text-gray-600">
                    {retryCount > 0 
                      ? `Attempt ${retryCount + 1} of 3 - This may take a moment`
                      : 'Please wait while we confirm your payment details'}
                  </p>
                  <div className="mt-6 h-2 w-48 mx-auto bg-gradient-to-r from-purple-100 to-pink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ width: `${(retryCount + 1) * 33}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="relative p-6 pl-16 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-2xl shadow-lg animate-fade-in">
            <div className="absolute left-6 top-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="pr-6">
              <h4 className="text-xl font-bold text-red-800 mb-3">Verification Status</h4>
              <p className="text-red-600 mb-6">{error}</p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/userdb/events')}
                  className="group px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Return to Home
                </button>
                <button
                  onClick={() => navigate('/dashboard/bookings')}
                  className="group px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  View My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-3">No Booking Found</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your payment may still be processing. Please check your email for confirmation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Home className="w-5 h-5" />
                  Return Home
                </button>
                <button
                  onClick={() => navigate('/dashboard/bookings')}
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Calendar className="w-5 h-5" />
                  View My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { eventName, seatsBooked, totalAmount, userName } = bookingDetails;

  const qrContent = JSON.stringify({
    event: eventName,
    seats: seatsBooked,
    amount: totalAmount,
    user: userName,
    transactionId,
    pidx,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-2">Your booking has been successfully processed</p>
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Payment Verified Successfully</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Ticket className="w-6 h-6 text-purple-600" />
                  Booking Details
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Event</p>
                          <p className="font-bold text-lg text-gray-800">{eventName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Booked By</p>
                          <p className="font-bold text-lg text-gray-800">{userName}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Seats Booked</span>
                          <span className="text-2xl font-bold text-gray-800">{seatsBooked}</span>
                        </div>
                        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${(seatsBooked / (seatsBooked + 10)) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="text-2xl font-bold text-gray-800">NPR {totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    Payment Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                      <p className="font-mono font-medium text-gray-800">{transactionId}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                      <p className="font-mono font-medium text-gray-800">{pidx}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Entry QR Code
                </h3>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border border-purple-100">
                  <div className="bg-white p-6 rounded-lg shadow-inner mb-6">
                    <ReactQR
                      value={qrContent}
                      size={200}
                      className="mx-auto"
                      level="H"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">Show this QR code at the event entrance</p>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Valid for event entry</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                  >
                    Download Ticket
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard/bookings')}
                    className="group w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    View All Bookings
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Success Tips */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 p-6">
              <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Next Steps
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-emerald-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
                  Check your email for confirmation
                </li>
                <li className="flex items-start gap-2 text-sm text-emerald-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
                  Save or screenshot the QR code
                </li>
                <li className="flex items-start gap-2 text-sm text-emerald-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></div>
                  Arrive 30 minutes before the event
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;