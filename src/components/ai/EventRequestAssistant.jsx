import { MessageSquare, Wand2, User, Building, MapPin, Calendar, Search } from 'lucide-react';
import { useState } from 'react';

const EventRequestAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Event Assistant. Tell me what kind of event you're looking for in natural language, like 'I want a tech conference in Kathmandu next month' or 'Looking for weekend music festivals'",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [entities, setEntities] = useState(null);
  const [loading, setLoading] = useState(false);

  const extractEntities = (text) => {
    // Mock entity extraction (replace with actual AI API)
    const mockEntities = {
      eventType: text.includes('tech') ? 'Technology' : 
                 text.includes('music') ? 'Music' : 
                 text.includes('business') ? 'Business' : 'General',
      location: text.includes('kathmandu') ? 'Kathmandu' : 
               text.includes('online') ? 'Online' : 'Not specified',
      date: text.includes('next month') ? 'Next Month' : 
            text.includes('weekend') ? 'This Weekend' : 'Flexible',
      budget: text.includes('free') ? 'Free' : 
             text.includes('$') ? 'Paid' : 'Not specified',
      attendees: text.includes('small') ? 'Small' : 
                text.includes('large') ? 'Large' : 'Medium'
    };
    return mockEntities;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    // Extract entities
    const extractedEntities = extractEntities(input);
    setEntities(extractedEntities);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: `I found 3 organizers that match your request for "${extractedEntities.eventType}" events in ${extractedEntities.location}. Based on your criteria, I recommend:`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          { name: 'Tech Events Co.', match: '95%', specialization: 'Technology Conferences' },
          { name: 'Kathmandu Event Planners', match: '88%', specialization: 'Local Business Events' },
          { name: 'Digital Summit Organizers', match: '82%', specialization: 'Online Tech Events' }
        ]
      };

      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
      setInput('');
    }, 1500);
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <Wand2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Event Request Assistant</h3>
              <p className="text-sm text-gray-600">Describe your event needs in natural language</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Powered by AI
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-sm text-gray-600 mb-3">Try saying:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Tech conference in Kathmandu",
            "Weekend music festival",
            "Free online workshop next week",
            "Business networking event"
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="h-96 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.sender === 'ai' ? (
                    <Wand2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {msg.sender === 'ai' ? 'AI Assistant' : 'You'} • {msg.timestamp}
                  </span>
                </div>
                <p className="text-sm">{msg.text}</p>

                {/* Show suggestions if available */}
                {msg.suggestions && (
                  <div className="mt-3 space-y-2">
                    {msg.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/20 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{suggestion.name}</p>
                            <p className="text-xs opacity-90">{suggestion.specialization}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            {suggestion.match} match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none p-4">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs text-gray-600">AI is processing your request...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entity Extraction Display */}
      {entities && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">AI Detected:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(entities).map(([key, value]) => (
              <div key={key} className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  {key === 'location' && <MapPin className="w-3 h-3 text-blue-600" />}
                  {key === 'date' && <Calendar className="w-3 h-3 text-blue-600" />}
                  {key === 'eventType' && <Building className="w-3 h-3 text-blue-600" />}
                  <span className="text-xs font-medium text-blue-700 capitalize">{key}</span>
                </div>
                <p className="text-sm text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your event needs... (e.g., 'I need a venue for 100 people next month')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
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