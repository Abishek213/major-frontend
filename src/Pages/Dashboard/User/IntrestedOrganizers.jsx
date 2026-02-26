// src/Pages/Landing/User/InterestedOrganizers.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useNegotiation } from '@/hooks/useNegotiation';
import AIBadge from "@/components/ai/user/AIBadge";
import AILoadingSpinner from "@/components/ai/user/AILoadingSpinner";
import {
  AlertTriangle, CheckCircle, XCircle, Users, MapPin, Calendar,
  DollarSign, FileText, MessageSquare, Phone, TrendingUp, Sparkles,
  Plus, RefreshCw, UserCircle, Clock, Award, Brain,
  Star, ThumbsUp, ThumbsDown, TrendingDown, BarChart3, Mail,
  Filter, X
} from 'lucide-react';

const InterestedOrganizers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventRequests, setEventRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState({});
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonList, setComparisonList] = useState([]);
  const [sortBy, setSortBy] = useState('matchScore');
  const [showFilters, setShowFilters] = useState(false);

  // Negotiation States
  const [negotiationModal, setNegotiationModal] = useState({
    show: false,
    organizer: null,
    event: null,
    negotiationId: null
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [counterOfferValue, setCounterOfferValue] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  // Use the real negotiation hook
  const {
    submitCounterOffer,
    getPriceAnalysis,
      getNegotiationDetails,  // Add this

    loading: negotiationLoading
  } = useNegotiation();

  useEffect(() => {
    const fetchEventRequests = async () => {
      try {
        setLoading(true);
        const response = await api.safeGet("/eventrequest/event-requests-for-user");

        if (response?.data?.eventRequests) {
          // Process each event request to include negotiation IDs
          const processedRequests = response.data.eventRequests.map(event => ({
            ...event,
            organizers: event.organizers?.map(org => ({
              ...org,
              // Make sure negotiationId is extracted from the response
              negotiationId: org.negotiationId || null
            }))
          }));

          setEventRequests(processedRequests);
          generateAIInsights(processedRequests);
        } else {
          setEventRequests([]);
        }
        setError(null);
      } catch (error) {
        console.log('Error fetching event requests:', error);
        if (error.status === 404) {
          setEventRequests([]);
          setError(null);
        } else {
          setError(error.message || 'Failed to fetch event requests');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventRequests();
  }, []);

  // Generate AI insights from real data
  const generateAIInsights = (requests) => {
    const insights = {};

    requests.forEach(request => {
      if (!request.organizers || request.organizers.length === 0) {
        insights[request._id] = {
          totalOrganizers: 0,
          marketInsight: "No organizers yet. Check back later.",
          recommendation: "Consider adjusting your criteria."
        };
        return;
      }

      const totalOrganizers = request.organizers.length;
      const avgMatchScore = request.organizers.reduce((sum, org) =>
        sum + (org.matchPercentage || 70), 0) / totalOrganizers;

      const budgets = request.organizers
        .map(o => o.proposedBudget || 0)
        .filter(b => b > 0);

      insights[request._id] = {
        totalOrganizers,
        avgMatchScore: Math.round(avgMatchScore),
        topMatchScore: Math.max(...request.organizers.map(o => o.matchPercentage || 0)),
        budgetRange: budgets.length > 0 ? {
          min: Math.min(...budgets),
          max: Math.max(...budgets),
          average: Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length)
        } : null,
        marketInsight: getMarketInsight(request, budgets)
      };
    });

    setAiInsights(insights);
  };

  const getMarketInsight = (request, budgets) => {
    if (!budgets || budgets.length === 0) {
      return "No proposals yet. Check back later.";
    }

    const avgBudget = budgets.reduce((a, b) => a + b, 0) / budgets.length;
    const ratio = avgBudget / request.budget;

    if (ratio < 0.9) {
      return "📊 Offers are below your budget - good opportunity!";
    } else if (ratio < 1.1) {
      return "📊 Offers align with your budget";
    } else {
      return "📊 Offers are above your budget. Consider negotiating.";
    }
  };

  const handleSelectOrganizer = async (eventId, organizerId) => {
  try {
    setLoading(true);

    // Add this at the top of your component or before the API call
console.log('🔍 API Base URL:', import.meta.env.VITE_API_URL);
console.log('🔍 Full URL being called:', `${import.meta.env.VITE_API_URL}/eventrequest/select-organizer`);
    
    const response = await api.safePut(
      '/eventrequest/select-organizer',
      { 
        eventId: eventId,  // Make sure these are correctly named
        organizerId: organizerId 
      }
    );

    if (response.status >= 200 && response.status < 300) {
      // Refresh the data
      const updatedResponse = await api.safeGet("/eventrequest/event-requests-for-user");
      
      if (updatedResponse?.data?.eventRequests) {
        setEventRequests(updatedResponse.data.eventRequests);
      }
      
      // Show success message
      alert('✅ Organizer selected successfully!');
      setError(null);
    }
  } catch (error) {
    console.error('Error selecting organizer:', error);
    
    // Better error message
    if (error.status === 404) {
      setError('Event request not found. It may have been deleted or modified.');
    } else {
      setError(error.message || 'An error occurred while selecting the organizer');
    }
  } finally {
    setLoading(false);
  }
};

  // In InterestedOrganizers.jsx - UPDATE this function

  const handleOpenNegotiation = async (organizer, event) => {
    setSelectedOrganizer(organizer);

    // IMPORTANT: Get the REAL negotiation ID from the organizer object
    // The negotiation ID should be stored in the organizer data from backend
    const negotiationId = organizer.negotiationId;

    if (!negotiationId) {
      console.error('❌ No negotiation ID found for this organizer');
      alert('Cannot start negotiation: No negotiation record found');
      return;
    }

    console.log('🔑 Using REAL negotiation ID:', negotiationId);


    // Get AI price analysis
    const analysis = await getPriceAnalysis(
      event.eventType,
      event.venue,
      event.budget
    );

    setAiAnalysis(analysis);

    // Set default counter offer (midpoint)
    const midPoint = Math.round(
      (event.budget + (organizer.proposedBudget || 0)) / 2
    );
    setCounterOfferValue(midPoint);
    setCounterMessage(`I'm interested in your proposal of NPR ${organizer.proposedBudget?.toLocaleString()}. Can we agree on NPR ${midPoint.toLocaleString()}?`);

    setNegotiationModal({
      show: true,
      organizer,
      event,
      negotiationId: negotiationId  // ✅ Use REAL ID from backend
    });
  };

  const handleSendCounterOffer = async () => {
    if (!negotiationModal.organizer || !negotiationModal.event) return;

    // IMPORTANT: Use the real negotiationId from the modal state
    const negotiationId = negotiationModal.negotiationId;

    if (!negotiationId || negotiationId.includes('undefined') || negotiationId.includes('neg_')) {
      console.error('❌ Invalid negotiation ID:', negotiationId);
      alert('Invalid negotiation ID. Please try again.');
      return;
    }

    try {
      console.log('📤 Sending counter offer with REAL ID:', negotiationId);

      const result = await submitCounterOffer(
        negotiationId,  // ✅ This should now be a REAL MongoDB ObjectId
        parseInt(counterOfferValue),
        counterMessage
      );

      if (result?.success) {
        alert('✅ Counter offer sent! Waiting for organizer response.');
        setNegotiationModal({ show: false, organizer: null, event: null, negotiationId: null });

        // Refresh the event requests
        const updatedResponse = await api.safeGet("/eventrequest/event-requests-for-user");
        setEventRequests(updatedResponse.data.eventRequests);
      }
    } catch (error) {
      console.error('❌ Counter offer error:', error);
      alert('❌ Failed to send counter offer: ' + error.message);
    }
  };

  const handleCompareOrganizer = (organizer) => {
    if (comparisonList.includes(organizer._id)) {
      setComparisonList(comparisonList.filter(id => id !== organizer._id));
    } else {
      if (comparisonList.length < 3) {
        setComparisonList([...comparisonList, organizer._id]);
      } else {
        setError('You can compare up to 3 organizers at once');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleCreateEventRequest = () => {
    navigate('/userdb/eventrequest');
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-amber-100 text-amber-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-rose-100 text-rose-800',
      deal_done: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRefresh={handleRefresh} />;
  if (!eventRequests?.length) return <EmptyState onCreateRequest={handleCreateEventRequest} />;

  return (
    <div className="p-4 space-y-8 md:p-6">

      {/* Error Alert */}
      {error && (
        <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <XCircle className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl">
        <div className="p-6 md:p-8">

          {/* Header */}
          <HeaderSection
            comparisonMode={comparisonMode}
            setComparisonMode={setComparisonMode}
            comparisonList={comparisonList}
            onRefresh={handleRefresh}
            onCreateRequest={handleCreateEventRequest}
          />

          {/* Stats Overview */}
          <StatsOverview eventRequests={eventRequests} aiInsights={aiInsights} />

          {/* Event Requests List */}
          <div className="space-y-8">
            {eventRequests.map((event) => (
              <EventRequestCard
                key={event._id}
                event={event}
                aiInsights={aiInsights}
                sortBy={sortBy}
                setSortBy={setSortBy}
                comparisonMode={comparisonMode}
                comparisonList={comparisonList}
                onCompare={handleCompareOrganizer}
                onSelectOrganizer={handleSelectOrganizer}
                onOpenNegotiation={handleOpenNegotiation}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Negotiation Modal */}
      {negotiationModal.show && (
        <NegotiationModal
          organizer={negotiationModal.organizer}
          event={negotiationModal.event}
          aiAnalysis={aiAnalysis}
          counterOfferValue={counterOfferValue}
          setCounterOfferValue={setCounterOfferValue}
          counterMessage={counterMessage}
          setCounterMessage={setCounterMessage}
          onSend={handleSendCounterOffer}
          onClose={() => setNegotiationModal({ show: false, organizer: null, event: null, negotiationId: null })}
          loading={negotiationLoading}
        />
      )}
    </div>
  );
};

// ============ HEADER SECTION ============
const HeaderSection = ({ comparisonMode, setComparisonMode, comparisonList, onRefresh, onCreateRequest }) => (
  <div className="flex flex-col justify-between mb-8 md:flex-row md:items-center">
    <div>
      <h1 className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
        <div className="flex items-center justify-center w-12 h-12 shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
          <Brain className="w-6 h-6 text-white" />
        </div>
        AI Organizer Matching
      </h1>
      <p className="flex items-center gap-2 text-gray-600">
        <Sparkles className="w-4 h-4 text-purple-500" />
        Review and negotiate with interested organizers
      </p>
    </div>

    <div className="flex items-center gap-3 mt-4 md:mt-0">
      <button
        onClick={() => setComparisonMode(!comparisonMode)}
        className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition ${comparisonMode ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        <BarChart3 className="w-5 h-5" />
        Compare ({comparisonList.length}/3)
      </button>
      <button onClick={onRefresh} className="p-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">
        <RefreshCw className="w-5 h-5" />
      </button>
      <button onClick={onCreateRequest} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
        <Plus className="w-5 h-5" />
        New Request
      </button>
    </div>
  </div>
);

// ============ STATS OVERVIEW ============
const StatsOverview = ({ eventRequests, aiInsights }) => {
  const totalMatches = eventRequests.reduce((acc, req) => acc + (req.organizers?.length || 0), 0);
  const avgBudget = eventRequests.reduce((acc, req) => {
    if (!req.organizers?.length) return acc;
    const avg = aiInsights[req._id]?.budgetRange?.average || 0;
    return acc + avg;
  }, 0) / eventRequests.length || 0;

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
      <StatCard title="Total Organizer Matches" value={totalMatches} icon={TrendingUp} color="indigo" />
      <StatCard title="Avg. Proposed Budget" value={`NPR ${Math.round(avgBudget).toLocaleString()}`} icon={DollarSign} color="emerald" />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-white border border-${color}-100 rounded-xl p-6 shadow-md`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="mb-1 text-3xl font-bold text-gray-800">{value}</h3>
    <p className="font-medium text-gray-600">{title}</p>
  </div>
);

// ============ EVENT REQUEST CARD ============
const EventRequestCard = ({
  event, aiInsights, sortBy, setSortBy, comparisonMode, comparisonList,
  onCompare, onSelectOrganizer, onOpenNegotiation, getStatusBadge
}) => {
  return (
    <div className="overflow-hidden transition border border-gray-200 shadow-lg rounded-xl hover:shadow-xl">

      {/* Event Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center bg-indigo-100 w-14 h-14 rounded-xl">
              <FileText className="text-indigo-600 w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{event.eventType || 'Event'} Request</h2>
              <p className="text-sm text-gray-600">Request ID: {event._id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(event.status)}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-xl">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="font-medium">{event.organizers?.length || 0} Organizers</span>
            </div>
          </div>
        </div>

        {/* AI Market Insights */}
        {aiInsights[event._id] && (
          <div className="p-4 mt-4 border border-purple-200 bg-purple-50 rounded-xl">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="mb-1 text-sm font-medium text-purple-900">AI Market Insight</p>
                <p className="text-sm text-gray-700">{aiInsights[event._id].marketInsight}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <DetailCard icon={MapPin} label="Venue" value={event.venue || 'Not specified'} color="blue" />
          <DetailCard icon={Calendar} label="Date" value={event.date ? new Date(event.date).toLocaleDateString() : 'Flexible'} color="emerald" />
          <DetailCard icon={DollarSign} label="Budget" value={`NPR ${event.budget?.toLocaleString() || '0'}`} color="amber" />
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-8">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold">
              <FileText className="w-5 h-5 text-indigo-600" />
              Event Description
            </h3>
            <div className="p-6 border bg-gray-50 rounded-xl">
              <p className="text-gray-700">{event.description}</p>
            </div>
          </div>
        )}

        {/* Organizers Section */}
        <OrganizersSection
          event={event}
          sortBy={sortBy}
          setSortBy={setSortBy}
          comparisonMode={comparisonMode}
          comparisonList={comparisonList}
          onCompare={onCompare}
          onSelectOrganizer={onSelectOrganizer}
          onOpenNegotiation={onOpenNegotiation}
          getStatusBadge={getStatusBadge}
        />
      </div>
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-4 border bg-gray-50 rounded-xl">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${color}-100 to-${color}-200 flex items-center justify-center`}>
      <Icon className={`w-5 h-5 text-${color}-600`} />
    </div>
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// ============ ORGANIZERS SECTION ============
const OrganizersSection = ({
  event, sortBy, setSortBy, comparisonMode, comparisonList,
  onCompare, onSelectOrganizer, onOpenNegotiation, getStatusBadge
}) => {
  if (!event.organizers?.length) {
    return (
      <div className="py-12 text-center border bg-gray-50 rounded-xl">
        <Users className="w-10 h-10 mx-auto mb-4 text-gray-400" />
        <p className="font-medium text-gray-600">No organizers have responded yet.</p>
        <p className="mt-2 text-sm text-gray-500">Check back later or create a new request.</p>
      </div>
    );
  }

  const sortedOrganizers = [...event.organizers].sort((a, b) => {
    if (sortBy === 'matchScore') return (b.matchPercentage || 0) - (a.matchPercentage || 0);
    if (sortBy === 'budget') return (a.proposedBudget || 0) - (b.proposedBudget || 0);
    return 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Brain className="w-5 h-5 text-indigo-600" />
          Organizer Responses ({event.organizers.length})
        </h3>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 text-sm border rounded-lg">
          <option value="matchScore">Sort by Match Score</option>
          <option value="budget">Sort by Budget</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sortedOrganizers.map((organizer, index) => (
          <OrganizerCard
            key={organizer._id}
            organizer={organizer}
            index={index}
            event={event}
            comparisonMode={comparisonMode}
            comparisonList={comparisonList}
            onCompare={onCompare}
            onSelectOrganizer={onSelectOrganizer}
            onOpenNegotiation={onOpenNegotiation}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </div>
    </div>
  );
};

// ============ ORGANIZER CARD ============
const OrganizerCard = ({
  organizer, index, event, comparisonMode, comparisonList,
  onCompare, onSelectOrganizer, onOpenNegotiation, getStatusBadge
}) => {
  return (
    <div className="relative p-6 transition-all bg-white border shadow-md rounded-xl hover:shadow-xl">

      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-500' : 'bg-amber-700'
          }`}>
          #{index + 1}
        </div>
      </div>

      {/* Compare Checkbox */}
      {comparisonMode && (
        <div className="absolute top-4 right-4">
          <input
            type="checkbox"
            checked={comparisonList.includes(organizer._id)}
            onChange={() => onCompare(organizer)}
            className="w-5 h-5 text-indigo-600 rounded"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center bg-indigo-100 w-14 h-14 rounded-xl">
            <UserCircle className="text-indigo-600 w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{organizer.fullname}</h4>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(organizer.status)}
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="text-center">
          <span className="text-2xl font-bold text-indigo-600">{organizer.matchPercentage || 0}%</span>
          <p className="text-xs text-gray-600">match</p>
        </div>
      </div>

      {/* Price */}
      <div className="p-3 mb-6 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-xs text-gray-600">Proposed Budget</p>
            <p className="font-bold text-gray-800">NPR {organizer.proposedBudget?.toLocaleString() || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Organizer's Proposal */}
      {organizer.message && (
        <div className="p-4 mb-6 border bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <p className="text-sm font-medium text-gray-800">Organizer's Proposal</p>
          </div>
          <p className="text-sm text-gray-700">{organizer.message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onSelectOrganizer(event._id, organizer._id || organizer.organizerId )}
          className="flex-1 py-3 font-medium text-white transition-all rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
        >
          <CheckCircle className="inline w-5 h-5 mr-2" />
          Select
        </button>
        <button
          onClick={() => onOpenNegotiation(organizer, event)}
          className="flex-1 py-3 font-medium text-white transition-all rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <MessageSquare className="inline w-5 h-5 mr-2" />
          Negotiate
        </button>
      </div>
    </div>
  );
};

// ============ NEGOTIATION MODAL ============
const NegotiationModal = ({
  organizer, event, aiAnalysis,
  counterOfferValue, setCounterOfferValue,
  counterMessage, setCounterMessage,
  onSend, onClose, loading
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-6 bg-white shadow-2xl rounded-2xl">

        {/* Header */}
        <div className="p-6 text-white border-b bg-gradient-to-r from-indigo-500 to-purple-500">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Brain className="w-5 h-5" />
            AI Negotiation Assistant
          </h2>
        </div>

        <div className="p-6 space-y-4">

          {/* AI Price Analysis */}
          {aiAnalysis && (
            <div className="p-4 border border-purple-200 bg-purple-50 rounded-xl">
              <h3 className="mb-2 font-medium text-purple-900">AI Market Analysis</h3>

              {aiAnalysis.marketAnalysis?.estimatedPrice && (
                <p className="mb-2 text-sm text-gray-700">
                  Market Price: NPR {aiAnalysis.marketAnalysis.estimatedPrice.toLocaleString()}
                </p>
              )}

              {aiAnalysis.validation?.suggestion && (
                <p className="text-xs text-gray-600">💡 {aiAnalysis.validation.suggestion}</p>
              )}
            </div>
          )}

          {/* Event Details */}
          <div className="p-4 rounded-lg bg-gray-50">
            <p className="text-sm"><span className="font-medium">Event:</span> {event.eventType} in {event.venue}</p>
            <p className="text-sm"><span className="font-medium">Your Budget:</span> NPR {event.budget?.toLocaleString()}</p>
            <p className="text-sm"><span className="font-medium">Organizer's Offer:</span> NPR {organizer.proposedBudget?.toLocaleString()}</p>
          </div>

          {/* Counter Offer Form */}
          <div>
            <label className="block mb-1 text-sm font-medium">Your Counter Offer (NPR)</label>
            <input
              type="number"
              value={counterOfferValue}
              onChange={(e) => setCounterOfferValue(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter your offer"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Message to Organizer</label>
            <textarea
              rows={3}
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              placeholder="Explain your counter offer..."
              className="w-full p-3 border rounded-lg resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onSend}
              disabled={loading || !counterOfferValue}
              className="flex-1 py-3 font-medium text-white rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Counter Offer'}
            </button>
            <button onClick={onClose} className="px-6 py-3 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ LOADING, ERROR, EMPTY STATES ============
const LoadingSpinner = () => (
  <div className="p-8 text-center">
    <AILoadingSpinner />
    <p className="mt-4 text-gray-600">Loading your event requests...</p>
  </div>
);

const ErrorDisplay = ({ error, onRefresh }) => (
  <div className="p-6 border-l-4 border-red-500 rounded-lg bg-red-50">
    <AlertTriangle className="w-6 h-6 mb-2 text-red-500" />
    <p className="mb-4 text-red-600">{error}</p>
    <button onClick={onRefresh} className="px-4 py-2 text-red-700 bg-red-100 rounded-lg">
      Try Again
    </button>
  </div>
);

const EmptyState = ({ onCreateRequest }) => (
  <div className="p-8 bg-white border border-gray-200 shadow-xl rounded-2xl">
    <div className="py-16 text-center">
      <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
        <Brain className="w-12 h-12 text-indigo-400" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-700">No Event Requests Found</h3>
      <p className="mb-6 text-gray-500">Create your first event request and let AI find the perfect organizers!</p>
      <button onClick={onCreateRequest} className="px-6 py-3 font-medium text-white rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
        <Plus className="inline w-4 h-4 mr-2" />
        Create New Event Request
      </button>
    </div>
  </div>
);

export default InterestedOrganizers;