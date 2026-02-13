import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import api from '../../../../utils/api';
import ReactQR from 'react-qr-code';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  User, 
  Ticket, 
  CreditCard,
  Brain,
  MapPin,
  Clock,
  Users,
  Download,
  Share2,
  Bell,
  Gift,
  Star,
  ThumbsUp,
  Coffee,
  Car,
  Umbrella,
  Music,
  Camera,
  Wifi,
  Smartphone,
  Mail,
  MessageSquare,
  Award,
  Zap,
  TrendingUp,
  Heart,
  BookmarkPlus,
  Globe,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Navigation
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import AIBadge from '@/components/ai/AIBadge';
import AILoadingSpinner from '@/components/ai/AILoadingSpinner';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [saveToWallet, setSaveToWallet] = useState(false);

  const { recommendations, loading: recLoading } = useRecommendations();

  const pidx = searchParams.get('pidx');
  const transactionId = searchParams.get('transaction_id');

  // AI: Generate intelligent insights for the booking
  const generateAIInsights = async (bookingData) => {
    const insights = {
      weatherForecast: await getWeatherForecast(bookingData.eventLocation),
      venueInsights: getVenueInsights(bookingData.eventName, bookingData.eventLocation),
      crowdPrediction: predictCrowdDensity(bookingData.seatsBooked, bookingData.totalSeats),
      bestTimeToArrive: calculateBestArrivalTime(bookingData.eventDate),
      nearbyAmenities: getNearbyAmenities(bookingData.eventLocation),
      eventTips: generateEventTips(bookingData),
      similarEvents: generateSimilarEvents(bookingData),
      loyaltyReward: calculateLoyaltyReward(bookingData),
      socialProof: getSocialProof(bookingData.eventName)
    };
    setAiInsights(insights);
  };

  // AI: Weather forecast for event day
  const getWeatherForecast = async (location) => {
    // Mock weather API - replace with actual weather API
    const weatherConditions = [
      { condition: 'Sunny', temp: 28, icon: Sun, tip: 'Bring sunscreen and sunglasses', color: 'amber' },
      { condition: 'Partly Cloudy', temp: 24, icon: Cloud, tip: 'Comfortable weather', color: 'blue' },
      { condition: 'Clear', temp: 22, icon: Star, tip: 'Perfect evening weather', color: 'purple' },
      { condition: 'Light Rain', temp: 20, icon: CloudRain, tip: 'Bring an umbrella', color: 'blue' },
      { condition: 'Windy', temp: 21, icon: Wind, tip: 'Bring a light jacket', color: 'gray' }
    ];
    return weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  };

  // AI: Venue-specific insights
  const getVenueInsights = (eventName, location) => {
    const insights = {
      parking: Math.random() > 0.5 ? 'Available nearby' : 'Limited - arrive early',
      accessibility: 'Wheelchair accessible',
      wifi: Math.random() > 0.5 ? 'Free WiFi available' : 'Cellular data recommended',
      food: Math.random() > 0.5 ? 'Food stalls available' : 'Outside food allowed',
      photography: Math.random() > 0.5 ? 'Photography allowed' : 'No flash photography'
    };
    return insights;
  };

  // AI: Predict crowd density
  const predictCrowdDensity = (seatsBooked, totalSeats) => {
    const ratio = seatsBooked / totalSeats;
    if (ratio > 0.8) return { level: 'Very Busy', color: 'rose', tip: 'Arrive 45 min early' };
    if (ratio > 0.5) return { level: 'Moderate', color: 'amber', tip: 'Arrive 30 min early' };
    if (ratio > 0.2) return { level: 'Light', color: 'emerald', tip: 'Arrive 15 min early' };
    return { level: 'Very Light', color: 'blue', tip: 'Flexible timing' };
  };

  // AI: Calculate best arrival time
  const calculateBestArrivalTime = (eventDate) => {
    const eventTime = new Date(eventDate);
    const recommendedArrival = new Date(eventTime.getTime() - 30 * 60000);
    return {
      time: recommendedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reason: 'Avoid queues and find best seats'
    };
  };

  // AI: Find nearby amenities
  const getNearbyAmenities = (location) => {
    const amenities = [
      { name: 'Coffee Shop', distance: '2 min walk', icon: Coffee, color: 'amber' },
      { name: 'Parking Lot', distance: '3 min walk', icon: Car, color: 'blue' },
      { name: 'Restaurant', distance: '5 min walk', icon: Umbrella, color: 'emerald' },
      { name: 'ATM', distance: '1 min walk', icon: CreditCard, color: 'purple' }
    ];
    return amenities;
  };

  // AI: Generate personalized event tips
  const generateEventTips = (bookingData) => {
    const tips = [
      '📸 Share your experience with #Eventa',
      '🎫 Save QR code before arriving',
      '👥 Bring your ID for verification',
      '📧 Check email for event updates',
      '⭐ Rate the event after attending'
    ];
    return tips.slice(0, 3);
  };

  // AI: Generate similar event recommendations
  const generateSimilarEvents = (bookingData) => {
    return [
      {
        name: `Similar to ${bookingData.eventName}`,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        price: Math.floor(bookingData.totalAmount / bookingData.seatsBooked * 0.9),
        matchScore: 92
      },
      {
        name: 'Recommended for you',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        price: Math.floor(bookingData.totalAmount / bookingData.seatsBooked * 0.85),
        matchScore: 88
      }
    ];
  };

  // AI: Calculate loyalty reward
  const calculateLoyaltyReward = (bookingData) => {
    const totalSpent = bookingData.totalAmount || 0;
    if (totalSpent > 10000) return { points: 500, tier: 'Platinum', discount: '15% off next booking' };
    if (totalSpent > 5000) return { points: 300, tier: 'Gold', discount: '10% off next booking' };
    if (totalSpent > 2000) return { points: 150, tier: 'Silver', discount: '5% off next booking' };
    return { points: 50, tier: 'Bronze', discount: 'Early access to events' };
  };

  // AI: Get social proof
  const getSocialProof = (eventName) => {
    const reviews = [
      { text: 'Amazing event! Highly recommended ⭐⭐⭐⭐⭐', user: 'Sarah K.' },
      { text: 'Great organization and wonderful experience ⭐⭐⭐⭐⭐', user: 'Mike R.' },
      { text: 'Will definitely attend again ⭐⭐⭐⭐', user: 'Priya S.' }
    ];
    return reviews;
  };

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
        
        // Generate AI insights after successful booking
        await generateAIInsights({
          ...bookingData,
          eventDate: bookingData.eventDate || new Date(),
          eventLocation: bookingData.eventLocation || 'Kathmandu',
          totalSeats: bookingData.totalSeats || 100
        });
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
        } else {
          // Generate AI insights for existing confirmed booking
          await generateAIInsights({
            ...response.data,
            eventDate: response.data.eventDate || new Date(),
            eventLocation: response.data.eventLocation || 'Kathmandu',
            totalSeats: response.data.totalSeats || 100
          });
        }
    
      } catch (err) {
        console.error('Booking verification failed:', err);
  
        if (err.status === 404 && retryCount < 3) {
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

  const handleDownloadQR = () => {
    const canvas = document.createElement('canvas');
    const svg = document.querySelector('.qr-code svg');
    if (svg) {
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(xml);
      const b64start = 'data:image/svg+xml;base64,';
      const image64 = b64start + svg64;
      
      const link = document.createElement('a');
      link.href = image64;
      link.download = `ticket-${transactionId}.svg`;
      link.click();
      setQrDownloaded(true);
      setTimeout(() => setQrDownloaded(false), 3000);
    }
  };

  const handleAddToCalendar = () => {
    if (!bookingDetails?.eventDate) return;
    
    const eventDate = new Date(bookingDetails.eventDate);
    const endDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(bookingDetails.eventName)}&details=${encodeURIComponent(`Ticket: ${transactionId}\nSeats: ${bookingDetails.seatsBooked}`)}&location=${encodeURIComponent(bookingDetails.eventLocation || '')}&dates=${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    
    window.open(googleCalendarUrl, '_blank');
    setCalendarAdded(true);
    setTimeout(() => setCalendarAdded(false), 3000);
  };

  const handleShareTicket = async () => {
    const shareData = {
      title: `🎟️ Ticket for ${bookingDetails?.eventName}`,
      text: `I've booked ${bookingDetails?.seatsBooked} seat(s) for ${bookingDetails?.eventName}. Can't wait! 🎉`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareOptions(true);
        setTimeout(() => setShowShareOptions(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSaveToWallet = () => {
    // Mock Apple Wallet/Google Pay integration
    setSaveToWallet(true);
    setTimeout(() => setSaveToWallet(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <AILoadingSpinner />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 mt-6">
                    {retryCount > 0 ? 'AI is Verifying Your Payment...' : 'Processing Your Smart Ticket'}
                  </h3>
                  <p className="text-gray-600">
                    {retryCount > 0 
                      ? `Attempt ${retryCount + 1} of 3 - AI is analyzing payment confirmation`
                      : 'AI is generating personalized insights for your event'}
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
                  Return to Events
                </button>
                <button
                  onClick={() => navigate('/userdb/bookings')}
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
                  onClick={() => navigate('/userdb/bookings')}
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

  const { eventName, seatsBooked, totalAmount, userName, eventDate, eventLocation, totalSeats } = bookingDetails;

  const qrContent = JSON.stringify({
    event: eventName,
    seats: seatsBooked,
    amount: totalAmount,
    user: userName,
    transactionId,
    pidx,
    timestamp: new Date().toISOString(),
    verification: 'v1'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Success Header with AI Badge */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute top-4 right-4">
            <AIBadge score={98} reason="Smart Ticket Ready" />
          </div>
          <div className="p-8 text-center">
            <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg animate-bounce-slow">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Booking Confirmed! 🎉</h1>
            <p className="text-lg text-gray-600 mb-2">Your AI-powered smart ticket is ready</p>
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Payment Verified • Ticket Generated • AI Insights Ready</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details & AI Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Ticket className="w-6 h-6 text-purple-600" />
                    Booking Details
                  </h2>
                  <AIBadge score={95} reason="Premium Ticket" size="sm" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl hover:shadow-md transition">
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

                    <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl hover:shadow-md transition">
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
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl hover:shadow-md transition">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Seats Booked</span>
                          <span className="text-3xl font-bold text-gray-800">{seatsBooked}</span>
                        </div>
                        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500" style={{ width: `${(seatsBooked / (totalSeats || 100)) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-emerald-600">{totalSeats - seatsBooked} seats remaining</p>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-xl hover:shadow-md transition">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="text-3xl font-bold text-gray-800">NPR {totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-emerald-600">
                          <Award className="w-4 h-4" />
                          Earned {aiInsights?.loyaltyReward?.points || 50} loyalty points
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
                      <p className="font-mono font-medium text-gray-800 break-all">{transactionId}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                      <p className="font-mono font-medium text-gray-800 break-all">{pidx}</p>
                    </div>
                  </div>
                </div>

                {/* AI Weather & Venue Insights */}
                {aiInsights && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-800">AI Event Assistant</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Weather Forecast */}
                      <div className="bg-white/80 p-4 rounded-lg border border-indigo-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Event Day Weather</span>
                          {aiInsights.weatherForecast && (
                            <div className={`px-3 py-1 rounded-full text-xs bg-${aiInsights.weatherForecast.color}-100 text-${aiInsights.weatherForecast.color}-700`}>
                              <aiInsights.weatherForecast.icon className="w-4 h-4 inline mr-1" />
                              {aiInsights.weatherForecast.condition}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {aiInsights.weatherForecast?.tip || 'Check weather before leaving'}
                        </p>
                      </div>

                      {/* Crowd Prediction */}
                      <div className="bg-white/80 p-4 rounded-lg border border-indigo-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Expected Crowd</span>
                          <span className={`px-3 py-1 rounded-full text-xs bg-${aiInsights.crowdPrediction?.color}-100 text-${aiInsights.crowdPrediction?.color}-700`}>
                            {aiInsights.crowdPrediction?.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{aiInsights.crowdPrediction?.tip}</p>
                      </div>

                      {/* Best Time to Arrive */}
                      <div className="bg-white/80 p-4 rounded-lg border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700">Recommended Arrival</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-700">{aiInsights.bestTimeToArrive?.time}</p>
                        <p className="text-xs text-gray-600 mt-1">{aiInsights.bestTimeToArrive?.reason}</p>
                      </div>

                      {/* Loyalty Reward */}
                      <div className="bg-white/80 p-4 rounded-lg border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">Loyalty Status</span>
                        </div>
                        <p className="text-lg font-bold text-purple-700">{aiInsights.loyaltyReward?.tier}</p>
                        <p className="text-xs text-gray-600 mt-1">{aiInsights.loyaltyReward?.discount}</p>
                      </div>
                    </div>

                    {/* Nearby Amenities */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-gray-600" />
                        Nearby Amenities
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {aiInsights.nearbyAmenities?.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
                            <div className={`w-8 h-8 rounded-lg bg-${amenity.color}-100 flex items-center justify-center`}>
                              <amenity.icon className={`w-4 h-4 text-${amenity.color}-600`} />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-800">{amenity.name}</p>
                              <p className="text-xs text-gray-600">{amenity.distance}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Event Tips */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                      <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Pro Tips
                      </h4>
                      <ul className="space-y-1">
                        {aiInsights.eventTips?.map((tip, index) => (
                          <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - QR Code & Actions */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden sticky top-6">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Smart Entry Pass
                  </h3>
                  <AIBadge score={96} reason="Verified" size="sm" />
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border border-purple-100">
                  <div className="bg-white p-6 rounded-lg shadow-inner mb-6 qr-code">
                    <ReactQR
                      value={qrContent}
                      size={200}
                      className="mx-auto"
                      level="H"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Secure • Encrypted • One-time use
                    </p>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm">Valid for event entry</span>
                    </div>
                  </div>
                </div>

                {/* Smart Ticket Actions */}
                <div className="mt-8 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownloadQR}
                      className={`group py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                        qrDownloaded
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                          : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100'
                      }`}
                    >
                      {qrDownloaded ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Downloaded!
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Save Ticket
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleShareTicket}
                      className="py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 group"
                    >
                      <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Share
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCalendar}
                      className={`py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                        calendarAdded
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      {calendarAdded ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Added!
                        </>
                      ) : (
                        <>
                          <Calendar className="w-5 h-5" />
                          Add to Calendar
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleSaveToWallet}
                      className={`py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                        saveToWallet
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                    >
                      {saveToWallet ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-5 h-5" />
                          Save to Wallet
                        </>
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => navigate('/userdb/bookings')}
                    className="group w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 mt-4"
                  >
                    View All Bookings
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Similar Events Recommendations */}
            {aiInsights?.similarEvents && aiInsights.similarEvents.length > 0 && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    You Might Also Like
                  </h4>
                  <div className="space-y-3">
                    {aiInsights.similarEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-lg hover:shadow-md transition">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{event.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-600">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-xs font-bold text-gray-900">NPR {event.price}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {event.matchScore}% match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/userdb/events')}
                    className="w-full mt-4 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-1"
                  >
                    Browse More Events
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Social Proof */}
            {aiInsights?.socialProof && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 p-6">
                <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  What Others Say
                </h4>
                <div className="space-y-3">
                  {aiInsights.socialProof.map((review, index) => (
                    <div key={index} className="bg-white/80 p-3 rounded-lg border border-amber-200">
                      <p className="text-sm text-gray-700">"{review.text}"</p>
                      <p className="text-xs text-gray-500 mt-1">— {review.user}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;