import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Loader2, CreditCard, Calendar, Users, DollarSign, 
  Sparkles, CheckCircle, AlertTriangle, X, ArrowRight, 
  Ticket, Wallet, Shield
} from 'lucide-react';
import api from '@/utils/api';

const PAYMENT_METHODS = {
  ESEWA: {
    id: 'eSewa',
    label: 'eSewa',
    icon: '💰',
    color: 'from-green-500 to-emerald-600'
  },
  KHALTI: {
    id: 'Khalti',
    label: 'Khalti',
    icon: '🟣',
    color: 'from-purple-500 to-violet-600'
  }
};

const BookingForm = ({ event, onClose, onSuccess }) => {
  const [bookingState, setBookingState] = useState({
    seats: 1,
    paymentMethod: '',
    loading: false,
    error: null,
    successMessage: null
  });

  const [timeoutId, setTimeoutId] = useState(null);

  const availableSeats = event.totalSlots - (event.attendees?.length || 0);
  const totalAmount = bookingState.seats * event.price;

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const validateBooking = () => {
    if (!bookingState.paymentMethod) {
      throw new Error('Please select a payment method');
    }
    if (bookingState.seats < 1 || bookingState.seats > availableSeats) {
      throw new Error(`Please select between 1 and ${availableSeats} seats`);
    }
    if (!event._id) {
      throw new Error('Invalid event selected');
    }
  };

  const handleInputChange = (field, value) => {
    setBookingState(prev => ({
      ...prev,
      [field]: value,
      error: null
    }));
  };

  const handlePayment = async () => {
    try {
      setBookingState(prev => ({ ...prev, loading: true, error: null }));

      validateBooking();
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to continue booking');
      }

      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/userdb/booking/success`;
      const failureUrl = `${baseUrl}/userdb/booking/failed`;

      const response = await api.safePost('/bookings', {
        eventId: event._id,
        numberOfSeats: bookingState.seats,
        paymentMethod: bookingState.paymentMethod,
        successUrl,
        failureUrl
      });

      if (response.data?.paymentUrl) {
        setBookingState(prev => ({
          ...prev,
          successMessage: 'Redirecting to payment gateway...'
        }));

        const id = setTimeout(() => {
          window.location.href = response.data.paymentUrl;
        }, 1500);
        setTimeoutId(id);

        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        throw new Error('Invalid payment URL received');
      }
    } catch (error) {
      setBookingState(prev => ({
        ...prev,
        error: error.message || 'Payment initiation failed'
      }));
      console.error('Booking error:', error);
    } finally {
      setBookingState(prev => ({ ...prev, loading: false }));
    }
  };

  const isButtonDisabled = 
    bookingState.loading || 
    bookingState.seats < 1 || 
    bookingState.seats > availableSeats || 
    !bookingState.paymentMethod;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Complete Your Booking</h2>
            <p className="text-sm text-gray-600">Secure your spot at this amazing event</p>
          </div>
          <button
            onClick={onClose}
            disabled={bookingState.loading}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-all duration-300 hover:scale-110 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Event Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{event.event_name}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{event.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">
                  {new Date(event.event_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700">{availableSeats} seats left</span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {bookingState.error && (
            <div className="relative mb-6 p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl shadow-sm">
              <div className="absolute left-5 top-5">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="pr-10">
                <h4 className="font-bold text-red-800 mb-1">Error</h4>
                <p className="text-sm text-red-600">{bookingState.error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {bookingState.successMessage && (
            <div className="relative mb-6 p-5 pl-14 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-xl shadow-sm">
              <div className="absolute left-5 top-5">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="pr-10">
                <h4 className="font-bold text-emerald-800 mb-1">Success</h4>
                <p className="text-sm text-emerald-600">{bookingState.successMessage}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Seats Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="seats" className="text-sm font-semibold text-gray-700">
                  Number of Seats
                </Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-600 font-medium">
                    {availableSeats} seats available
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  max={availableSeats}
                  value={bookingState.seats}
                  onChange={(e) => handleInputChange('seats', Math.min(parseInt(e.target.value) || 1, availableSeats))}
                  className="pl-10 pr-4 py-3 rounded-xl border bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  aria-describedby="seats-available"
                />
              </div>
              
              {/* Seats Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Seats Selected: {bookingState.seats}</span>
                  <span>{((bookingState.seats / event.totalSlots) * 100).toFixed(0)}% of capacity</span>
                </div>
                <div className="h-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(bookingState.seats / event.totalSlots) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <Label htmlFor="payment" className="text-sm font-semibold text-gray-700 mb-3 block">
                Payment Method
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(PAYMENT_METHODS).map(method => (
                  <button
                    key={method.id}
                    onClick={() => handleInputChange('paymentMethod', method.id)}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      bookingState.paymentMethod === method.id
                        ? `border-transparent bg-gradient-to-br ${method.color} text-white shadow-lg`
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`text-2xl ${bookingState.paymentMethod === method.id ? 'text-white' : 'text-gray-600'}`}>
                        {method.icon}
                      </div>
                      <span className={`text-sm font-medium ${
                        bookingState.paymentMethod === method.id ? 'text-white' : 'text-gray-800'
                      }`}>
                        {method.label}
                      </span>
                    </div>
                    {bookingState.paymentMethod === method.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-800">
                      NPR {totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Per Seat</p>
                  <p className="font-semibold text-gray-800">NPR {event.price.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Your payment is secured with 256-bit SSL encryption</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                disabled={bookingState.loading}
                className="flex-1 py-3 px-6 rounded-xl font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isButtonDisabled}
                className="flex-1 group py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingState.loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Pay NPR {totalAmount.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Instant booking confirmation • Free cancellation within 24 hours • Mobile ticket</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;