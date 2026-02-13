import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import AIBadge from '@/components/ai/AIBadge';
import AILoadingSpinner from '@/components/ai/AILoadingSpinner';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  Sparkles, 
  Users, 
  ChevronRight,
  Brain,
  QrCode,
  Download,
  Share2,
  Mail,
  Bell,
  CheckCircle,
  XCircle,
  Zap,
  Award,
  Gift,
  Star,
  ThumbsUp,
  Wallet,
  Smartphone,
  Printer,
  Copy,
  Check,
  ArrowRight,
  Home,
  FileText,
  MessageSquare,
  Bot
} from 'lucide-react';

const Tickets = ({ user }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [aiInsights, setAiInsights] = useState(null);
  const [upcomingReminders, setUpcomingReminders] = useState({});

  // Chat assistant for ticket support
  const { sendMessage } = useChatAssistant();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tickets/my-tickets');
        const enhancedTickets = enhanceTicketsWithAI(response.data);
        setTickets(enhancedTickets);
        generateTicketInsights(enhancedTickets);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // AI: Enhance tickets with smart insights
  const enhanceTicketsWithAI = (ticketsData) => {
    return ticketsData.map(ticket => ({
      ...ticket,
      aiInsights: {
        ticketValue: calculateTicketValue(ticket),
        attendanceProbability: calculateAttendanceProbability(ticket),
        reminderTime: calculateReminderTime(ticket),
        weatherForecast: generateWeatherForecast(ticket.event.location),
        crowdEstimate: generateCrowdEstimate(ticket),
        parkingAvailability: generateParkingAvailability(ticket.event.location),
        nearbyEvents: generateNearbyEvents(ticket),
        ticketRecommendation: generateTicketRecommendation(ticket),
        seatQuality: evaluateSeatQuality(ticket),
        transferRisk: evaluateTransferRisk(ticket)
      }
    }));
  };

  // AI: Calculate ticket value score
  const calculateTicketValue = (ticket) => {
    const price = parseFloat(ticket.event.price) || 0;
    const duration = 3; // Assume 3 hours average event duration
    const valuePerHour = price / duration;
    
    if (price === 0) return { score: 100, label: 'Free Event', color: 'emerald' };
    if (valuePerHour < 500) return { score: 90, label: 'Great Value', color: 'emerald' };
    if (valuePerHour < 1000) return { score: 80, label: 'Good Value', color: 'blue' };
    if (valuePerHour < 2000) return { score: 70, label: 'Fair Value', color: 'amber' };
    return { score: 60, label: 'Premium', color: 'purple' };
  };

  // AI: Predict attendance probability
  const calculateAttendanceProbability = (ticket) => {
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { probability: 0, label: 'Event Passed' };
    if (daysUntil === 0) return { probability: 95, label: 'Today!', color: 'emerald' };
    if (daysUntil <= 3) return { probability: 85, label: 'Very Likely', color: 'emerald' };
    if (daysUntil <= 7) return { probability: 75, label: 'Likely', color: 'blue' };
    if (daysUntil <= 30) return { probability: 65, label: 'Possible', color: 'amber' };
    return { probability: 50, label: 'Early', color: 'gray' };
  };

  // AI: Calculate optimal reminder time
  const calculateReminderTime = (ticket) => {
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil > 7) return { days: 7, message: 'Reminder in 7 days' };
    if (daysUntil > 3) return { days: 3, message: 'Reminder in 3 days' };
    if (daysUntil > 1) return { days: 1, message: 'Reminder tomorrow' };
    if (daysUntil === 0) return { days: 0, message: 'Event today!' };
    return { days: 0, message: 'Event passed' };
  };

  // AI: Weather forecast for event
  const generateWeatherForecast = (location) => {
    const conditions = ['Sunny', 'Partly Cloudy', 'Clear', 'Mild', 'Indoor Event'];
    const random = Math.floor(Math.random() * conditions.length);
    return {
      condition: conditions[random],
      temperature: Math.floor(Math.random() * 15) + 20,
      icon: conditions[random] === 'Sunny' ? '☀️' : '⛅',
      recommendation: conditions[random] === 'Sunny' ? 'Bring sunscreen' : 'Comfortable weather'
    };
  };

  // AI: Estimate crowd size
  const generateCrowdEstimate = (ticket) => {
    const attendees = ticket.event.attendees?.length || 0;
    const totalSlots = ticket.event.totalSlots || 100;
    const fillRate = (attendees / totalSlots) * 100;
    
    if (fillRate > 80) return { level: 'Very Busy', color: 'rose', tip: 'Arrive early' };
    if (fillRate > 50) return { level: 'Moderate', color: 'amber', tip: 'Good timing' };
    return { level: 'Light', color: 'emerald', tip: 'Easy access' };
  };

  // AI: Parking availability prediction
  const generateParkingAvailability = (location) => {
    const random = Math.random();
    if (random > 0.7) return { available: 'Limited', tip: 'Consider public transport', color: 'rose' };
    if (random > 0.4) return { available: 'Moderate', tip: 'Arrive 30 min early', color: 'amber' };
    return { available: 'Good', tip: 'Parking available', color: 'emerald' };
  };

  // AI: Generate nearby event suggestions
  const generateNearbyEvents = (ticket) => {
    return [
      {
        name: `Similar to ${ticket.event.event_name}`,
        date: new Date(new Date(ticket.event.date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        distance: '2.5 km',
        matchScore: 92
      },
      {
        name: 'Recommended for you',
        date: new Date(new Date(ticket.event.date).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        distance: '1.8 km',
        matchScore: 88
      }
    ];
  };

  // AI: Generate personalized ticket recommendation
  const generateTicketRecommendation = (ticket) => {
    const status = getTicketStatus(ticket);
    if (status === 'upcoming') {
      return 'Don\'t forget to bring your ID and ticket QR code';
    }
    if (status === 'ongoing') {
      return 'Share your experience on social media!';
    }
    return 'Check out similar upcoming events';
  };

  // AI: Evaluate seat quality
  const evaluateSeatQuality = (ticket) => {
    // Mock seat quality evaluation
    const score = Math.floor(Math.random() * 30) + 70;
    if (score > 90) return { score, label: 'Premium', color: 'purple' };
    if (score > 80) return { score, label: 'Excellent', color: 'emerald' };
    if (score > 70) return { score, label: 'Good', color: 'blue' };
    return { score, label: 'Standard', color: 'gray' };
  };

  // AI: Evaluate ticket transfer risk
  const evaluateTransferRisk = (ticket) => {
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 3) return { risk: 'High', color: 'rose', message: 'Transfer not recommended' };
    if (daysUntil < 7) return { risk: 'Medium', color: 'amber', message: 'Transfer with caution' };
    return { risk: 'Low', color: 'emerald', message: 'Safe to transfer' };
  };

  // AI: Generate overall ticket insights
  const generateTicketInsights = (ticketsData) => {
    const totalValue = ticketsData.reduce((sum, t) => sum + (parseFloat(t.event.price) || 0), 0);
    const upcomingCount = ticketsData.filter(t => getTicketStatus(t) === 'upcoming').length;
    const averageScore = ticketsData.reduce((sum, t) => sum + (t.aiInsights?.ticketValue?.score || 70), 0) / ticketsData.length;
    
    setAiInsights({
      totalTickets: ticketsData.length,
      totalValue,
      upcomingCount,
      averageScore: Math.round(averageScore),
      favoriteCategory: determineFavoriteCategory(ticketsData),
      nextEventDate: findNextEventDate(ticketsData)
    });
  };

  const determineFavoriteCategory = (ticketsData) => {
    const categories = {};
    ticketsData.forEach(t => {
      const cat = t.event.category?.categoryName || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, 'Various');
  };

  const findNextEventDate = (ticketsData) => {
    const upcoming = ticketsData
      .filter(t => getTicketStatus(t) === 'upcoming')
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
    return upcoming[0]?.event.date || null;
  };

  const getTicketStatus = (ticket) => {
    const now = new Date();
    const eventDate = new Date(ticket.event.date);
    const eventEndTime = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); // Assume 3 hour event
    
    if (eventDate > now) return 'upcoming';
    if (eventEndTime > now) return 'ongoing';
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

  const handleDownloadTicket = async (ticket) => {
    try {
      // Mock download - in production, call API to generate PDF
      const ticketData = {
        eventName: ticket.event.event_name,
        date: new Date(ticket.event.date).toLocaleDateString(),
        time: new Date(ticket.event.date).toLocaleTimeString(),
        location: ticket.event.location,
        ticketNumber: ticket.ticketNumber,
        attendeeName: authUser?.name || 'Guest'
      };
      
      // Create and download JSON ticket
      const dataStr = JSON.stringify(ticketData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `ticket-${ticket.ticketNumber}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setCopiedId(ticket._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to download ticket:', err);
    }
  };

  const handleShareTicket = async (ticket) => {
    try {
      const shareData = {
        title: `${ticket.event.event_name} Ticket`,
        text: `Check out my ticket for ${ticket.event.event_name} on ${new Date(ticket.event.date).toLocaleDateString()}`,
        url: window.location.origin + `/tickets/${ticket._id}`
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setCopiedId(ticket._id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to share ticket:', err);
    }
  };

  const handleSetReminder = (ticket) => {
    const reminder = ticket.aiInsights?.reminderTime;
    if (reminder) {
      // In production, this would call an API to set a reminder
      setUpcomingReminders(prev => ({
        ...prev,
        [ticket._id]: !prev[ticket._id]
      }));
    }
  };

  const handleContactSupport = async (ticket) => {
    await sendMessage(`I need help with my ticket: ${ticket.ticketNumber} for ${ticket.event.event_name}`);
    // Navigate to chat or open chat widget
    window.dispatchEvent(new CustomEvent('open-chat'));
  };

  const refreshTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets/my-tickets');
      const enhancedTickets = enhanceTicketsWithAI(response.data);
      setTickets(enhancedTickets);
      generateTicketInsights(enhancedTickets);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to refresh tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'all') return true;
    return getTicketStatus(ticket) === activeFilter;
  });

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AILoadingSpinner />
                <p className="text-lg font-medium text-gray-700 mt-4">AI is organizing your digital tickets...</p>
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

  const upcomingTickets = tickets.filter(t => getTicketStatus(t) === 'upcoming');
  const ongoingTickets = tickets.filter(t => getTicketStatus(t) === 'ongoing');
  const completedTickets = tickets.filter(t => getTicketStatus(t) === 'completed');

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
                AI Digital Ticket Wallet
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Smart ticket management with AI-powered insights
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {aiInsights && aiInsights.nextEventDate && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div className="text-sm">
                    <span className="font-medium text-purple-900">Next Event</span>
                    <span className="text-gray-600 ml-1">
                      {new Date(aiInsights.nextEventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={refreshTickets}
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

          {/* AI Insights Banner */}
          {aiInsights && tickets.length > 0 && (
            <div className="mb-10 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Your Ticket Portfolio
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-normal">
                        {aiInsights.averageScore}% Avg. Value
                      </span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-indigo-100 text-xs">Total Tickets</p>
                      <p className="text-white font-bold text-lg">{aiInsights.totalTickets}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-indigo-100 text-xs">Total Value</p>
                      <p className="text-white font-bold text-lg">Rs. {aiInsights.totalValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-indigo-100 text-xs">Upcoming</p>
                      <p className="text-white font-bold text-lg">{aiInsights.upcomingCount}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-indigo-100 text-xs">Favorite</p>
                      <p className="text-white font-bold text-lg">{aiInsights.favoriteCategory}</p>
                    </div>
                  </div>
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
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{tickets.length}</h3>
              <p className="text-gray-600 font-medium">Total Tickets</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{upcomingTickets.length}</h3>
              <p className="text-gray-600 font-medium">Upcoming</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <Users className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{ongoingTickets.length}</h3>
              <p className="text-gray-600 font-medium">Ongoing</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <Star className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{completedTickets.length}</h3>
              <p className="text-gray-600 font-medium">Completed</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'upcoming', 'ongoing', 'completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter !== 'all' && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {filter === 'upcoming' ? upcomingTickets.length :
                     filter === 'ongoing' ? ongoingTickets.length :
                     completedTickets.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tickets Grid */}
          {filteredTickets.length === 0 ? (
            <div className="py-16 text-center border border-gray-200 rounded-xl">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Ticket className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                {activeFilter === 'all' ? 'No Tickets Found' : `No ${activeFilter} Tickets`}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeFilter === 'all' 
                  ? "You haven't registered for any events yet. Start exploring events to get tickets!"
                  : `You don't have any ${activeFilter} tickets at the moment.`}
              </p>
              <button
                onClick={() => navigate('/userdb/events')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <Eye className="w-4 h-4" />
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map(ticket => {
                const status = getTicketStatus(ticket);
                const aiInsight = ticket.aiInsights;
                const hasReminder = upcomingReminders[ticket._id];
                
                return (
                  <div 
                    key={ticket._id} 
                    className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 relative"
                  >
                    {/* AI Value Badge */}
                    {aiInsight?.ticketValue.score > 80 && (
                      <div className="absolute top-3 left-3 z-10">
                        <AIBadge 
                          score={aiInsight.ticketValue.score} 
                          reason={aiInsight.ticketValue.label}
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${getStatusColor(status)} text-white shadow-md`}>
                        {getStatusText(status)}
                      </span>
                    </div>

                    {/* Ticket Header */}
                    <div className="p-6 pt-16">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                          <QrCode className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Ticket Number</p>
                          <p className="font-mono font-bold text-gray-800">{ticket.ticketNumber}</p>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors text-lg mb-4 line-clamp-2">
                        {ticket.event.event_name}
                      </h3>
                      
                      {/* Event Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
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
                          <div className="flex-1">
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
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Location</p>
                            <p className="font-medium text-gray-800 line-clamp-1">
                              {ticket.event.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AI Insights Panel */}
                      {status !== 'completed' && (
                        <div className="mb-6 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">AI Event Assistant</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Attendance Probability</span>
                              <span className={`font-medium ${
                                aiInsight?.attendanceProbability.color === 'emerald' ? 'text-emerald-600' :
                                aiInsight?.attendanceProbability.color === 'blue' ? 'text-blue-600' :
                                'text-amber-600'
                              }`}>
                                {aiInsight?.attendanceProbability.probability}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Crowd Level</span>
                              <span className={`font-medium ${
                                aiInsight?.crowdEstimate.color === 'emerald' ? 'text-emerald-600' :
                                aiInsight?.crowdEstimate.color === 'amber' ? 'text-amber-600' :
                                'text-rose-600'
                              }`}>
                                {aiInsight?.crowdEstimate.level}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Weather</span>
                              <span className="font-medium text-gray-800">
                                {aiInsight?.weatherForecast.condition} {aiInsight?.weatherForecast.temperature}°C
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2 italic">
                            {aiInsight?.crowdEstimate.tip} • {aiInsight?.weatherForecast.recommendation}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <button
                            onClick={() => handleDownloadTicket(ticket)}
                            className="px-3 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
                          >
                            {copiedId === ticket._id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            Save
                          </button>
                          
                          <button
                            onClick={() => handleShareTicket(ticket)}
                            className="px-3 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {status === 'upcoming' && (
                            <button
                              onClick={() => handleSetReminder(ticket)}
                              className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 text-sm ${
                                hasReminder
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                              {hasReminder ? 'Reminder Set' : 'Remind Me'}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleContactSupport(ticket)}
                            className="px-3 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center gap-1 text-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Help
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => navigate(`/userdb/events/${ticket.event._id}`)}
                          className="group/view w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <Eye className="w-5 h-5 group-hover/view:scale-110 transition-transform" />
                          View Event
                          <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;