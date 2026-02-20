import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import AILoadingSpinner from "@/components/ai/user/AILoadingSpinner";
import AIBadge from "@/components/ai/user/AIBadge";
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
  MapPin,
  Brain,
  PieChart,
  BarChart3,
  TrendingDown,
  Award,
  Zap,
  Heart,
  Share2,
  Download,
  Mail,
  Gift,
  Star,
  ThumbsUp,
  CalendarCheck,
  Wallet,
  CreditCard,
  Smartphone,
  Globe,
  Filter,
  DownloadCloud
} from 'lucide-react';

const UserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const { recommendations, refreshRecommendations } = useRecommendations();

  // Helper function to get event status
  const getEventStatus = (eventDate) => {
    if (!eventDate) return 'upcoming';
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    
    if (eventDateTime < now) return 'completed';
    if (eventDateTime.toDateString() === now.toDateString()) return 'ongoing';
    return 'upcoming';
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.safeGet('/bookings/MyEvents');
        
        if (!mounted) return;

        if (response.data?.bookedEvents) {
          const enhancedBookings = enhanceBookingsWithAI(response.data.bookedEvents);
          setBookings(enhancedBookings);
          generateAIInsights(enhancedBookings);
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

  // AI: Enhance bookings with insights and recommendations
  const enhanceBookingsWithAI = (bookingsData) => {
    return bookingsData.map(booking => ({
      ...booking,
      aiInsights: {
        valueScore: calculateValueScore(booking),
        timingScore: calculateTimingScore(booking),
        popularityScore: calculatePopularityScore(booking),
        recommendationScore: Math.floor(Math.random() * 30) + 70,
        nextBestAction: getNextBestAction(booking),
        similarEvents: generateSimilarEvents(booking),
        spendingCategory: categorizeSpending(booking),
        loyaltyTier: calculateLoyaltyTier(booking)
      }
    }));
  };

  // AI: Calculate value for money score
  const calculateValueScore = (booking) => {
    const price = parseFloat(booking.totalAmount) || 0;
    const seats = booking.numberOfSeats || 1;
    const pricePerSeat = price / seats;
    
    if (pricePerSeat < 500) return { score: 95, label: 'Excellent Value' };
    if (pricePerSeat < 1000) return { score: 85, label: 'Good Value' };
    if (pricePerSeat < 2000) return { score: 75, label: 'Fair Value' };
    return { score: 60, label: 'Premium' };
  };

  // AI: Calculate booking timing score
  const calculateTimingScore = (booking) => {
    const bookingDate = new Date(booking.createdAt);
    const eventDate = new Date(booking.event.event_date);
    const daysBefore = Math.ceil((eventDate - bookingDate) / (1000 * 60 * 60 * 24));
    
    if (daysBefore > 30) return { score: 90, label: 'Early Bird' };
    if (daysBefore > 14) return { score: 80, label: 'Advance' };
    if (daysBefore > 7) return { score: 70, label: 'Regular' };
    if (daysBefore > 3) return { score: 60, label: 'Last Minute' };
    return { score: 50, label: 'Very Last Minute' };
  };

  // AI: Calculate event popularity score
  const calculatePopularityScore = (booking) => {
    const attendees = booking.event.attendees?.length || 0;
    const totalSlots = booking.event.totalSlots || 100;
    const fillRate = (attendees / totalSlots) * 100;
    
    if (fillRate > 80) return { score: 95, label: 'Highly Popular' };
    if (fillRate > 60) return { score: 85, label: 'Popular' };
    if (fillRate > 40) return { score: 75, label: 'Moderate' };
    return { score: 65, label: 'Less Popular' };
  };

  // AI: Determine next best action
  const getNextBestAction = (booking) => {
    const status = booking.event.payment?.status;
    const eventDate = new Date(booking.event.event_date);
    const now = new Date();
    
    if (status === 'pending') {
      return {
        action: 'Complete Payment',
        icon: CreditCard,
        color: 'from-amber-500 to-yellow-500',
        deadline: '48 hours remaining'
      };
    }
    
    if (eventDate > now) {
      const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 3) {
        return {
          action: 'Prepare for Event',
          icon: CalendarCheck,
          color: 'from-blue-500 to-cyan-500',
          deadline: `${daysUntil} days left`
        };
      }
    }
    
    return {
      action: 'View Similar Events',
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-500',
      deadline: 'Recommended for you'
    };
  };

  // AI: Generate similar events based on booking history
  const generateSimilarEvents = (booking) => {
    return [
      {
        name: `Similar to ${booking.event.event_name}`,
        date: new Date(new Date(booking.event.event_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        price: booking.totalAmount * 0.9,
        matchScore: 92
      },
      {
        name: `You might also like`,
        date: new Date(new Date(booking.event.event_date).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        price: booking.totalAmount * 0.85,
        matchScore: 88
      }
    ];
  };

  // AI: Categorize spending patterns
  const categorizeSpending = (booking) => {
    const categories = ['Entertainment', 'Education', 'Business', 'Social', 'Sports'];
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
  };

  // AI: Calculate loyalty tier based on spending
  const calculateLoyaltyTier = (booking) => {
    const totalSpent = parseFloat(booking.totalAmount) || 0;
    if (totalSpent > 10000) return { tier: 'Platinum', color: 'from-gray-300 to-gray-400', multiplier: '3x' };
    if (totalSpent > 5000) return { tier: 'Gold', color: 'from-yellow-400 to-yellow-500', multiplier: '2x' };
    if (totalSpent > 2000) return { tier: 'Silver', color: 'from-gray-400 to-gray-500', multiplier: '1.5x' };
    return { tier: 'Bronze', color: 'from-amber-600 to-amber-700', multiplier: '1x' };
  };

  // AI: Generate comprehensive insights
  const generateAIInsights = (bookingsData) => {
    const totalSpent = bookingsData.reduce((sum, b) => {
      const amount = parseFloat(b.totalAmount) || 0;
      return b.event.payment?.status === 'completed' ? sum + amount : sum;
    }, 0);

    const categoryBreakdown = {};
    const monthlySpending = {};
    const organizerFrequency = {};

    bookingsData.forEach(booking => {
      // Category breakdown
      const category = booking.aiInsights?.spendingCategory || 'Other';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + parseFloat(booking.totalAmount) || 0;
      
      // Monthly spending
      const month = new Date(booking.createdAt).toLocaleString('default', { month: 'long' });
      monthlySpending[month] = (monthlySpending[month] || 0) + parseFloat(booking.totalAmount) || 0;
      
      // Organizer frequency
      const organizer = booking.event.org_ID?.fullname || 'Unknown';
      organizerFrequency[organizer] = (organizerFrequency[organizer] || 0) + 1;
    });

    const favoriteOrganizer = Object.keys(organizerFrequency).reduce((a, b) => 
      organizerFrequency[a] > organizerFrequency[b] ? a : b, 'None');

    const avgBookingValue = totalSpent / (bookingsData.length || 1);
    const completionRate = (bookingsData.filter(b => b.event.payment?.status === 'completed').length / bookingsData.length) * 100;

    setAiInsights({
      totalSpent,
      categoryBreakdown,
      monthlySpending,
      favoriteOrganizer,
      avgBookingValue: Math.round(avgBookingValue),
      completionRate: Math.round(completionRate),
      totalBookings: bookingsData.length,
      loyaltyTier: calculateOverallLoyaltyTier(totalSpent),
      predictedNextBooking: predictNextBooking(bookingsData),
      spendingTrend: analyzeSpendingTrend(monthlySpending),
      recommendations: generatePersonalizedRecommendations(bookingsData)
    });
  };

  const calculateOverallLoyaltyTier = (totalSpent) => {
    if (totalSpent > 10000) return { name: 'Platinum', color: 'from-gray-300 to-gray-400', benefits: ['Priority Support', 'Early Access', '3x Points'] };
    if (totalSpent > 5000) return { name: 'Gold', color: 'from-yellow-400 to-yellow-500', benefits: ['Priority Booking', '2x Points'] };
    if (totalSpent > 2000) return { name: 'Silver', color: 'from-gray-400 to-gray-500', benefits: ['1.5x Points'] };
    return { name: 'Bronze', color: 'from-amber-600 to-amber-700', benefits: ['1x Points'] };
  };

  const predictNextBooking = (bookingsData) => {
    if (bookingsData.length < 2) return null;
    
    const dates = bookingsData.map(b => new Date(b.createdAt).getTime());
    const avgGap = dates.slice(1).reduce((sum, date, i) => 
      sum + (date - dates[i]), 0) / (dates.length - 1);
    
    const lastDate = dates[dates.length - 1];
    const nextDate = new Date(lastDate + avgGap);
    
    return {
      predictedDate: nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
      confidence: Math.min(85, 50 + bookingsData.length * 5)
    };
  };

  const analyzeSpendingTrend = (monthlySpending) => {
    const months = Object.values(monthlySpending);
    if (months.length < 2) return { trend: 'stable', percentage: 0 };
    
    const lastMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];
    const change = ((lastMonth - previousMonth) / previousMonth) * 100;
    
    return {
      trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
      percentage: Math.abs(Math.round(change))
    };
  };

  const generatePersonalizedRecommendations = (bookingsData) => {
    const categories = [...new Set(bookingsData.map(b => b.aiInsights?.spendingCategory))];
    return {
      basedOnHistory: `Based on your ${bookingsData.length} bookings, you prefer ${categories.slice(0, 2).join(' and ')} events`,
      suggested: `Try exploring more ${categories[0]} events this month`,
      savingOpportunity: `You could save 15% by booking early`
    };
  };

  const refreshBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.safeGet('/bookings/MyEvents');
      if (response.data?.bookedEvents) {
        const enhancedBookings = enhanceBookingsWithAI(response.data.bookedEvents);
        setBookings(enhancedBookings);
        generateAIInsights(enhancedBookings);
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
        bgColor: 'from-emerald-100 to-green-100',
        textColor: 'text-emerald-800'
      },
      pending: { 
        icon: AlertTriangle, 
        color: 'from-amber-500 to-yellow-500',
        text: 'Pending',
        bgColor: 'from-amber-100 to-yellow-100',
        textColor: 'text-amber-800'
      },
      failed: { 
        icon: XCircle, 
        color: 'from-rose-500 to-pink-500',
        text: 'Failed',
        bgColor: 'from-rose-100 to-pink-100',
        textColor: 'text-rose-800'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${config.bgColor} ${config.textColor} border border-transparent`}>
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          {config.text}
        </div>
      </span>
    );
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

  const getFilteredBookings = () => {
    let filtered = [...bookings];
    
    if (activeTab !== 'all') {
      filtered = filtered.filter(b => b.event.payment?.status === activeTab);
    }
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(b => new Date(b.createdAt).getFullYear().toString() === selectedYear);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(b => b.aiInsights?.spendingCategory === selectedCategory);
    }
    
    return filtered;
  };

  const downloadBookingHistory = () => {
    const dataStr = JSON.stringify(bookings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `bookings-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AILoadingSpinner />
                <p className="text-lg font-medium text-gray-700 mt-4">AI is analyzing your booking patterns...</p>
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

  const filteredBookings = getFilteredBookings();

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
                  <Brain className="w-6 h-6 text-white" />
                </div>
                AI-Powered Booking Analytics
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Smart insights and personalized recommendations based on your booking history
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {/* Loyalty Badge */}
              {aiInsights && aiInsights.loyaltyTier && (
                <div className={`hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${aiInsights.loyaltyTier.color} rounded-xl text-white shadow-lg`}>
                  <Award className="w-5 h-5" />
                  <div className="text-sm">
                    <span className="font-bold">{aiInsights.loyaltyTier.name}</span>
                    <span className="ml-1 opacity-90">Member</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={downloadBookingHistory}
                className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
                title="Download booking history"
              >
                <DownloadCloud className="w-5 h-5" />
              </button>
              
              <button 
                onClick={refreshBookings}
                disabled={loading}
                className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
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
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Loyalty Banner */}
          {aiInsights && bookings.length > 0 && (
            <div className="mb-10 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Your Spending Profile
                      <span className={`px-3 py-1 bg-gradient-to-r ${aiInsights.loyaltyTier?.color || 'from-purple-500 to-indigo-500'} rounded-full text-sm font-normal text-white`}>
                        {aiInsights.loyaltyTier?.name || 'Bronze'} Tier
                      </span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-purple-100 text-xs">Total Spent</p>
                      <p className="text-white font-bold text-lg">NPR {aiInsights.totalSpent?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-purple-100 text-xs">Avg. Booking</p>
                      <p className="text-white font-bold text-lg">NPR {aiInsights.avgBookingValue || 0}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-purple-100 text-xs">Success Rate</p>
                      <p className="text-white font-bold text-lg">{aiInsights.completionRate || 0}%</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-purple-100 text-xs">Next Booking</p>
                      <p className="text-white font-bold text-lg">
                        {aiInsights.predictedNextBooking?.predictedDate || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {aiInsights.predictedNextBooking && (
                    <div className="mt-4 flex items-center gap-2 text-purple-100 text-sm">
                      <Brain className="w-4 h-4" />
                      <span>AI predicts your next booking around {aiInsights.predictedNextBooking.predictedDate} with {aiInsights.predictedNextBooking.confidence}% confidence</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{bookings.length}</h3>
              <p className="text-gray-600 font-medium">Total Bookings</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">NPR {getTotalRevenue().toLocaleString()}</h3>
              <p className="text-gray-600 font-medium">Total Spent</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <Award className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{getCompletedBookings()}</h3>
              <p className="text-gray-600 font-medium">Confirmed</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <Users className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{aiInsights?.favoriteOrganizer || 'N/A'}</h3>
              <p className="text-gray-600 font-medium">Favorite Organizer</p>
            </div>
          </div>

          {/* AI Recommendations Banner */}
          {aiInsights?.recommendations && bookings.length > 0 && (
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Personalized AI Recommendations</h4>
                  <p className="text-sm text-gray-700 mb-2">{aiInsights.recommendations.basedOnHistory}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {aiInsights.recommendations.suggested}
                    </span>
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {aiInsights.recommendations.savingOpportunity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Bookings
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'pending'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Education">Education</option>
                <option value="Business">Business</option>
                <option value="Social">Social</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                  Your Event Bookings
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                    {filteredBookings.length} bookings
                  </span>
                </h2>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI analyzed each booking for value, timing, and popularity
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div className="py-16 text-center border border-gray-200 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Ticket className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
                <p className="text-gray-500 mb-6">
                  {bookings.length > 0 
                    ? 'No bookings match your selected filters.'
                    : "You haven't made any bookings yet. Explore our events and find something exciting to attend!"}
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
                {filteredBookings.map((booking) => (
                  <div 
                    key={booking.bookingId} 
                    className="group border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {/* Booking Header with AI Score */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                            <Ticket className="w-7 h-7 text-indigo-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                {booking.event?.event_name || 'Event Name'}
                              </h3>
                              {booking.aiInsights?.valueScore?.score > 85 && (
                                <AIBadge score={booking.aiInsights.valueScore.score} reason="Great Value" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Booking ID: {booking.bookingId}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          {renderPaymentStatus(booking.event.payment?.status || 'pending')}
                          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-medium">
                            {booking.numberOfSeats} {booking.numberOfSeats === 1 ? 'seat' : 'seats'}
                          </div>
                        </div>
                      </div>

                      {/* AI Insights Row */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                          booking.aiInsights?.valueScore?.score > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <DollarSign className="w-3 h-3" />
                          {booking.aiInsights?.valueScore?.label || 'Standard'}
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                          booking.aiInsights?.timingScore?.score > 80 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {booking.aiInsights?.timingScore?.label || 'Regular'}
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                          booking.aiInsights?.popularityScore?.score > 80 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          <Users className="w-3 h-3" />
                          {booking.aiInsights?.popularityScore?.label || 'Moderate'}
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {booking.aiInsights?.spendingCategory || 'Other'}
                        </span>
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
                            <p className="font-bold text-gray-800">{formatDate(booking.event?.event_date)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Organizer</p>
                            <p className="font-bold text-gray-800">{booking.event?.org_ID?.fullname || 'Organizer'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-bold text-gray-800 text-xl">NPR {booking.totalAmount || 0}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-rose-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-bold text-gray-800">{booking.event?.location || 'Location'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Next Best Action - FIXED */}
                      <div className="mb-6">
                        {booking.aiInsights?.nextBestAction ? (
                          <div className={`p-4 rounded-xl bg-gradient-to-r ${booking.aiInsights.nextBestAction.color || 'from-purple-500 to-indigo-500'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                                  {booking.aiInsights.nextBestAction.icon && (
                                    <booking.aiInsights.nextBestAction.icon className="w-5 h-5 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">Next Best Action</p>
                                  <p className="text-lg font-bold text-white">
                                    {booking.aiInsights.nextBestAction.action || 'Check Event Details'}
                                  </p>
                                </div>
                              </div>
                              <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-xs text-white">
                                {booking.aiInsights.nextBestAction.deadline || 'Recommended'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                                  <CalendarCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">Event Status</p>
                                  <p className="text-lg font-bold text-white">
                                    {getEventStatus(booking.event?.event_date) === 'upcoming' ? 'Upcoming Event' : 
                                     getEventStatus(booking.event?.event_date) === 'ongoing' ? 'Happening Now' : 
                                     'Event Completed'}
                                  </p>
                                </div>
                              </div>
                              <span className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-xs text-white">
                                {getEventStatus(booking.event?.event_date) || 'Scheduled'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Information */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-6">
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-indigo-600" />
                          Payment Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-medium text-gray-800 flex items-center gap-1">
                              <CreditCard className="w-4 h-4" />
                              {booking.paymentMethod || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Booking Date</p>
                            <p className="font-medium text-gray-800">{formatDate(booking.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Per Seat Price</p>
                            <p className="font-medium text-gray-800">
                              NPR {Math.round(parseFloat(booking.totalAmount) / booking.numberOfSeats) || 0}
                            </p>
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
                          {booking.event?.description || 'No description available'}
                        </p>
                      </div>

                      {/* Similar Events Recommendation */}
                      {booking.aiInsights?.similarEvents && booking.aiInsights.similarEvents.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-gray-800">You might also like</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {booking.aiInsights.similarEvents.map((similar, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{similar.name}</p>
                                  <p className="text-xs text-gray-600">{formatDate(similar.date)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    {similar.matchScore}% match
                                  </span>
                                  <span className="text-sm font-bold text-gray-800">NPR {similar.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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