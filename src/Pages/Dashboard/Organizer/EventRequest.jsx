// src/Pages/Landing/Organizer/EventRequest.jsx
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Calendar, MapPin, DollarSign, User, Filter, Check, X,
  Clock, Sparkles, Search, RefreshCw, AlertTriangle, TrendingUp,
  Target, Activity, Users, Bot, MessageSquare, Brain, Award, Zap
} from "lucide-react";
import AIBadge from "../../../components/ai/user/AIBadge";
import AILoadingSpinner from "../../../components/ai//user/AILoadingSpinner";
import { useNegotiation } from "../../../hooks/useNegotiation";

const EventRequest = () => {
  const [eventRequests, setEventRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Add these with your other useState declarations
  const [organizerId, setOrganizerId] = useState(null);



  // Form states for accept
  const [proposedBudget, setProposedBudget] = useState({});
  const [customMessage, setCustomMessage] = useState({});

  // Negotiation States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState({});

  const {
    submitOffer,
    getPriceAnalysis,
    acceptOffer,  // ✅ Make sure this is included
    rejectOffer,
    loading: aiLoading
  } = useNegotiation();


  useEffect(() => {
    // Get organizer ID from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = decoded.user?.id || decoded.id;
        setOrganizerId(id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Helper function to safely parse budget values
  const parseBudget = (budget) => {
    if (budget === null || budget === undefined) return 0;
    const budgetStr = budget.toString();
    const numericValue = budgetStr.replace(/[^0-9]/g, '');
    return parseInt(numericValue) || 0;
  };

  const handleProposedBudgetChange = (eventId, value) => {
    setProposedBudget((prevState) => ({
      ...prevState,
      [eventId]: value,
    }));

    // Auto-suggest optimal price based on budget
    if (value && eventRequests.find(r => r._id === eventId)) {
      const request = eventRequests.find(r => r._id === eventId);
      const budgetNum = parseInt(value);
      const requestBudget = parseBudget(request.budget);

      if (budgetNum > requestBudget * 1.2) {
        setAiSuggestions(prev => ({
          ...prev,
          [eventId]: {
            type: 'warning',
            message: 'Your price is 20% above their budget. Consider lowering for better chances.'
          }
        }));
      } else if (budgetNum < requestBudget * 0.8) {
        setAiSuggestions(prev => ({
          ...prev,
          [eventId]: {
            type: 'success',
            message: 'Competitive price! You have a good chance of winning this bid.'
          }
        }));
      }
    }
  };

  const handleCustomMessageChange = (eventId, value) => {
    setCustomMessage((prevState) => ({
      ...prevState,
      [eventId]: value,
    }));
  };

  useEffect(() => {
    const fetchEventRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const url = `${import.meta.env.VITE_API_URL}/eventrequest/event-requests${filter ? `?eventType=${filter}` : ""
          }`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEventRequests(data);
        } else {
          setError("Failed to fetch event requests. Please try again.");
        }
      } catch (error) {
        setError("Error fetching event requests: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventRequests();
  }, [filter, refreshCount]);

  const handleFilterChange = (event) => setFilter(event.target.value);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleRefresh = () => setRefreshCount(prev => prev + 1);

  // ============ MANUAL ACCEPT FLOW ============
  const handleAccept = async (eventId, proposedBudgetValue = "", customMsg = "") => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      const decodedToken = jwtDecode(token);
      const organizerId = decodedToken.user?.id;

      if (!organizerId) {
        alert("Organizer ID is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/eventrequest/event-request/${eventId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizerId,
            proposedBudget: proposedBudgetValue,
            customMessage: customMsg
          }),
        }
      );

      if (response.ok) {
        alert("✅ Event request accepted successfully!");
        handleRefresh();
      } else {
        alert("❌ Error accepting event request");
      }
    } catch (error) {
      console.error("Error accepting event request:", error);
      alert("❌ Error accepting event request");
    }
  };

  // ============ MANUAL REJECT FLOW ============
  const handleReject = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/eventrequest/event-request/${eventId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("✅ Event request rejected successfully");
         // ✅ FIX: Remove the request from the local state immediately
      setEventRequests(prevRequests => 
        prevRequests.filter(request => request._id !== eventId)
      );

      // Also clear any form data for this request
      setProposedBudget(prev => {
        const newState = { ...prev };
        delete newState[eventId];
        return newState;
      });
      
      setCustomMessage(prev => {
        const newState = { ...prev };
        delete newState[eventId];
        return newState;
      });
        // handleRefresh();
        
      } else {
        alert("❌ Error rejecting event request");
      }
    } catch (error) {
      console.error("Error rejecting event request:", error);
      alert("❌ Error rejecting event request");
    }
  };

  // ============ NEGOTIATION FLOW ============
  const handleOpenNegotiation = async (request) => {
    setSelectedRequest(request);

    const budgetNum = parseBudget(request.budget);

    // Get AI price analysis from backend (counter-offer.js)
    const analysis = await getPriceAnalysis(
      request.eventType,
      request.venue,
      budgetNum
    );

    setAiAnalysis(analysis);
    setShowNegotiationModal(true);
  };

  const handleSubmitNegotiation = async () => {
    if (!selectedRequest) return;

    try {
      // Create negotiation record in database
      const result = await submitOffer(
        selectedRequest._id,
        {
          proposedPrice: parseInt(proposedBudget[selectedRequest._id] || parseBudget(selectedRequest.budget)),
          proposedDate: selectedRequest.date?.split('T')[0] || '',
          customMessage: customMessage[selectedRequest._id] || "I'm interested in negotiating"
        }
      );

      if (result?.success) {
        alert("✅ Negotiation started! The user will see your offer.");
        setShowNegotiationModal(false);
        handleRefresh();
      }
    } catch (err) {
      alert("❌ Failed to start negotiation: " + err.message);
    }
  };

  // ============ COUNTER OFFER HANDLERS ============

 const handleAcceptCounter = async (negotiationId, amount) => {
    try {
      const result = await acceptOffer(negotiationId);
      if (result?.success) {
        alert(`✅ You accepted NPR ${amount.toLocaleString()}! Deal done.`);
        handleRefresh();
      }
    } catch (error) {
      alert('❌ Failed to accept: ' + error.message);
    }
  };

const handleCounterCounter = async (negotiationId, userAmount) => {
  // Find the request that has this negotiation
  const request = eventRequests.find(r => 
    r.myNegotiationId === negotiationId
  );
  
  if (request) {
    setSelectedRequest(request);
    // Pre-fill with a reasonable counter (midpoint)
    const midPoint = Math.round((userAmount + parseBudget(request.budget)) / 2);
    setProposedBudget({ [request._id]: midPoint });
    setShowNegotiationModal(true);
  }
};

  const handleRejectCounter = async (negotiationId) => {
    try {
      const result = await rejectOffer(negotiationId);
      if (result?.success) {
        alert('❌ Offer rejected');
        handleRefresh();
      }
    } catch (error) {
      alert('❌ Failed to reject: ' + error.message);
    }
  };




  const filteredEventRequests = eventRequests.filter(request => {
    const matchesFilter = filter === "" || request.eventType === filter;
    const matchesSearch = searchTerm === "" ||
      request.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.userId?.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

   // ✅ FIX: Use organizerId (from state) instead of currentOrganizerId
  const myResponse = request.interestedOrganizers?.find(
    org => org.organizerId?._id === organizerId ||
      org.organizerId?.toString() === organizerId?.toString()
  );
  // Hide if status is 'rejected'
  if (myResponse?.status === 'rejected') {
    return false;
  }

    return matchesFilter && matchesSearch;
  });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <ErrorDisplay error={error} onRefresh={handleRefresh} />;
  }

  return (
    <div className="min-h-screen p-4 space-y-8 md:p-6 bg-gradient-to-br from-gray-50 to-white">

      {/* Negotiation Modal */}
      {showNegotiationModal && selectedRequest && (
        <NegotiationModal
          request={selectedRequest}
          aiAnalysis={aiAnalysis}
          proposedBudget={proposedBudget[selectedRequest._id] || ""}
          onBudgetChange={(value) => setProposedBudget(prev => ({ ...prev, [selectedRequest._id]: value }))}
          customMessage={customMessage[selectedRequest._id] || ""}
          onMessageChange={(value) => setCustomMessage(prev => ({ ...prev, [selectedRequest._id]: value }))}
          onSubmit={handleSubmitNegotiation}
          onClose={() => setShowNegotiationModal(false)}
          loading={aiLoading}
          parseBudget={parseBudget}
        />
      )}

      {/* Header */}
      <HeaderSection onRefresh={handleRefresh} />

      {/* Stats */}
      <StatsSection requests={eventRequests} parseBudget={parseBudget} />

      {/* Filter and Search */}
      <FilterSection
        filter={filter}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Event Requests Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        {filteredEventRequests.length > 0 ? (
          filteredEventRequests.map((request) => {
            const winProb = proposedBudget[request._id]
              ? getWinProbability(request, proposedBudget[request._id])
              : null;

            // Get current organizer ID from token
            const token = localStorage.getItem("token");
            const decodedToken = token ? jwtDecode(token) : null;
            const currentOrganizerId = decodedToken?.user?.id;

            return (
              <RequestCard
                key={request._id}
                request={request}
                // Pass ALL the response data
                myResponse={request.myResponse}
                myStatus={request.myStatus}
                myProposedBudget={request.myProposedBudget}
                myNegotiationId={request.myNegotiationId}
                hasUserCounter={request.hasUserCounter}

                // Pass current organizer ID
                currentOrganizerId={organizerId}

                proposedBudget={proposedBudget[request._id] || ""}
                onBudgetChange={(value) => handleProposedBudgetChange(request._id, value)}
                customMessage={customMessage[request._id] || ""}
                onMessageChange={(value) => handleCustomMessageChange(request._id, value)}

                // IMPORTANT: Add these counter handlers!
                onAcceptCounter={handleAcceptCounter}
                onCounterCounter={handleCounterCounter}
                onRejectCounter={handleRejectCounter}

                onAccept={handleAccept}
                onReject={handleReject}
                onNegotiate={() => handleOpenNegotiation(request)}
                aiSuggestion={aiSuggestions[request._id]}
                winProb={winProb}
                parseBudget={parseBudget}
              />
            );
          })
        ) : (
          <EmptyState filter={filter} searchTerm={searchTerm} onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
};

// ============ REQUEST CARD COMPONENT ============
const RequestCard = ({
  request,
  proposedBudget,
  onBudgetChange,
  customMessage,
  onMessageChange,
  onAccept,
  onReject,
  onNegotiate,
  onAcceptCounter,
  onCounterCounter,
  onRejectCounter,
  aiSuggestion,
  winProb,
  parseBudget,
  currentOrganizerId // 👈 Make sure to pass this from parent
}) => {
  const budgetNum = parseBudget(request.budget);

  // 👇 IMPORTANT: Find if this organizer already responded
  const myResponse = request.interestedOrganizers?.find(
    org => org.organizerId?._id === currentOrganizerId ||
      org.organizerId?.toString() === currentOrganizerId?.toString()
  );

  // 👇 Check if user has countered (status 'countered' means user responded)
  const hasUserCounter = myResponse?.status === 'countered';
  const userCounterAmount = myResponse?.proposedBudget;
  const userCounterMessage = myResponse?.message;
  const negotiationId = myResponse?.negotiationId;

  const eventTypeColors = {
    Wedding: "from-pink-500 to-rose-600",
    Birthday: "from-blue-500 to-cyan-600",
    Corporate: "from-gray-500 to-gray-700",
    Conference: "from-purple-500 to-violet-600",
    default: "from-green-500 to-emerald-600"
  };

  const eventTypeBg = {
    Wedding: "bg-gradient-to-br from-pink-50 to-rose-50",
    Birthday: "bg-gradient-to-br from-blue-50 to-cyan-50",
    Corporate: "bg-gradient-to-br from-gray-50 to-gray-100",
    Conference: "bg-gradient-to-br from-purple-50 to-violet-50",
    default: "bg-gradient-to-br from-green-50 to-emerald-50"
  };

  return (
    <div className={`${eventTypeBg[request.eventType] || eventTypeBg.default} group relative overflow-hidden rounded-2xl border border-gray-200 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}>

      {/* Event Type Badge */}
      <div className="absolute z-10 top-4 right-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg bg-gradient-to-r ${eventTypeColors[request.eventType] || eventTypeColors.default} text-white`}>
          {request.eventType}
        </span>
      </div>

      {/* Status Badge - Shows negotiation state */}
      {myResponse && (
        <div className="absolute z-10 top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${hasUserCounter
            ? 'bg-purple-500 text-white animate-pulse'
            : 'bg-yellow-500 text-white'
            }`}>
            {hasUserCounter ? '🔔 User Countered!' : '⏳ Offer Pending'}
          </span>
        </div>
      )}

      {/* Event Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">{getEventTypeIcon(request.eventType)}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{request.eventType} Event</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{new Date(request.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 p-3 border bg-white/50 backdrop-blur-sm rounded-xl border-white/80">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="mb-1 text-xs text-gray-500">Requested by</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {request.userId?.fullname || "Unknown User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {request.userId?.email || "No email provided"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 border bg-white/50 backdrop-blur-sm rounded-xl border-white/80">
              <div className="p-1.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <p className="text-sm font-semibold text-gray-800">NPR {budgetNum.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 border bg-white/50 backdrop-blur-sm rounded-xl border-white/80">
              <div className="p-1.5 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Venue</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{request.venue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className={`mb-4 p-3 rounded-lg ${aiSuggestion.type === 'success' ? 'bg-green-50 border-green-200' :
            aiSuggestion.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            } border`}>
            <div className="flex items-start gap-2">
              {aiSuggestion.type === 'success' ? (
                <Award className="w-4 h-4 text-green-500 mt-0.5" />
              ) : aiSuggestion.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
              ) : (
                <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
              )}
              <p className="text-sm">{aiSuggestion.message}</p>
            </div>
          </div>
        )}

        {/* 👇 CASE 1: USER COUNTERED - MOST IMPORTANT! */}
        {hasUserCounter && (
          <div className="p-4 mb-6 bg-purple-100 border-2 border-purple-400 rounded-xl animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-purple-700" />
              <span className="font-bold text-purple-800">🔔 USER SENT A COUNTER OFFER!</span>
            </div>

            <div className="p-4 mb-4 bg-white rounded-lg">
              <p className="text-sm text-gray-500">User's counter offer:</p>
              <p className="text-2xl font-bold text-purple-600">
                NPR {userCounterAmount?.toLocaleString()}
              </p>
              {userCounterMessage && (
                <p className="mt-2 text-sm italic text-gray-700">
                  "{userCounterMessage}"
                </p>
              )}
            </div>

            {/* Action Buttons for Counter */}
            <div className="flex gap-3">
              <button
                onClick={() => onAcceptCounter(negotiationId, userCounterAmount)}
                className="flex-1 py-3 font-medium text-white rounded-lg bg-emerald-500 hover:bg-emerald-600"
              >
                ✅ Accept {userCounterAmount?.toLocaleString()}
              </button>
              <button
                onClick={() => onCounterCounter(negotiationId, userCounterAmount)}
                className="flex-1 py-3 font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                🔄 Counter
              </button>
              <button
                onClick={() => onRejectCounter(negotiationId)}
                className="flex-1 py-3 font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        )}

        {/* 👇 CASE 2: Organizer already responded, waiting for user */}
        {myResponse && !hasUserCounter && (
          <div className="p-4 mb-6 border border-yellow-200 bg-yellow-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-yellow-700">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Your offer is pending</span>
            </div>
            <p className="text-lg font-semibold">NPR {myResponse.proposedBudget?.toLocaleString()}</p>
            <p className="mt-2 text-sm text-gray-600">Waiting for user to respond...</p>
          </div>
        )}

        {/* 👇 CASE 3: No response yet - Show input fields */}
        {!myResponse && (
          <>
            {/* Proposed Budget Input */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Your Proposed Budget (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="number"
                  value={proposedBudget}
                  onChange={(e) => onBudgetChange(e.target.value)}
                  placeholder="Enter your budget"
                  className="w-full py-3 pl-10 pr-4 transition-all duration-300 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Win Probability */}
            {winProb && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Win Probability</span>
                  <span className={`text-xs font-semibold ${winProb.color}`}>
                    {winProb.value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${winProb.value === 'High' ? 'bg-green-500' :
                      winProb.value === 'Medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    style={{
                      width: winProb.value === 'High' ? '80%' :
                        winProb.value === 'Medium' ? '50%' : '20%'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Custom Message */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Custom Message (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Add a personal message to increase your chances..."
                className="w-full px-4 py-3 transition-all duration-300 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="2"
              />
            </div>
          </>
        )}
      </div>

      {/* 👇 Action Buttons - Different for each case */}
      <div className="p-6 pt-0">
        {!myResponse ? (
          // No response yet - Show Accept/Negotiate/Reject
          <div className="flex gap-3">
            <button
              onClick={() => onAccept(request._id, proposedBudget, customMessage)}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-all duration-300 shadow-lg rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 hover:shadow-xl"
            >
              <Check className="w-5 h-5" />
              <span>Accept</span>
            </button>

            <button
              onClick={onNegotiate}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-medium text-white transition-all duration-300 shadow-lg rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Negotiate</span>
            </button>

            <button
              onClick={() => onReject(request._id)}
              className="flex items-center justify-center px-4 py-3 font-medium text-gray-700 transition-all duration-300 shadow-md rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : !hasUserCounter ? (
          // Already responded, waiting - Show View Details button
          <button
            onClick={onNegotiate}
            className="w-full py-3 font-medium text-white transition-all duration-300 bg-yellow-500 rounded-xl hover:bg-yellow-600"
          >
            View Negotiation Status
          </button>
        ) : null}
        {/* If user countered, buttons are shown in the purple section above */}
      </div>
    </div>
  );
};
// ============ NEGOTIATION MODAL ============
const NegotiationModal = ({ request, aiAnalysis, proposedBudget, onBudgetChange, customMessage, onMessageChange, onSubmit, onClose, loading, parseBudget }) => {
  const budgetNum = parseBudget(request.budget);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-2xl">
        <div className="p-6 text-white border-b bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Brain className="w-5 h-5" />
              AI Negotiation Assistant
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* AI Price Analysis */}
          {aiAnalysis && (
            <div className="p-4 border border-purple-200 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium text-purple-900">AI Market Analysis</h3>
              </div>

              {aiAnalysis.marketAnalysis?.estimatedPrice && (
                <p className="mb-2 text-sm text-gray-700">
                  Market Price: NPR {aiAnalysis.marketAnalysis.estimatedPrice.toLocaleString()}
                </p>
              )}

              {aiAnalysis.validation?.suggestion && (
                <p className="text-xs text-gray-600">💡 {aiAnalysis.validation.suggestion}</p>
              )}

              {aiAnalysis.validation?.minReasonable && aiAnalysis.validation?.maxReasonable && (
                <p className="mt-1 text-xs text-gray-500">
                  Reasonable Range: NPR {aiAnalysis.validation.minReasonable.toLocaleString()} - {aiAnalysis.validation.maxReasonable.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Request Summary */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm"><span className="font-medium">Event:</span> {request.eventType} in {request.venue}</p>
            <p className="text-sm"><span className="font-medium">Budget:</span> NPR {budgetNum.toLocaleString()}</p>
            <p className="text-sm"><span className="font-medium">Date:</span> {new Date(request.date).toLocaleDateString()}</p>
          </div>

          {/* Offer Form */}
          <div>
            <label className="block mb-1 text-sm font-medium">Your Offer (NPR)</label>
            <input
              type="number"
              value={proposedBudget}
              onChange={(e) => onBudgetChange(e.target.value)}
              placeholder="Enter your offer"
              className="w-full p-3 border rounded-xl"
            />

            {/* Quick suggestions */}
            {aiAnalysis?.marketAnalysis?.estimatedPrice && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onBudgetChange(Math.round(aiAnalysis.marketAnalysis.estimatedPrice * 0.9))}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  -10%
                </button>
                <button
                  onClick={() => onBudgetChange(aiAnalysis.marketAnalysis.estimatedPrice)}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  Market
                </button>
                <button
                  onClick={() => onBudgetChange(budgetNum)}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  Budget
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Message</label>
            <textarea
              value={customMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              rows={3}
              placeholder="Why should they choose you?"
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* Success Probability */}
          {proposedBudget && aiAnalysis?.marketAnalysis?.estimatedPrice && (
            <div className={`p-3 rounded-lg ${proposedBudget < aiAnalysis.marketAnalysis.estimatedPrice * 0.9 ? 'bg-green-50' :
              proposedBudget < aiAnalysis.marketAnalysis.estimatedPrice * 1.1 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
              <p className={`text-sm font-medium ${proposedBudget < aiAnalysis.marketAnalysis.estimatedPrice * 0.9 ? 'text-green-700' :
                proposedBudget < aiAnalysis.marketAnalysis.estimatedPrice * 1.1 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                <TrendingUp className="inline w-4 h-4 mr-1" />
                Success Probability: {
                  proposedBudget < aiAnalysis.marketAnalysis.estimatedPrice * 0.9 ? 'High' :
                    proposedBudget < aiAnalysis.marketAnalysis.estimatedPrice * 1.1 ? 'Medium' : 'Low'
                }
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 py-3 font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600"
            >
              {loading ? 'Submitting...' : 'Start Negotiation'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ HELPER FUNCTIONS ============
const getEventTypeIcon = (eventType) => {
  const icons = {
    Wedding: "💒",
    Sports: "⚽",
    Corporate: "🏢",
    Conference: "🎤",
    Birthday: "🎂",
    Party: "🎉"
  };
  return icons[eventType] || "🎉";
};

const getWinProbability = (request, proposedPrice) => {
  if (!proposedPrice) return null;

  const requestBudget = parseBudget(request.budget);
  const priceRatio = proposedPrice / requestBudget;

  if (priceRatio <= 0.9) return { value: 'High', color: 'text-green-600' };
  if (priceRatio <= 1.0) return { value: 'Medium', color: 'text-yellow-600' };
  return { value: 'Low', color: 'text-red-600' };
};

const parseBudget = (budget) => {
  if (budget === null || budget === undefined) return 0;
  const budgetStr = budget.toString();
  const numericValue = budgetStr.replace(/[^0-9]/g, '');
  return parseInt(numericValue) || 0;
};

// ============ HEADER & STATS COMPONENTS ============
const HeaderSection = ({ onRefresh }) => (
  <div className="p-6 border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50 rounded-2xl md:p-8">
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Event Requests</h1>
          <AIBadge type="organizer" agent="negotiation" />
        </div>
        <p className="text-lg text-gray-600">Manage and respond to incoming event opportunities</p>
      </div>

      <button onClick={onRefresh} className="flex items-center gap-2 px-5 py-3 font-medium text-gray-700 transition-all duration-300 shadow-md rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg">
        <RefreshCw className="w-5 h-5" />
        Refresh
      </button>
    </div>
  </div>
);

const StatsSection = ({ requests, parseBudget }) => {
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'open').length;
  const accepted = requests.filter(r => r.status === 'deal_done').length;
  const budget = requests.reduce((sum, r) => sum + parseBudget(r.budget), 0);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Requests" value={total} icon={Target} color="blue" />
      <StatCard title="Pending" value={pending} icon={Clock} color="green" />
      <StatCard title="Accepted" value={accepted} icon={Check} color="purple" />
      <StatCard title="Revenue Potential" value={`NPR ${budget.toLocaleString()}`} icon={DollarSign} color="orange" />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "from-blue-500 via-blue-600 to-indigo-600",
    green: "from-emerald-500 via-emerald-600 to-green-600",
    purple: "from-purple-500 via-purple-600 to-violet-600",
    orange: "from-amber-500 via-orange-600 to-yellow-600"
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br ${colorClasses[color]} p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-32 h-32 bg-white rounded-full -right-6 -top-6 opacity-20 blur-xl"></div>
        <div className="absolute w-32 h-32 bg-white rounded-full -left-6 -bottom-6 opacity-10 blur-xl"></div>
      </div>
      <div className="relative z-10">
        <div className="p-3 mb-4 rounded-xl bg-white/20 backdrop-blur-sm w-fit">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-sm font-medium tracking-wide text-white/90">{title}</h3>
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      </div>
    </div>
  );
};

const FilterSection = ({ filter, onFilterChange, searchTerm, onSearchChange }) => (
  <div className="p-6 border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50 rounded-2xl">
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-indigo-600" />
        <select value={filter} onChange={onFilterChange} className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
          <option value="">All Event Types</option>
          <option value="Wedding">💒 Wedding</option>
          <option value="Birthday">🎂 Birthday</option>
          <option value="Corporate">🏢 Corporate</option>
          <option value="Conference">🎤 Conference</option>
        </select>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-96">
    <RefreshCw className="w-16 h-16 text-blue-500 animate-spin" />
  </div>
);

const ErrorDisplay = ({ error, onRefresh }) => (
  <div className="p-6 border-l-4 border-red-500 bg-red-50 rounded-2xl">
    <AlertTriangle className="w-8 h-8 mb-2 text-red-500" />
    <p className="mb-4 text-red-600">{error}</p>
    <button onClick={onRefresh} className="px-4 py-2 text-white bg-red-500 rounded-lg">
      Try Again
    </button>
  </div>
);

const EmptyState = ({ filter, searchTerm, onRefresh }) => (
  <div className="p-12 text-center bg-white border border-gray-200 col-span-full rounded-2xl">
    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
    <h3 className="mb-3 text-2xl font-bold text-gray-800">No Event Requests Found</h3>
    <p className="mb-8 text-gray-600">
      {filter || searchTerm
        ? "No event requests match your current filter or search criteria."
        : "No event requests available at the moment. Check back soon!"
      }
    </p>
    <button onClick={onRefresh} className="px-8 py-4 text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
      Refresh Requests
    </button>
  </div>
);

export default EventRequest;