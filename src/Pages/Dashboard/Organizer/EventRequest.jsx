  import { useState, useEffect } from "react";
  import { jwtDecode } from "jwt-decode";
  import { 
    Calendar, MapPin, DollarSign, User, Mail, Filter, Check, X, 
    Clock, Sparkles, Search, RefreshCw, AlertTriangle, TrendingUp, 
    Target, Activity, ChevronRight, Eye, Users, Tag, Phone,
    Bot, BarChart3, MessageSquare, Award, Zap
  } from "lucide-react";
  import NegotiationAssistant from "../../../components/ai/organizer/NegotiationAssistant";
  import OfferCompetitorAnalysis from "../../../components/ai/organizer/OfferCompetitorAnalysis";
  import AIBadge from "../../../components/ai/user/AIBadge";
  import { useNegotiation } from "../../../hooks/useOrganizerAI";

  const EventRequest = () => {
    const [eventRequests, setEventRequests] = useState([]);
    const [filter, setFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [proposedBudget, setProposedBudget] = useState({});
    const [customMessage, setCustomMessage] = useState({});
    const [error, setError] = useState("");
    const [refreshCount, setRefreshCount] = useState(0);
    
    // AI Assistant States
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [showCompetitorAnalysis, setShowCompetitorAnalysis] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState({});
    
    const { submitOffer, getCompetitorAnalysis, loading: aiLoading } = useNegotiation(selectedRequest?._id);

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
          const url = `${import.meta.env.VITE_API_URL}/eventrequest/event-requests${
            filter ? `?eventType=${filter}` : ""
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

    const handleFilterChange = (event) => {
      setFilter(event.target.value);
    };

    const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
    };

    const handleRefresh = () => {
      setRefreshCount(prev => prev + 1);
    };

    const handleOpenAIAssistant = (request) => {
      setSelectedRequest(request);
      setShowAIAssistant(true);
    };

    const handleCompetitorAnalysis = (request) => {
      setSelectedRequest(request);
      setShowCompetitorAnalysis(true);
      getCompetitorAnalysis(request._id);
    };

    const filteredEventRequests = eventRequests.filter(request => {
      const matchesFilter = filter === "" || request.eventType === filter;
      const matchesSearch = searchTerm === "" || 
        request.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.userId?.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });

    const handleAccept = async (eventId, proposedBudgetValue, customMsg = "") => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found. Please log in again.");
          return;
        }

        const decodedToken = jwtDecode(token);
        const organizerId = decodedToken.user?.id;

        if (!organizerId) {
          console.error("Organizer ID is not found in the token.");
          alert("Organizer ID is missing. Please log in again.");
          return;
        }

        // Use AI to enhance offer if available
        if (selectedRequest && showAIAssistant) {
          await submitOffer({
            proposedPrice: proposedBudgetValue,
            proposedDate: selectedRequest.date,
            customMessage: customMsg
          });
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
          setEventRequests((prevRequests) =>
            prevRequests.map((request) =>
              request._id === eventId
                ? {
                    ...request,
                    status: "deal_done",
                    interestedOrganizers: request.interestedOrganizers.map((org) =>
                      org.organizerId === organizerId
                        ? { ...org, status: "accepted", proposedBudget: proposedBudgetValue }
                        : org
                    ),
                  }
                : request
            )
          );
          alert("Event request accepted successfully");
          setShowAIAssistant(false);
          setSelectedRequest(null);
        } else {
          alert("Error accepting event request");
        }
      } catch (error) {
        console.error("Error accepting event request:", error);
        alert("Error accepting event request");
      }
    };

    const handleReject = async (eventId) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found. Please log in again.");
          return;
        }

        const decodedToken = jwtDecode(token);
        const organizerId = decodedToken.user?.id;

        if (!organizerId) {
          console.error("Organizer ID is not found in the token.");
          alert("Organizer ID is missing. Please log in again.");
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
          setEventRequests((prevRequests) =>
            prevRequests
              .map((request) =>
                request._id === eventId
                  ? {
                      ...request,
                      status: "open",
                      interestedOrganizers: request.interestedOrganizers.map((org) =>
                        org.organizerId === organizerId
                          ? { ...org, status: "rejected" }
                          : org
                      ),
                    }
                  : request
              )
              .filter((request) => request._id !== eventId)
          );
          alert("Event request rejected successfully");
        } else {
          alert("Error rejecting event request");
        }
      } catch (error) {
        console.error("Error rejecting event request:", error);
        alert("Error rejecting event request");
      }
    };

    const getWinProbability = (request, proposedPrice) => {
      if (!proposedPrice) return null;
      
      const requestBudget = parseBudget(request.budget);
      const priceRatio = proposedPrice / requestBudget;
      
      if (priceRatio <= 0.9) return { value: 'High', color: 'text-green-600', bg: 'bg-green-100' };
      if (priceRatio <= 1.0) return { value: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      return { value: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
    };

    const getEventTypeIcon = (eventType) => {
      const icons = {
        Wedding: "💒",
        Sports: "⚽",
        Corporate: "🏢",
        Political: "🏛️"
      };
      return icons[eventType] || "🎉";
    };

    const getEventTypeColor = (eventType) => {
      const colors = {
        Wedding: "from-pink-500 to-rose-600",
        Sports: "from-blue-500 to-cyan-600",
        Corporate: "from-gray-500 to-gray-700",
        Political: "from-purple-500 to-violet-600"
      };
      return colors[eventType] || "from-green-500 to-emerald-600";
    };

    const getEventTypeBg = (eventType) => {
      const colors = {
        Wedding: "bg-gradient-to-br from-pink-50 to-rose-50",
        Sports: "bg-gradient-to-br from-blue-50 to-cyan-50",
        Corporate: "bg-gradient-to-br from-gray-50 to-gray-100",
        Political: "bg-gradient-to-br from-purple-50 to-violet-50"
      };
      return colors[eventType] || "bg-gradient-to-br from-green-50 to-emerald-50";
    };

    const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
      const colorClasses = {
        blue: "from-blue-500 via-blue-600 to-indigo-600",
        green: "from-emerald-500 via-emerald-600 to-green-600", 
        purple: "from-purple-500 via-purple-600 to-violet-600",
        orange: "from-amber-500 via-orange-600 to-yellow-600"
      };

      return (
        <div className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br ${colorClasses[color]} p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white opacity-20 blur-xl"></div>
            <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-white opacity-10 blur-xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white/90 tracking-wide">{title}</h3>
              <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      );
    };

    const LoadingSpinner = () => (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Event Requests...</h3>
                <p className="text-gray-600">Fetching available event opportunities</p>
                <div className="mt-6 h-2 w-64 mx-auto bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (loading) return <LoadingSpinner />;

    if (error) {
      return (
        <div className="space-y-8 p-4 md:p-6">
          <div className="relative p-6 pl-16 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-2xl shadow-lg animate-fade-in">
            <div className="absolute left-6 top-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="pr-6">
              <h4 className="text-xl font-bold text-red-800 mb-3">Error Loading Event Requests</h4>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={handleRefresh}
                className="group px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    const totalRequests = eventRequests.length;
    const pendingRequests = eventRequests.filter(r => r.status === 'open').length;
    const acceptedRequests = eventRequests.filter(r => r.status === 'deal_done').length;
    const revenuePotential = eventRequests.reduce((sum, r) => {
      return sum + parseBudget(r.budget);
    }, 0);

    return (
      <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        {/* AI Assistant Modals */}
        {showAIAssistant && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Bot className="w-6 h-6" />
                  <h2 className="text-xl font-bold">AI Negotiation Assistant</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAIAssistant(false);
                    setSelectedRequest(null);
                  }}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <NegotiationAssistant 
                  requestId={selectedRequest._id}
                  requestDetails={{
                    eventType: selectedRequest.eventType,
                    preferredDate: selectedRequest.date,
                    budget: parseBudget(selectedRequest.budget)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        

        {/* Header Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                  <Activity className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Event Requests</h1>
                <AIBadge type="organizer" agent="negotiation" />
              </div>
              <p className="text-gray-600 text-lg">Manage and respond to incoming event opportunities</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="group px-5 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Requests"
            value={totalRequests}
            icon={Target}
            color="blue"
          />

          <StatCard
            title="Pending"
            value={pendingRequests}
            icon={Clock}
            color="green"
          />

          <StatCard
            title="Accepted"
            value={acceptedRequests}
            icon={Check}
            color="purple"
          />

          <StatCard
            title="Revenue Potential"
            value={`$${revenuePotential.toLocaleString()}`}
            icon={DollarSign}
            color="orange"
          />
        </div>

        {/* Filter and Search Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                <label htmlFor="eventType" className="text-sm font-semibold text-gray-700">
                  Filter by Type
                </label>
              </div>
              <select
                id="eventType"
                value={filter}
                onChange={handleFilterChange}
                className="px-4 py-2 rounded-xl border bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Event Types</option>
                <option value="Wedding">💒 Wedding</option>
                <option value="Sports">⚽ Sports</option>
                <option value="Corporate">🏢 Corporate</option>
                <option value="Political">🏛️ Political</option>
              </select>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by event type, venue, name, or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Event Requests Grid */}
        <div className="space-y-6">
          {filteredEventRequests && filteredEventRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredEventRequests.map((request) => {
                const winProb = proposedBudget[request._id] 
                  ? getWinProbability(request, proposedBudget[request._id])
                  : null;
                
                return (
                  <div 
                    key={request._id} 
                    className={`${getEventTypeBg(request.eventType)} group relative overflow-hidden rounded-2xl border border-gray-200 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}
                  >
                    {/* Event Type Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg bg-gradient-to-r ${getEventTypeColor(request.eventType)} text-white`}>
                        {request.eventType}
                      </span>
                    </div>

                  

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
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/80">
                          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Requested by</p>
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {request.userId?.fullname || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {request.userId?.email || "No email provided"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/80">
                            <div className="p-1.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Budget</p>
                              <p className="text-sm font-semibold text-gray-800">{request.budget}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/80">
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
                      {aiSuggestions[request._id] && (
                        <div className={`mb-4 p-3 rounded-lg ${
                          aiSuggestions[request._id].type === 'success' ? 'bg-green-50 border-green-200' :
                          aiSuggestions[request._id].type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        } border`}>
                          <div className="flex items-start gap-2">
                            {aiSuggestions[request._id].type === 'success' ? (
                              <Award className="w-4 h-4 text-green-500 mt-0.5" />
                            ) : aiSuggestions[request._id].type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            ) : (
                              <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
                            )}
                            <p className="text-sm">{aiSuggestions[request._id].message}</p>
                          </div>
                        </div>
                      )}

                      {/* Proposed Budget Input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Proposed Budget
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={proposedBudget[request._id] || ""}
                            onChange={(e) =>
                              handleProposedBudgetChange(request._id, e.target.value)
                            }
                            placeholder="Enter your budget"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
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
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                winProb.value === 'High' ? 'bg-green-500' :
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Message (Optional)
                        </label>
                        <textarea
                          value={customMessage[request._id] || ""}
                          onChange={(e) => handleCustomMessageChange(request._id, e.target.value)}
                          placeholder="Add a personal message to increase your chances..."
                          className="w-full px-4 py-3 rounded-xl border bg-white border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          rows="2"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 pt-0">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAccept(request._id, proposedBudget[request._id] || "", customMessage[request._id])}
                          disabled={!proposedBudget[request._id]}
                          className="flex-1 group/accept py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-5 h-5 group-hover/accept:scale-110 transition-transform" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="flex-1 group/reject py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <X className="w-5 h-5 group-hover/reject:scale-110 transition-transform" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Event Requests Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {filter || searchTerm
                  ? "No event requests match your current filter or search criteria." 
                  : "No event requests available at the moment. Check back soon!"
                }
              </p>
              <button
                onClick={handleRefresh}
                className="group px-8 py-4 rounded-xl font-bold flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 mx-auto"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Refresh Requests
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default EventRequest;