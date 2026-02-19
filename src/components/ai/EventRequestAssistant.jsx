import { MessageSquare, Wand2, User, Building, MapPin, Calendar, Search, Star, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import eventRequestService from '../../services/eventRequestService';

// ─── Helper: pull display-friendly entities from the AI response ──────────────
const parseAIEntities = (aiInsights, fallbackText = '') => {
  if (!aiInsights) return null;

  // Prefer backend-extracted entities; fall back to local keyword scan
  const extracted = aiInsights.extractedEntities || {};

  const text = fallbackText.toLowerCase();
  return {
    eventType: extracted.eventType
      || (text.includes('tech') ? 'Technology'
        : text.includes('music') ? 'Music'
        : text.includes('business') ? 'Business'
        : text.includes('wedding') ? 'Wedding'
        : text.includes('sports') ? 'Sports'
        : 'General'),
    location: extracted.locations?.[0]
      || (text.includes('kathmandu') ? 'Kathmandu'
        : text.includes('pokhara') ? 'Pokhara'
        : text.includes('online') ? 'Online'
        : 'Not specified'),
    date: extracted.date
      || (text.includes('next month') ? 'Next Month'
        : text.includes('next week') ? 'Next Week'
        : text.includes('weekend') ? 'This Weekend'
        : 'Flexible'),
    budget: extracted.budget
      || (text.includes('free') ? 'Free'
        : text.includes('$') ? 'Paid'
        : 'Not specified'),
    attendees: extracted.attendees
      || (text.includes('small') ? 'Small (< 50)'
        : text.includes('large') ? 'Large (> 200)'
        : 'Medium (50–200)')
  };
};

// ─── Component ────────────────────────────────────────────────────────────────
const EventRequestAssistant = ({ currentUser }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Event Assistant. Describe what you're looking for in plain language — for example: 'I want a tech conference in Kathmandu next month for 100 people' — and I'll find matching organizers for you.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [entities, setEntities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [lastRequestId, setLastRequestId] = useState(null);

  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setError(null);

    // Append user message immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setLoading(true);

    try {
      // ── Call backend (POST /event-requests with useAI: true) ──────────────
      const result = await eventRequestService.processNaturalLanguageRequest(
        userText,
        currentUser?.id,
        {} // optional structured overrides
      );

      const aiInsights = result?.data?.aiInsights;
      const requestId  = result?.data?.eventRequest?._id;

      if (requestId) setLastRequestId(requestId);

      // Parse entities for the detection panel
      const detectedEntities = parseAIEntities(aiInsights, userText);
      setEntities(detectedEntities);

      // Build organizer suggestions list
      const matchedOrganizers =
        aiInsights?.matchedOrganizers ||
        aiInsights?.filteredSuggestions ||
        [];

      const budgetNote = aiInsights?.budgetAnalysis?.note || aiInsights?.budgetAnalysis?.feasibility;
      const tip        = aiInsights?.suggestions?.tip;

      // Build AI reply message
      const replyText = matchedOrganizers.length
        ? `I found ${matchedOrganizers.length} organizer${matchedOrganizers.length > 1 ? 's' : ''} that match your request. Here are the top recommendations:`
        : result?.message || "I've registered your request. No AI organizer matches returned yet — you can check back or browse available organizers manually.";

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: replyText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: matchedOrganizers.slice(0, 5).map(o => ({
          name:           o.name || o.fullname || 'Organizer',
          match:          o.matchScore ? `${o.matchScore}%` : '—',
          specialization: o.specialization || o.category || '',
          rating:         o.rating,
          responseTime:   o.responseTime,
          completedEvents: o.completedEvents
        })),
        budgetNote,
        tip,
        requestId
      }]);

    } catch (err) {
      console.error('Assistant error:', err);
      const errMsg = err?.response?.data?.error || err.message || 'Something went wrong.';
      setError(errMsg);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Sorry, I ran into an issue: ${errMsg}`,
        sender: 'ai',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Reprocess last request ──────────────────────────────────────────────────
  const handleReprocess = async () => {
    if (!lastRequestId || loading) return;
    setLoading(true);
    try {
      await eventRequestService.reprocessWithAI(lastRequestId);
      const result = await eventRequestService.getEventRequestWithAIInsights(lastRequestId);
      const aiInsights = result?.data?.aiInsights;
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Re-processed with AI. Updated insights are now attached to your request.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: (aiInsights?.matchedOrganizers || []).slice(0, 5).map(o => ({
          name:           o.name || 'Organizer',
          match:          o.matchScore ? `${o.matchScore}%` : '—',
          specialization: o.specialization || ''
        }))
      }]);
    } catch (err) {
      setError('Re-process failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">

      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <Wand2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Event Request Assistant</h3>
              <p className="text-sm text-gray-500">Describe your event in plain language</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastRequestId && (
              <button
                onClick={handleReprocess}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Re-run AI on your last request"
              >
                <RefreshCw className="w-3 h-3" />
                Re-run AI
              </button>
            )}
            <span className="text-xs text-gray-400">Powered by AI</span>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Try saying:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Tech conference in Kathmandu next month',
            'Weekend music festival for 200 people',
            'Free online workshop next week',
            'Business networking event with $5000 budget'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInput(prompt)}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              {/* Message header */}
              <div className="flex items-center gap-2 mb-1">
                {msg.sender === 'ai'
                  ? <Wand2 className="w-4 h-4 text-green-600" />
                  : <User className="w-4 h-4" />
                }
                <span className="text-xs opacity-60">
                  {msg.sender === 'ai' ? 'AI Assistant' : 'You'} · {msg.timestamp}
                </span>
              </div>

              <p className="text-sm">{msg.text}</p>

              {/* Budget / tip notes */}
              {(msg.budgetNote || msg.tip) && (
                <div className="mt-2 space-y-1">
                  {msg.budgetNote && (
                    <p className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      💰 Budget: {msg.budgetNote}
                    </p>
                  )}
                  {msg.tip && (
                    <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      💡 {msg.tip}
                    </p>
                  )}
                </div>
              )}

              {/* Organizer suggestions */}
              {msg.suggestions?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.suggestions.map((s, idx) => (
                    <div key={idx} className="p-3 bg-white/20 rounded-lg">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{s.name}</p>
                          {s.specialization && (
                            <p className="text-xs opacity-80">{s.specialization}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {s.rating && (
                              <span className="flex items-center gap-0.5 text-xs opacity-75">
                                <Star className="w-3 h-3" /> {s.rating}
                              </span>
                            )}
                            {s.responseTime && (
                              <span className="flex items-center gap-0.5 text-xs opacity-75">
                                <Clock className="w-3 h-3" /> {s.responseTime}
                              </span>
                            )}
                            {s.completedEvents && (
                              <span className="text-xs opacity-75">
                                {s.completedEvents} events
                              </span>
                            )}
                          </div>
                        </div>
                        {s.match && s.match !== '—' && (
                          <span className="shrink-0 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            {s.match} match
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-none p-4">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">AI is processing your request…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Detected entity panel */}
      {entities && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-800">AI Detected:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(entities).map(([key, value]) => (
              <div key={key} className="bg-blue-50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  {key === 'location'  && <MapPin    className="w-3 h-3 text-blue-600" />}
                  {key === 'date'      && <Calendar  className="w-3 h-3 text-blue-600" />}
                  {key === 'eventType' && <Building  className="w-3 h-3 text-blue-600" />}
                  <span className="text-xs font-medium text-blue-700 capitalize">{key}</span>
                </div>
                <p className="text-xs text-gray-800 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your event needs… e.g. 'tech conference in Kathmandu for 200 people next month'"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventRequestAssistant;