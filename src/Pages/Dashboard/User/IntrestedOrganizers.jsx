// src/Pages/Landing/User/InterestedOrganizers.jsx
// FIXED: deal_done events shown in "Confirmed" section, accepted organizer highlighted,
//        action buttons removed for completed deals, proper integration throughout.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useNegotiation } from '@/hooks/useNegotiation';
import AIBadge from "@/components/ai/user/AIBadge";
import AILoadingSpinner from "@/components/ai/user/AILoadingSpinner";
import {
  AlertTriangle, CheckCircle, XCircle, Users, MapPin, Calendar,
  DollarSign, FileText, MessageSquare, TrendingUp, Sparkles,
  Plus, RefreshCw, UserCircle, Clock, Brain, Star,
  BarChart3, Filter, X, Trophy, BadgeCheck, Phone, Mail,
  Handshake, ChevronDown, ChevronUp, PartyPopper, ArrowRight
} from 'lucide-react';

const InterestedOrganizers = () => {
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [eventRequests,    setEventRequests]    = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [aiInsights,       setAiInsights]       = useState({});
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [comparisonMode,   setComparisonMode]   = useState(false);
  const [comparisonList,   setComparisonList]   = useState([]);
  const [sortBy,           setSortBy]           = useState('matchScore');

  const [negotiationModal, setNegotiationModal] = useState({
    show: false, organizer: null, event: null, negotiationId: null,
  });
  const [aiAnalysis,        setAiAnalysis]        = useState(null);
  const [counterOfferValue, setCounterOfferValue] = useState('');
  const [counterMessage,    setCounterMessage]    = useState('');

  const { submitCounterOffer, getPriceAnalysis, loading: negotiationLoading } = useNegotiation();

  // ── Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.safeGet('/eventrequest/event-requests-for-user');
      if (response?.data?.eventRequests) {
        const processed = response.data.eventRequests.map((event) => ({
          ...event,
          organizers: event.organizers?.map((org) => ({
            ...org,
            negotiationId: org.negotiationId || null,
          })),
        }));
        setEventRequests(processed);
        generateAIInsights(processed);
      } else {
        setEventRequests([]);
      }
      setError(null);
    } catch (err) {
      if (err.status === 404) { setEventRequests([]); setError(null); }
      else { setError(err.message || 'Failed to fetch event requests'); }
    } finally {
      setLoading(false);
    }
  };

  // ── AI Insights ────────────────────────────────────────────────────────
  const generateAIInsights = (requests) => {
    const insights = {};
    requests.forEach((request) => {
      const orgs     = request.organizers || [];
      const budgets  = orgs.map((o) => o.proposedBudget || 0).filter((b) => b > 0);
      const avgScore = orgs.length ? orgs.reduce((s, o) => s + (o.matchPercentage || 70), 0) / orgs.length : 0;
      insights[request._id] = {
        totalOrganizers: orgs.length,
        avgMatchScore:   Math.round(avgScore),
        topMatchScore:   orgs.length ? Math.max(...orgs.map((o) => o.matchPercentage || 0)) : 0,
        budgetRange: budgets.length ? {
          min:     Math.min(...budgets),
          max:     Math.max(...budgets),
          average: Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length),
        } : null,
        marketInsight: getMarketInsight(request, budgets),
      };
    });
    setAiInsights(insights);
  };

  const getMarketInsight = (request, budgets) => {
    if (!budgets.length) return '📊 No proposals yet. Check back later.';
    const avg   = budgets.reduce((a, b) => a + b, 0) / budgets.length;
    const ratio = avg / request.budget;
    if (ratio < 0.9)  return '📊 Offers are below your budget — great opportunity!';
    if (ratio < 1.1)  return '📊 Offers align with your budget.';
    return '📊 Offers are above your budget. Consider negotiating.';
  };

  // ── Select Organizer ───────────────────────────────────────────────────
  const handleSelectOrganizer = async (eventId, organizerId) => {
    try {
      setLoading(true);
      await api.safePut('/eventrequest/select-organizer', { eventId, organizerId });
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to select organizer');
    } finally {
      setLoading(false);
    }
  };

  // ── Negotiation ────────────────────────────────────────────────────────
  const handleOpenNegotiation = async (organizer, event) => {
    const negotiationId = organizer.negotiationId;
    if (!negotiationId) {
      alert('Cannot negotiate: No negotiation record found. The organizer must send an offer first.');
      return;
    }
    setSelectedOrganizer(organizer);
    const analysis = await getPriceAnalysis(event.eventType, event.venue, event.budget);
    setAiAnalysis(analysis);
    const midPoint = Math.round((event.budget + (organizer.proposedBudget || 0)) / 2);
    setCounterOfferValue(midPoint);
    setCounterMessage(`I'm interested! Can we agree on NPR ${midPoint.toLocaleString()}?`);
    setNegotiationModal({ show: true, organizer, event, negotiationId });
  };

  const handleSendCounterOffer = async () => {
    const { negotiationId } = negotiationModal;
    if (!negotiationId || negotiationId.includes('undefined')) {
      alert('Invalid negotiation ID. Please try again.');
      return;
    }
    try {
      const result = await submitCounterOffer(negotiationId, parseInt(counterOfferValue), counterMessage);
      if (result?.success) {
        setNegotiationModal({ show: false, organizer: null, event: null, negotiationId: null });
        await fetchData();
      }
    } catch (err) {
      alert('❌ Failed to send counter offer: ' + err.message);
    }
  };

  const handleCompareOrganizer = (organizer) => {
    if (comparisonList.includes(organizer._id)) {
      setComparisonList(comparisonList.filter((id) => id !== organizer._id));
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, organizer._id]);
    } else {
      setError('You can compare up to 3 organizers at once');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRefresh        = () => fetchData();
  const handleCreateRequest  = () => navigate('/userdb/eventrequest');

  const getStatusBadge = (status) => {
    const styles = {
      pending:   'bg-amber-100 text-amber-800 border-amber-200',
      accepted:  'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected:  'bg-rose-100 text-rose-800 border-rose-200',
      deal_done: 'bg-blue-100 text-blue-800 border-blue-200',
      countered: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    const labels = { deal_done: '✅ CONFIRMED', pending: '⏳ PENDING', accepted: '✅ ACCEPTED', rejected: '❌ REJECTED', countered: '🔄 COUNTER' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status?.toUpperCase()}
      </span>
    );
  };

  // Split events into confirmed (deal_done) and active
  const confirmedEvents = eventRequests.filter((e) => e.status === 'deal_done');
  const activeEvents    = eventRequests.filter((e) => e.status !== 'deal_done');

  if (loading) return <LoadingSpinner />;
  if (error && !eventRequests.length) return <ErrorDisplay error={error} onRefresh={handleRefresh} />;
  if (!eventRequests.length) return <EmptyState onCreateRequest={handleCreateRequest} />;

  return (
    <div className="p-4 space-y-6 md:p-6">

      {/* ── Inline error banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 border-l-4 border-red-500 bg-red-50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 p-6 bg-white border border-gray-100 shadow-md rounded-2xl md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            My Event Requests
          </h1>
          <p className="mt-1 text-sm text-gray-500 ml-[52px]">Manage organizer responses and track your events</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              comparisonMode ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Compare ({comparisonList.length}/3)
          </button>
          <button onClick={handleRefresh} className="p-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreateRequest}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow transition"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStatCard label="Total Requests"  value={eventRequests.length}  color="indigo" />
        <MiniStatCard label="Active Requests" value={activeEvents.length}   color="amber" />
        <MiniStatCard label="Confirmed Events" value={confirmedEvents.length} color="emerald" />
        <MiniStatCard label="Organizer Offers" value={eventRequests.reduce((s, e) => s + (e.organizers?.length || 0), 0)} color="purple" />
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CONFIRMED EVENTS SECTION                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {confirmedEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-full shadow">
              <Trophy className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">Confirmed Events</span>
            </div>
            <span className="text-xs text-gray-500 italic">Deal done — organizer selected</span>
          </div>

          {confirmedEvents.map((event) => (
            <ConfirmedEventCard
              key={event._id}
              event={event}
              aiInsights={aiInsights}
            />
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ACTIVE EVENTS SECTION                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeEvents.length > 0 && (
        <div className="space-y-4">
          {confirmedEvents.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500 rounded-full shadow">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">Active Requests</span>
              </div>
              <span className="text-xs text-gray-500 italic">Awaiting your decision</span>
            </div>
          )}

          {activeEvents.map((event) => (
            <ActiveEventCard
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
      )}

      {/* ── Negotiation Modal ── */}
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

// ─── Confirmed Event Card ─────────────────────────────────────────────────
const ConfirmedEventCard = ({ event, aiInsights }) => {
  const [expanded, setExpanded] = useState(false);

  // Find the accepted organizer
  const acceptedOrg = event.organizers?.find((o) => o.status === 'accepted');
  const otherOrgs   = event.organizers?.filter((o) => o.status !== 'accepted') || [];

  return (
    <div className="overflow-hidden border-2 border-emerald-200 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-50/80 to-green-50/60">
      {/* Top strip */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400" />

      <div className="p-6">
        {/* Header row */}
        <div className="flex flex-col gap-4 mb-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center bg-emerald-100 w-14 h-14 rounded-xl border border-emerald-200">
              <FileText className="text-emerald-600 w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-800">{event.eventType || 'Event'} Request</h2>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                  <Trophy className="w-3 h-3" /> CONFIRMED
                </span>
              </div>
              <p className="text-sm text-gray-500">Deal completed • Organizer selected</p>
            </div>
          </div>
        </div>

        {/* Event details */}
        <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-3">
          <DetailPill icon={MapPin}    label="Venue"  value={event.venue}   color="blue" />
          <DetailPill icon={Calendar}  label="Date"   value={event.date ? new Date(event.date).toLocaleDateString() : '—'} color="purple" />
          <DetailPill icon={DollarSign} label="Budget" value={`NPR ${event.budget?.toLocaleString()}`} color="emerald" />
        </div>

        {/* ── Selected Organizer Spotlight ── */}
        {acceptedOrg ? (
          <div className="p-5 bg-white border-2 border-emerald-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-800">Your Selected Organizer</h3>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow flex-shrink-0">
                <UserCircle className="w-9 h-9 text-white" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-bold text-gray-900">{acceptedOrg.fullname || 'Organizer'}</h4>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                    ✅ Confirmed
                  </span>
                </div>

                {/* Agreed budget */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-500">Agreed Price</p>
                    <p className="font-bold text-emerald-700 text-lg">NPR {acceptedOrg.proposedBudget?.toLocaleString() || event.budget?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Contact */}
                {acceptedOrg.contact && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{acceptedOrg.contact}</span>
                  </div>
                )}

                {/* Message */}
                {acceptedOrg.message && (
                  <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100 italic">
                    "{acceptedOrg.message}"
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <Handshake className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-emerald-800">
                    Your event is confirmed! Reach out to your organizer to discuss next steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            Deal is confirmed but organizer details are loading…
          </div>
        )}

        {/* Other organizers (collapsed by default) */}
        {otherOrgs.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? 'Hide' : 'Show'} {otherOrgs.length} other organizer{otherOrgs.length > 1 ? 's' : ''} (not selected)
            </button>
            {expanded && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {otherOrgs.map((org) => (
                  <div key={org.organizerId} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl opacity-70">
                    <UserCircle className="w-8 h-8 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 truncate">{org.fullname}</p>
                      <p className="text-xs text-gray-500">NPR {org.proposedBudget?.toLocaleString() || '—'}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-medium text-rose-600 bg-rose-100 rounded-full">Not selected</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Active Event Card ────────────────────────────────────────────────────
const ActiveEventCard = ({
  event, aiInsights, sortBy, setSortBy, comparisonMode, comparisonList,
  onCompare, onSelectOrganizer, onOpenNegotiation, getStatusBadge,
}) => {
  const insight = aiInsights[event._id];
  return (
    <div className="overflow-hidden border border-gray-200 rounded-2xl shadow-lg bg-white">
      {/* Event header */}
      <div className="p-5 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center bg-indigo-100 w-12 h-12 rounded-xl border border-indigo-100">
              <FileText className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{event.eventType || 'Event'} Request</h2>
              <p className="text-xs text-gray-500">ID: {event._id?.slice(-8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(event.status)}
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border">
              <Users className="w-3.5 h-3.5" /> {event.organizers?.length || 0} organizers
            </span>
          </div>
        </div>

        {/* AI Insight */}
        {insight?.marketInsight && (
          <div className="flex items-start gap-3 mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
            <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{insight.marketInsight}</p>
          </div>
        )}
      </div>

      {/* Event details */}
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DetailPill icon={MapPin}    label="Venue"  value={event.venue}   color="blue" />
          <DetailPill icon={Calendar}  label="Date"   value={event.date ? new Date(event.date).toLocaleDateString() : '—'} color="purple" />
          <DetailPill icon={DollarSign} label="Budget" value={`NPR ${event.budget?.toLocaleString()}`} color="amber" />
        </div>

        {event.description && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
            <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
          </div>
        )}

        {/* Organizers Section */}
        {!event.organizers?.length ? (
          <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl">
            <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No organizers have responded yet</p>
            <p className="text-xs text-gray-400 mt-1">Check back later</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-800">
                <Brain className="w-4 h-4 text-indigo-500" />
                Organizer Offers ({event.organizers.length})
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="matchScore">By Match Score</option>
                <option value="budget">By Budget (Low→High)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[...event.organizers]
                .sort((a, b) =>
                  sortBy === 'matchScore'
                    ? (b.matchPercentage || 0) - (a.matchPercentage || 0)
                    : (a.proposedBudget || 0) - (b.proposedBudget || 0)
                )
                .map((organizer, index) => (
                  <OrganizerCard
                    key={organizer._id || index}
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
        )}
      </div>
    </div>
  );
};

// ─── Organizer Card ───────────────────────────────────────────────────────
const OrganizerCard = ({
  organizer, index, event, comparisonMode, comparisonList,
  onCompare, onSelectOrganizer, onOpenNegotiation, getStatusBadge,
}) => {
  const rankColors = ['bg-yellow-400', 'bg-gray-400', 'bg-amber-600'];
  const isCountered = organizer.status === 'countered';

  return (
    <div className={`relative p-5 bg-white border rounded-2xl shadow-sm transition-all hover:shadow-md ${
      isCountered ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200'
    }`}>
      {/* Rank badge */}
      <div className={`absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow ${rankColors[index] || 'bg-slate-500'}`}>
        #{index + 1}
      </div>

      {/* Compare checkbox */}
      {comparisonMode && (
        <div className="absolute top-3 right-3">
          <input type="checkbox" checked={comparisonList.includes(organizer._id)} onChange={() => onCompare(organizer)} className="w-4 h-4 text-indigo-500 rounded" />
        </div>
      )}

      {/* Counter offer notification */}
      {isCountered && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-xs font-semibold text-purple-700">Awaiting organizer response to your counter</span>
        </div>
      )}

      {/* Organizer info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
          <UserCircle className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 truncate">{organizer.fullname || 'Organizer'}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            {getStatusBadge(organizer.status)}
          </div>
        </div>
        {/* Match score */}
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-indigo-600">{organizer.matchPercentage || 0}%</p>
          <p className="text-[10px] text-gray-400">match</p>
        </div>
      </div>

      {/* Budget */}
      <div className="flex items-center gap-2 p-3 mb-4 bg-gray-50 border border-gray-100 rounded-xl">
        <DollarSign className="w-4 h-4 text-emerald-600" />
        <div>
          <p className="text-[10px] text-gray-500">Proposed Budget</p>
          <p className="font-bold text-gray-800">NPR {organizer.proposedBudget?.toLocaleString() || 'Not specified'}</p>
        </div>
        {event.budget && organizer.proposedBudget && (
          <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
            organizer.proposedBudget <= event.budget ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {organizer.proposedBudget <= event.budget ? '▼ Under budget' : '▲ Over budget'}
          </span>
        )}
      </div>

      {/* Message */}
      {organizer.message && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <p className="text-xs font-semibold text-indigo-700">Organizer's Proposal</p>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{organizer.message}</p>
        </div>
      )}

      {/* Action buttons - only show for non-countered, non-completed status */}
      {organizer.status !== 'accepted' && organizer.status !== 'rejected' && (
        <div className="flex gap-2">
          <button
            onClick={() => onSelectOrganizer(event._id, organizer._id || organizer.organizerId)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 transition-all shadow-sm"
          >
            <CheckCircle className="w-4 h-4" /> Select
          </button>
          <button
            onClick={() => onOpenNegotiation(organizer, event)}
            disabled={!organizer.negotiationId}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-4 h-4" />
            {isCountered ? 'Counter Pending' : 'Negotiate'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Negotiation Modal ────────────────────────────────────────────────────
const NegotiationModal = ({
  organizer, event, aiAnalysis,
  counterOfferValue, setCounterOfferValue,
  counterMessage, setCounterMessage,
  onSend, onClose, loading,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-5 text-white bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <Brain className="w-5 h-5" /> AI Negotiation
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {aiAnalysis && (
          <div className="p-4 border border-purple-200 bg-purple-50 rounded-xl text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-900">AI Market Analysis</span>
            </div>
            {aiAnalysis.marketAnalysis?.estimatedPrice && (
              <p className="text-gray-700">Market Price: <strong>NPR {aiAnalysis.marketAnalysis.estimatedPrice.toLocaleString()}</strong></p>
            )}
            {aiAnalysis.validation?.suggestion && (
              <p className="text-xs text-gray-600 mt-1">💡 {aiAnalysis.validation.suggestion}</p>
            )}
          </div>
        )}
        <div className="p-3 bg-gray-50 rounded-xl text-sm space-y-1">
          <p><span className="font-medium">Event:</span> {event.eventType} @ {event.venue}</p>
          <p><span className="font-medium">Your Budget:</span> NPR {event.budget?.toLocaleString()}</p>
          <p><span className="font-medium">Organizer's Offer:</span> NPR {organizer.proposedBudget?.toLocaleString()}</p>
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-medium text-gray-700">Your Counter Offer (NPR)</label>
          <input
            type="number"
            value={counterOfferValue}
            onChange={(e) => setCounterOfferValue(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            placeholder="Enter your offer"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-medium text-gray-700">Message</label>
          <textarea
            rows={3}
            value={counterMessage}
            onChange={(e) => setCounterMessage(e.target.value)}
            placeholder="Explain your counter offer…"
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSend}
            disabled={loading || !counterOfferValue}
            className="flex-1 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Counter Offer'}
          </button>
          <button onClick={onClose} className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Small helpers ─────────────────────────────────────────────────────────
const DetailPill = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue:    'bg-blue-50 border-blue-100 text-blue-700',
    purple:  'bg-purple-50 border-purple-100 text-purple-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber:   'bg-amber-50 border-amber-100 text-amber-700',
  };
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${colors[color] || colors.blue}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium opacity-70 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
};

const MiniStatCard = ({ label, value, color }) => {
  const gradients = {
    indigo:  'from-indigo-500 to-indigo-600',
    amber:   'from-amber-400 to-orange-500',
    emerald: 'from-emerald-500 to-teal-500',
    purple:  'from-purple-500 to-violet-600',
  };
  return (
    <div className={`p-4 text-white rounded-2xl shadow bg-gradient-to-br ${gradients[color] || gradients.indigo}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium text-white/80 mt-1">{label}</p>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-16">
    <AILoadingSpinner />
    <p className="mt-3 text-sm text-gray-500">Loading your event requests…</p>
  </div>
);

const ErrorDisplay = ({ error, onRefresh }) => (
  <div className="p-6 border-l-4 border-red-500 bg-red-50 rounded-xl">
    <AlertTriangle className="w-5 h-5 mb-2 text-red-500" />
    <p className="mb-4 text-red-700 text-sm">{error}</p>
    <button onClick={onRefresh} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition">Try Again</button>
  </div>
);

const EmptyState = ({ onCreateRequest }) => (
  <div className="p-12 text-center bg-white border border-gray-200 shadow-lg rounded-2xl">
    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
      <Brain className="w-10 h-10 text-indigo-400" />
    </div>
    <h3 className="mb-2 text-xl font-bold text-gray-700">No Event Requests Found</h3>
    <p className="mb-6 text-gray-500 text-sm max-w-xs mx-auto">
      Create your first event request and let AI find the perfect organizers!
    </p>
    <button onClick={onCreateRequest} className="flex items-center gap-2 px-6 py-3 mx-auto font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow transition">
      <Plus className="w-4 h-4" /> Create New Event Request
    </button>
  </div>
);

export default InterestedOrganizers;