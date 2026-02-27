// src/components/ai/user/EventRequestAssistant.jsx
import { MessageSquare, Wand2, User, Building, MapPin, Calendar, Search, Star, Clock, AlertCircle,DollarSign,Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useEventRequest } from '@/hooks/useEventRequest';
import { useAuth } from '@/context/AuthContext';

const EventRequestAssistant = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Add authLoading
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Event Assistant. Describe what you're looking for in plain language — for example: 'I want a wedding in Kathmandu for 100 people with 9 lakh budget' — and I'll find matching organizers for you.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  // Debug auth state
  useEffect(() => {
    console.log('🔐 Auth State:', { 
      isAuthenticated, 
      authLoading,
      user: user ? { id: user.id, name: user.fullname } : null 
    });
  }, [user, isAuthenticated, authLoading]);

  // USE THE REAL HOOK
  const { processRequest, loading: aiLoading, error } = useEventRequest();

  const chatEndRef = useRef(null);
  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || aiLoading) return;

    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ Auth still loading, please wait...');
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Authentication is still loading. Please wait a moment and try again.",
        sender: 'ai',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

    console.log('📝 Submit clicked. Auth check:', { 
      hasUser: !!user, 
      userId: user?.id,
      isAuthenticated 
    });

    if (!user || !user.id) {
      console.error('❌ No authenticated user');
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Please log in to use the AI Event Assistant.",
        sender: 'ai',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

    const userText = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: userText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    // Call REAL API through the hook
    const result = await processRequest(userText);
    
    console.log('📦 Assistant received:', result);

    if (result?.success && result.organizers && result.organizers.length > 0) {
      // Success - show organizers
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `I found ${result.organizers.length} organizers that match your request:`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        organizers: result.organizers,
        entities: result.entities,
        budgetAnalysis: result.budgetAnalysis
      }]);
    } 
    else if (result?.success && result.entities) {
      // Extracted entities but no organizers
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `I've registered your request. No matching organizers found yet. Check back later.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        entities: result.entities
      }]);
    }
    else if (error) {
      // Show error
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Sorry, I couldn't process your request: ${error}`,
        sender: 'ai',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } else {
      // Fallback
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Your request has been submitted. Check back later for matches.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white border border-gray-200 shadow-sm rounded-2xl">

      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100">
              <Wand2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Event Request Assistant</h3>
              <p className="text-sm text-gray-500">Describe your event in plain language</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">Powered by AI</span>
        </div>
        {!isAuthenticated && !authLoading && (
          <div className="p-2 mt-2 text-xs rounded-lg text-amber-600 bg-amber-50">
            Please log in to use the AI assistant
          </div>
        )}
      </div>

      {/* Quick prompts - disabled if not authenticated */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="mb-2 text-xs text-gray-500">Try saying:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'I want a wedding in Kathmandu for 100 people with 9 lakh budget',
            'Need a conference venue in Pokhara for 200 people next month',
            'Looking for birthday party organizer in Lalitpur with 5 lakh budget',
            'Corporate event for 50 people in Butwal'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => isAuthenticated ? handleQuickPrompt(prompt) : null}
              disabled={!isAuthenticated}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                isAuthenticated 
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto h-96">
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

              {/* Budget Analysis */}
              {msg.budgetAnalysis && (
                <div className="p-2 mt-2 rounded-lg bg-green-50">
                  <p className="text-xs font-medium text-green-700">💰 Budget Analysis:</p>
                  <p className="text-xs text-gray-600">
                    Estimated: NPR {msg.budgetAnalysis.estimatedCost?.low?.toLocaleString()} - {msg.budgetAnalysis.estimatedCost?.high?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">Feasibility: {msg.budgetAnalysis.feasibility}</p>
                </div>
              )}

              {/* Organizer suggestions */}
              {msg.organizers && msg.organizers.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.organizers.map((organizer, idx) => (
                    <div key={organizer.id || idx} className="p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{organizer.name}</p>
                          <p className="text-xs text-gray-500">{organizer.specialization}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {organizer.rating && (
                              <span className="flex items-center gap-0.5 text-xs">
                                <Star className="w-3 h-3 text-yellow-500" /> {organizer.rating}
                              </span>
                            )}
                            {organizer.responseTime && (
                              <span className="flex items-center gap-0.5 text-xs">
                                <Clock className="w-3 h-3" /> {organizer.responseTime}
                              </span>
                            )}
                            {organizer.completedEvents > 0 && (
                              <span className="text-xs">
                                {organizer.completedEvents} events
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full shrink-0">
                          {organizer.matchScore}% match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="p-4 bg-gray-100 rounded-bl-none rounded-2xl">
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

      {/* Detected entity panel - Show from last AI message */}
      {/* Detected entity panel */}
{messages.length > 0 && messages[messages.length-1].sender === 'ai' && messages[messages.length-1].entities && (
  <div className="px-4 py-3 border-t border-gray-100">
    <div className="flex items-center gap-2 mb-2">
      <Search className="w-4 h-4 text-blue-600" />
      <span className="text-sm font-medium text-gray-800">AI Detected:</span>
    </div>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {/* Show Event Type */}
      {messages[messages.length-1].entities.eventType && (
        <div className="bg-blue-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Building className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Event</span>
          </div>
          <p className="text-xs font-medium text-gray-800">
            {messages[messages.length-1].entities.eventType}
          </p>
        </div>
      )}
      
      {/* Show Location */}
      {messages[messages.length-1].entities.location && (
        <div className="bg-blue-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Location</span>
          </div>
          <p className="text-xs font-medium text-gray-800">
            {messages[messages.length-1].entities.location}
          </p>
        </div>
      )}
      
      {/* Show Date */}
      {messages[messages.length-1].entities.date && (
        <div className="bg-blue-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Date</span>
          </div>
          <p className="text-xs font-medium text-gray-800">
            {messages[messages.length-1].entities.date}
          </p>
        </div>
      )}
      
      {/* Show Guest Count - NOW USING guestCount */}
      {messages[messages.length-1].entities.guestCount && (
        <div className="bg-blue-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Guests</span>
          </div>
          <p className="text-xs font-medium text-gray-800">
            {messages[messages.length-1].entities.guestCount}
          </p>
        </div>
      )}
      
      {/* Show Budget */}
      {messages[messages.length-1].entities.budget && (
        <div className="bg-blue-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Budget</span>
          </div>
          <p className="text-xs font-medium text-gray-800">
            {messages[messages.length-1].entities.budget}
          </p>
        </div>
      )}
    </div>
  </div>
)}

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 p-3 mx-4 mb-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your event needs… e.g. 'wedding in Kathmandu for 100 people with 9 lakh budget'"
            className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            disabled={aiLoading || !isAuthenticated || authLoading}
          />
          <button
            type="submit"
            disabled={aiLoading || !input.trim() || !isAuthenticated || authLoading}
            className="flex items-center gap-2 px-5 py-3 text-white transition-opacity rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 shrink-0"
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