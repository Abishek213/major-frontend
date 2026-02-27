// src/Pages/Landing/Organizer/EventRequest.jsx
// FIXED:
// 1. Uses backend-computed hasUserCounter / myNegotiationId / myStatus directly (no re-derivation)
// 2. deal_done events shown in "Won" tab (requires backend patch applied)
// 3. Counter offer UI always renders from backend fields
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Calendar, MapPin, DollarSign, User, Filter, Check, X,
  Clock, Sparkles, Search, RefreshCw, AlertTriangle, TrendingUp,
  Target, Activity, MessageSquare, Brain, Award, Zap,
  Trophy, BadgeCheck, Inbox,
} from "lucide-react";
import AIBadge from "../../../components/ai/user/AIBadge";
import { useNegotiation } from "../../../hooks/useNegotiation";

// ─── Tabs ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "available", label: "Available",      icon: Inbox  },
  { id: "pending",   label: "My Offers",      icon: Clock  },
  { id: "won",       label: "Accepted Deals", icon: Trophy },
];

// ─── Main Component ────────────────────────────────────────────────────────
const EventRequest = () => {
  const [eventRequests, setEventRequests] = useState([]);
  const [activeTab,     setActiveTab]     = useState("available");
  const [filter,        setFilter]        = useState("");
  const [searchTerm,    setSearchTerm]    = useState("");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [refreshCount,  setRefreshCount]  = useState(0);

  // Budget / message inputs keyed by eventId
  const [proposedBudget, setProposedBudget] = useState({});
  const [customMessage,  setCustomMessage]  = useState({});

  // Negotiation modal
  const [selectedRequest,       setSelectedRequest]       = useState(null);
  const [showNegotiationModal,  setShowNegotiationModal]  = useState(false);
  const [aiAnalysis,            setAiAnalysis]            = useState(null);
  const [aiSuggestions,         setAiSuggestions]         = useState({});

  const { submitOffer, getPriceAnalysis, acceptOffer, rejectOffer, loading: aiLoading } = useNegotiation();

  // ─── Token decode ─────────────────────────────────────────────────────────
  // We only need the token for API calls; organizer identity comes from backend
  const getToken   = () => localStorage.getItem("token");
  const getOrgId   = () => { try { const d = jwtDecode(getToken()); return d.user?.id || d.id; } catch { return null; } };

  // ─── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      setError("");
      try {
        const url = `${import.meta.env.VITE_API_URL}/eventrequest/event-requests${filter ? `?eventType=${filter}` : ""}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
        if (res.ok) {
          const data = await res.json();
          setEventRequests(data);
        } else {
          setError("Failed to fetch event requests.");
        }
      } catch (e) {
        setError("Network error: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [filter, refreshCount]);

  const handleRefresh = () => setRefreshCount((p) => p + 1);

  const parseBudget = (v) => {
    if (v == null) return 0;
    return parseInt(v.toString().replace(/[^0-9]/g, "")) || 0;
  };

  // ─── Budget input with AI hint ────────────────────────────────────────────
  const handleBudgetChange = (eventId, value) => {
    setProposedBudget((p) => ({ ...p, [eventId]: value }));
    const req = eventRequests.find((r) => r._id === eventId);
    if (!req || !value) return;
    const num = parseInt(value);
    const rb  = parseBudget(req.budget);
    if (num > rb * 1.2)      setAiSuggestions((p) => ({ ...p, [eventId]: { type: "warning", message: "20%+ above their budget — consider lowering." } }));
    else if (num < rb * 0.8) setAiSuggestions((p) => ({ ...p, [eventId]: { type: "success", message: "Competitive price! High chance of winning." } }));
    else                     setAiSuggestions((p) => ({ ...p, [eventId]: { type: "info",    message: "Aligned with client budget." } }));
  };

  // ─── Accept (direct) ─────────────────────────────────────────────────────
  const handleAccept = async (eventId) => {
    const token  = getToken();
    const orgId  = getOrgId();
    const budget = proposedBudget[eventId] || "";
    const msg    = customMessage[eventId]  || "";
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/eventrequest/${eventId}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ organizerId: orgId, proposedBudget: budget, customMessage: msg }),
      });
      if (res.ok) handleRefresh();
      else alert("❌ Error accepting event request");
    } catch { alert("❌ Error accepting event request"); }
  };

  // ─── Reject ───────────────────────────────────────────────────────────────
  const handleReject = async (eventId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/eventrequest/event-request/${eventId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setEventRequests((prev) => prev.filter((r) => r._id !== eventId));
        setProposedBudget((p) => { const s = { ...p }; delete s[eventId]; return s; });
        setCustomMessage((p)  => { const s = { ...p }; delete s[eventId]; return s; });
      } else alert("❌ Error rejecting event request");
    } catch { alert("❌ Error rejecting event request"); }
  };

  // ─── Negotiation modal open ───────────────────────────────────────────────
  const handleOpenNegotiation = async (request) => {
    setSelectedRequest(request);
    const analysis = await getPriceAnalysis(request.eventType, request.venue, parseBudget(request.budget));
    setAiAnalysis(analysis);
    setShowNegotiationModal(true);
  };

  // ─── Submit negotiation offer ─────────────────────────────────────────────
  const handleSubmitNegotiation = async () => {
    if (!selectedRequest) return;
    try {
      const result = await submitOffer(selectedRequest._id, {
        proposedPrice: parseInt(proposedBudget[selectedRequest._id] || parseBudget(selectedRequest.budget)),
        proposedDate:  selectedRequest.date?.split("T")[0] || "",
        customMessage: customMessage[selectedRequest._id] || "I'm interested in negotiating",
      });
      if (result?.success) { setShowNegotiationModal(false); handleRefresh(); }
    } catch (err) { alert("❌ Failed to start negotiation: " + err.message); }
  };

  // ─── Counter-offer handlers ───────────────────────────────────────────────
  const handleAcceptCounter = async (negotiationId, amount) => {
    try {
      const result = await acceptOffer(negotiationId);
      if (result?.success) { alert(`✅ Deal accepted at NPR ${amount?.toLocaleString()}!`); handleRefresh(); }
    } catch (e) { alert("❌ " + e.message); }
  };

  const handleCounterCounter = async (negotiationId, userAmount) => {
    const request = eventRequests.find((r) => r.myNegotiationId === negotiationId);
    if (request) {
      setSelectedRequest(request);
      const mid = Math.round((userAmount + parseBudget(request.budget)) / 2);
      setProposedBudget({ [request._id]: mid });
      setShowNegotiationModal(true);
    }
  };

  const handleRejectCounter = async (negotiationId) => {
    try {
      const result = await rejectOffer(negotiationId);
      if (result?.success) handleRefresh();
    } catch (e) { alert("❌ " + e.message); }
  };

  // ─── Categorise using BACKEND-COMPUTED fields (no re-derivation!) ─────────
  //
  // The backend already computed: myStatus, hasUserCounter, isDealWon, myNegotiationId
  // We trust those directly instead of re-searching interestedOrganizers on the frontend.
  //
  const categorized = { available: [], pending: [], won: [] };

  eventRequests.forEach((req) => {
    // Apply UI filters
    const matchType   = filter    === "" || req.eventType === filter;
    const matchSearch = searchTerm === "" ||
      req.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.userId?.fullname || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchType || !matchSearch) return;

    // Use backend-computed flags
    const myStatus     = req.myStatus;       // 'not_responded' | 'pending' | 'countered' | 'accepted' | 'rejected'
    const isDealWon    = req.isDealWon;       // true only for deal_done + this org accepted
    const hasResponded = req.hasResponded;    // any response at all

    // Hide rejected unless it's a won deal (shouldn't happen, but guard anyway)
    if (myStatus === "rejected" && !isDealWon) return;

    if (isDealWon) {
      categorized.won.push(req);
    } else if (hasResponded) {
      // pending, countered, or accepted-but-not-deal_done
      categorized.pending.push(req);
    } else {
      categorized.available.push(req);
    }
  });

  const displayed = categorized[activeTab] || [];
  const totalBudget = eventRequests.reduce((s, r) => s + parseBudget(r.budget), 0);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorDisplay error={error} onRefresh={handleRefresh} />;

  return (
    <div className="min-h-screen p-4 space-y-6 md:p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">

      {/* ── Negotiation Modal ── */}
      {showNegotiationModal && selectedRequest && (
        <NegotiationModal
          request={selectedRequest}
          aiAnalysis={aiAnalysis}
          proposedBudget={proposedBudget[selectedRequest._id] || ""}
          onBudgetChange={(v) => setProposedBudget((p) => ({ ...p, [selectedRequest._id]: v }))}
          customMessage={customMessage[selectedRequest._id] || ""}
          onMessageChange={(v) => setCustomMessage((p) => ({ ...p, [selectedRequest._id]: v }))}
          onSubmit={handleSubmitNegotiation}
          onClose={() => setShowNegotiationModal(false)}
          loading={aiLoading}
          parseBudget={parseBudget}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col justify-between gap-4 p-6 bg-white/90 border border-gray-100 shadow-md rounded-2xl md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">Event Requests</h1>
              <AIBadge type="organizer" agent="negotiation" />
            </div>
            <p className="text-xs text-gray-500">Manage incoming opportunities &amp; track your deals</p>
          </div>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Available"   value={categorized.available.length} gradient="from-blue-500 to-indigo-600"    icon={Inbox}       />
        <StatCard title="My Offers"   value={categorized.pending.length}   gradient="from-amber-500 to-orange-500"   icon={Clock}       />
        <StatCard title="Deals Won"   value={categorized.won.length}       gradient="from-emerald-500 to-green-600"  icon={Trophy}      />
        <StatCard title="Budget Pool" value={`NPR ${Math.round(totalBudget / 1000)}K`} gradient="from-purple-500 to-violet-600" icon={DollarSign} />
      </div>

      {/* ── Filter + Search ── */}
      <div className="flex flex-col gap-3 p-4 bg-white/90 border border-gray-100 rounded-2xl shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-indigo-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none">
            <option value="">All Event Types</option>
            <option value="Wedding">💒 Wedding</option>
            <option value="Birthday">🎂 Birthday</option>
            <option value="Corporate">🏢 Corporate</option>
            <option value="Conference">🎤 Conference</option>
            <option value="Party">🎉 Party</option>
            <option value="Sports">⚽ Sports</option>
          </select>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <input
            type="text"
            placeholder="Search by event, venue or client…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-gray-100 border border-gray-200/60 rounded-2xl w-fit">
        {TABS.map((tab) => {
          const count = categorized[tab.id].length;
          const Icon  = tab.icon;
          const isActive = activeTab === tab.id;
          const isWonTab = tab.id === "won";
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? isWonTab ? "bg-emerald-500 text-white shadow-lg" : "bg-white text-indigo-700 shadow-md"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? isWonTab ? "bg-white/25 text-white" : "bg-indigo-100 text-indigo-700"
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Won tab banner */}
      {activeTab === "won" && categorized.won.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <Trophy className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            🎉 You have {categorized.won.length} confirmed deal{categorized.won.length > 1 ? "s" : ""}! The client has selected you.
          </p>
        </div>
      )}

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {displayed.length > 0 ? (
          displayed.map((request) => {
            const winProb = proposedBudget[request._id]
              ? getWinProbability(parseBudget(request.budget), proposedBudget[request._id])
              : null;
            return (
              <RequestCard
                key={request._id}
                request={request}
                proposedBudget={proposedBudget[request._id] || ""}
                onBudgetChange={(v) => handleBudgetChange(request._id, v)}
                customMessage={customMessage[request._id] || ""}
                onMessageChange={(v) => setCustomMessage((p) => ({ ...p, [request._id]: v }))}
                onAccept={() => handleAccept(request._id)}
                onReject={() => handleReject(request._id)}
                onNegotiate={() => handleOpenNegotiation(request)}
                onAcceptCounter={handleAcceptCounter}
                onCounterCounter={handleCounterCounter}
                onRejectCounter={handleRejectCounter}
                aiSuggestion={aiSuggestions[request._id]}
                winProb={winProb}
                parseBudget={parseBudget}
              />
            );
          })
        ) : (
          <EmptyState tab={activeTab} hasFilter={!!(filter || searchTerm)} onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
};

// ─── Request Card ──────────────────────────────────────────────────────────
// Uses ONLY backend-computed fields: request.isDealWon, request.hasUserCounter,
// request.myNegotiationId, request.myStatus, request.myProposedBudget, request.hasResponded
const RequestCard = ({
  request,
  proposedBudget, onBudgetChange,
  customMessage,  onMessageChange,
  onAccept, onReject, onNegotiate,
  onAcceptCounter, onCounterCounter, onRejectCounter,
  aiSuggestion, winProb, parseBudget,
}) => {
  // ── Read backend-computed fields ──────────────────────────────────────────
  const isDealWon        = request.isDealWon        || false;
  const hasUserCounter   = request.hasUserCounter   || false;
  const hasResponded     = request.hasResponded      || false;
  const myNegotiationId  = request.myNegotiationId  || null;
  const myProposedBudget = request.myProposedBudget || null;
  const myMessage        = request.myMessage        || null;
  const myStatus         = request.myStatus         || "not_responded";
  const budgetNum        = parseBudget(request.budget);

  // ── Styling maps ──────────────────────────────────────────────────────────
  const stripGrad = {
    Wedding:    "from-pink-400 to-rose-500",
    Birthday:   "from-blue-400 to-cyan-500",
    Corporate:  "from-slate-400 to-gray-600",
    Conference: "from-purple-400 to-violet-600",
    default:    "from-emerald-400 to-teal-500",
  };
  const cardBg = {
    Wedding:    "from-pink-50/50 to-rose-50/30",
    Birthday:   "from-blue-50/50 to-cyan-50/30",
    Corporate:  "from-slate-50/50 to-gray-50/30",
    Conference: "from-purple-50/50 to-violet-50/30",
    default:    "from-emerald-50/50 to-teal-50/30",
  };
  const stripClass = `bg-gradient-to-r ${stripGrad[request.eventType] || stripGrad.default}`;
  const bgClass    = `bg-gradient-to-br ${cardBg[request.eventType]   || cardBg.default}`;

  // ══════════════════════════════════════════════════════════════════════
  // WON CARD — deal is done and this organizer was selected
  // ══════════════════════════════════════════════════════════════════════
  if (isDealWon) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400" />
        <div className="p-5 space-y-4">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getEventIcon(request.eventType)}</span>
              <div>
                <h3 className="text-base font-bold text-gray-800">{request.eventType} Event</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(request.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full">
              <Trophy className="w-3 h-3" /> DEAL WON
            </span>
          </div>

          {/* Client */}
          <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-white">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Client</p>
              <p className="text-sm font-semibold text-gray-800">{request.userId?.fullname || "Unknown"}</p>
              <p className="text-xs text-gray-500">{request.userId?.email}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Venue"  value={request.venue} />
            <InfoBox label="Agreed Budget" value={`NPR ${(myProposedBudget || budgetNum).toLocaleString()}`} highlight />
          </div>

          {/* Message sent */}
          {myMessage && (
            <div className="p-3 bg-white/60 rounded-xl border border-emerald-100 text-sm text-gray-700 italic">
              "{myMessage}"
            </div>
          )}

          {/* Confirmation notice */}
          <div className="flex items-center gap-2 p-3 bg-emerald-100 rounded-xl border border-emerald-200">
            <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-800 font-medium">
              You are confirmed as the organizer. Contact the client to proceed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // NORMAL CARD
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-200/80 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 ${bgClass}`}>

      {/* Top colour strip */}
      <div className={`h-1 ${stripClass}`} />

      {/* Status chips (top-right) */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow bg-gradient-to-r ${stripGrad[request.eventType] || stripGrad.default}`}>
          {request.eventType}
        </span>
        {/* Counter-offer chip — uses backend hasUserCounter */}
        {hasUserCounter && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white animate-pulse shadow">
            🔔 Counter!
          </span>
        )}
        {hasResponded && !hasUserCounter && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-white shadow">
            ⏳ Pending
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">

        {/* Event header */}
        <div className="flex items-center gap-3 pr-20">
          <span className="text-2xl">{getEventIcon(request.eventType)}</span>
          <div>
            <h3 className="text-base font-bold text-gray-800">{request.eventType} Event</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(request.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Client */}
        <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-xl border border-white">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400">Client</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{request.userId?.fullname || "Unknown"}</p>
          </div>
        </div>

        {/* Budget + Venue */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-xl border border-white">
            <DollarSign className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400">Budget</p>
              <p className="text-sm font-bold text-gray-800">NPR {budgetNum.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-white/60 rounded-xl border border-white min-w-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400">Venue</p>
              <p className="text-sm font-bold text-gray-800 truncate">{request.venue}</p>
            </div>
          </div>
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${
            aiSuggestion.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
            aiSuggestion.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
                                              "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            {aiSuggestion.type === "success" ? <Award className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
             aiSuggestion.type === "warning" ? <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                                               <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <p className="text-xs leading-relaxed">{aiSuggestion.message}</p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            CASE A: USER HAS COUNTERED (highest priority UI block)
            Uses: request.hasUserCounter, request.myNegotiationId, request.myProposedBudget
        ══════════════════════════════════════════════════════════════ */}
        {hasUserCounter && (
          <div className="p-4 bg-purple-50 border-2 border-purple-400 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-700" />
              <span className="text-sm font-bold text-purple-800">User Sent a Counter Offer!</span>
            </div>

            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-gray-500 mb-0.5">Their counter amount</p>
              <p className="text-xl font-bold text-purple-700">
                NPR {myProposedBudget?.toLocaleString() || "—"}
              </p>
              {myMessage && (
                <p className="mt-1.5 text-xs text-gray-600 italic">"{myMessage}"</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAcceptCounter(myNegotiationId, myProposedBudget)}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                ✅ Accept {myProposedBudget?.toLocaleString()}
              </button>
              <button
                onClick={() => onCounterCounter(myNegotiationId, myProposedBudget)}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔄 Counter
              </button>
              <button
                onClick={() => onRejectCounter(myNegotiationId)}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            CASE B: Already responded — my offer is pending, waiting for user
            Uses: hasResponded, myProposedBudget, myMessage
        ══════════════════════════════════════════════════════════════ */}
        {hasResponded && !hasUserCounter && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Your Offer — Awaiting Response</p>
              {myProposedBudget && (
                <p className="text-sm text-amber-700 font-bold">NPR {myProposedBudget.toLocaleString()}</p>
              )}
              {myMessage && (
                <p className="text-xs text-gray-600 mt-1 italic">"{myMessage}"</p>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            CASE C: No response yet — show input fields
        ══════════════════════════════════════════════════════════════ */}
        {!hasResponded && !hasUserCounter && (
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">Your Proposed Budget (optional)</label>
              <div className="relative">
                <DollarSign className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="number"
                  value={proposedBudget}
                  onChange={(e) => onBudgetChange(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full py-2.5 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            {winProb && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-gray-500">Win Probability</span>
                  <span className={`text-[10px] font-bold ${winProb.color}`}>{winProb.label}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${winProb.barClass}`} style={{ width: winProb.width }} />
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">Message (optional)</label>
              <textarea
                value={customMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Add a personal note to increase your chances…"
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
                rows="2"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div className="px-5 pb-5">
        {/* Case C: no response yet */}
        {!hasResponded && !hasUserCounter && (
          <div className="flex gap-2">
            <button onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-sm transition-all">
              <Check className="w-4 h-4" /> Accept
            </button>
            <button onClick={onNegotiate}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-sm transition-all">
              <MessageSquare className="w-4 h-4" /> Negotiate
            </button>
            <button onClick={onReject}
              className="px-3 py-2.5 text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Case B: responded, waiting — allow viewing negotiation status */}
        {hasResponded && !hasUserCounter && (
          <button onClick={onNegotiate}
            className="w-full py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
            View Negotiation Status
          </button>
        )}
        {/* Case A: counter shown — action buttons already inside the purple block above */}
      </div>
    </div>
  );
};

// ─── Negotiation Modal ─────────────────────────────────────────────────────
const NegotiationModal = ({ request, aiAnalysis, proposedBudget, onBudgetChange, customMessage, onMessageChange, onSubmit, onClose, loading, parseBudget }) => {
  const budgetNum = parseBudget(request.budget);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 text-white bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-sm">
            <Brain className="w-4 h-4" /> AI Negotiation Assistant
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {aiAnalysis && (
            <div className="p-3 border border-purple-200 bg-purple-50 rounded-xl text-sm">
              <p className="font-semibold text-purple-900 mb-1 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-600" /> AI Market Analysis
              </p>
              {aiAnalysis.marketAnalysis?.estimatedPrice && (
                <p className="text-gray-700 text-xs">Market Price: <strong>NPR {aiAnalysis.marketAnalysis.estimatedPrice.toLocaleString()}</strong></p>
              )}
              {aiAnalysis.validation?.suggestion && (
                <p className="text-xs text-gray-600 mt-0.5">💡 {aiAnalysis.validation.suggestion}</p>
              )}
            </div>
          )}
          <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-0.5">
            <p><span className="font-medium">Event:</span> {request.eventType} @ {request.venue}</p>
            <p><span className="font-medium">Client Budget:</span> NPR {budgetNum.toLocaleString()}</p>
            <p><span className="font-medium">Date:</span> {new Date(request.date).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Your Offer (NPR)</label>
            <input type="number" value={proposedBudget} onChange={(e) => onBudgetChange(e.target.value)}
              placeholder="Enter offer" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm" />
            {aiAnalysis?.marketAnalysis?.estimatedPrice && (
              <div className="flex gap-2 mt-2">
                {[{ label: "−10%", val: Math.round(aiAnalysis.marketAnalysis.estimatedPrice * 0.9) },
                  { label: "Market", val: aiAnalysis.marketAnalysis.estimatedPrice },
                  { label: "Budget", val: budgetNum }].map((b) => (
                  <button key={b.label} onClick={() => onBudgetChange(b.val)}
                    className="flex-1 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Message</label>
            <textarea value={customMessage} onChange={(e) => onMessageChange(e.target.value)} rows={3}
              placeholder="Why should they choose you?" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none text-sm" />
          </div>
          {proposedBudget && aiAnalysis?.marketAnalysis?.estimatedPrice && (() => {
            const ratio = proposedBudget / aiAnalysis.marketAnalysis.estimatedPrice;
            const [cls, label] = ratio < 0.9 ? ["bg-green-50 border-green-200 text-green-700", "High"] :
                                 ratio < 1.1 ? ["bg-amber-50 border-amber-200 text-amber-700", "Medium"] :
                                              ["bg-red-50 border-red-200 text-red-700", "Low"];
            return (
              <div className={`p-3 rounded-lg border text-xs font-medium ${cls}`}>
                <TrendingUp className="inline w-3.5 h-3.5 mr-1" />
                Success Probability: {label}
              </div>
            );
          })()}
          <div className="flex gap-3 pt-1">
            <button onClick={onSubmit} disabled={loading}
              className="flex-1 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60">
              {loading ? "Submitting…" : "Start Negotiation"}
            </button>
            <button onClick={onClose} className="px-5 py-3 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Small helpers ─────────────────────────────────────────────────────────
const StatCard = ({ title, value, gradient, icon: Icon }) => (
  <div className={`relative overflow-hidden p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br ${gradient}`}>
    <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/10 rounded-full" />
    <div className="relative z-10">
      <div className="p-1.5 mb-2 w-fit bg-white/20 rounded-lg">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-[10px] font-medium text-white/80 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const InfoBox = ({ label, value, highlight }) => (
  <div className={`p-2.5 rounded-xl border ${highlight ? "bg-emerald-50 border-emerald-200" : "bg-white/70 border-white"}`}>
    <p className="text-[10px] text-gray-400">{label}</p>
    <p className={`text-sm font-bold truncate ${highlight ? "text-emerald-700" : "text-gray-800"}`}>{value}</p>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-80">
    <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
    <p className="text-sm text-gray-500">Loading requests…</p>
  </div>
);

const ErrorDisplay = ({ error, onRefresh }) => (
  <div className="p-5 border-l-4 border-red-500 bg-red-50 rounded-2xl">
    <AlertTriangle className="w-5 h-5 mb-2 text-red-500" />
    <p className="text-sm text-red-600 mb-3">{error}</p>
    <button onClick={onRefresh} className="px-4 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Try Again</button>
  </div>
);

const EmptyState = ({ tab, hasFilter, onRefresh }) => {
  const msgs = {
    available: { icon: "📭", title: "No Open Requests",   desc: "No available event requests right now. Check back soon!" },
    pending:   { icon: "⏳", title: "No Pending Offers",  desc: "You haven't submitted any offers yet. Explore available requests." },
    won:       { icon: "🏆", title: "No Deals Won Yet",    desc: "Keep negotiating — your first deal is coming!" },
  };
  const m = msgs[tab] || msgs.available;
  return (
    <div className="col-span-full p-12 text-center bg-white border border-gray-200 rounded-2xl">
      <div className="text-5xl mb-3">{m.icon}</div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">{m.title}</h3>
      <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
        {hasFilter ? "No requests match your search or filter. Try adjusting them." : m.desc}
      </p>
      <button onClick={onRefresh} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all">
        Refresh
      </button>
    </div>
  );
};

const getEventIcon = (t) => ({ Wedding: "💒", Sports: "⚽", Corporate: "🏢", Conference: "🎤", Birthday: "🎂", Party: "🎉" }[t] || "🎉");

const getWinProbability = (requestBudget, proposed) => {
  if (!proposed || !requestBudget) return null;
  const ratio = parseInt(proposed) / requestBudget;
  if (ratio <= 0.9) return { label: "High",   color: "text-green-600", barClass: "bg-green-500 w-4/5" };
  if (ratio <= 1.0) return { label: "Medium", color: "text-amber-600", barClass: "bg-amber-500 w-1/2" };
  return             { label: "Low",    color: "text-red-600",   barClass: "bg-red-500 w-1/5" };
};

export default EventRequest;