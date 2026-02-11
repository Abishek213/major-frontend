import { MessageSquare, Globe, Bot, User, Send, Paperclip, Zap, BookOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI booking assistant. I can help you with event bookings, answer FAQs, and support multiple languages. How can I help you today?",
      sender: 'ai',
      timestamp: '10:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [isAIMode, setIsAIMode] = useState(true);
  const [faqSuggestions] = useState([
    "How do I book an event?",
    "What's the cancellation policy?",
    "Can I transfer my ticket?",
    "How do I contact support?"
  ]);
  const messagesEndRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
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
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        en: "I've processed your request. Based on our FAQ database and booking policies, here's what I found...",
        es: "He procesado su solicitud. Basándome en nuestra base de datos de preguntas frecuentes y políticas de reserva, esto es lo que encontré...",
        fr: "J'ai traité votre demande. Sur la base de notre base de données FAQ et des politiques de réservation, voici ce que j'ai trouvé...",
        de: "Ich habe Ihre Anfrage bearbeitet. Basierend auf unserer FAQ-Datenbank und Buchungsrichtlinien habe ich Folgendes gefunden...",
        hi: "मैंने आपका अनुरोध संसाधित कर लिया है। हमारे एफएक्यू डेटाबेस और बुकिंग नीतियों के आधार पर, मुझे यह मिला...",
        ne: "मैले तपाईंको अनुरोध प्रशोधन गरेको छु। हाम्रो एफएक्यू डाटाबेस र बुकिङ नीतिहरूको आधारमा, मैले यो फेला परेको छु..."
      };

      const aiResponse = {
        id: messages.length + 2,
        text: responses[language] || responses.en,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: isAIMode
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFAQClick = (question) => {
    setInput(question);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate file processing
      const message = {
        id: messages.length + 1,
        text: `Uploaded document: ${file.name}`,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasFile: true
      };
      setMessages(prev => [...prev, message]);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Booking Support</h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isAIMode ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="text-xs text-gray-600">
                    {isAIMode ? 'AI Assistant Active' : 'Human Agent'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">24/7 Support</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-gray-100 text-gray-700 text-sm py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <Globe className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            {/* AI/Human Toggle */}
            <button
              onClick={() => setIsAIMode(!isAIMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isAIMode
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
            >
              {isAIMode ? (
                <>
                  <Bot className="w-4 h-4" />
                  AI Mode
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Human Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Suggestions */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">Quick Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {faqSuggestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleFAQClick(question)}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : msg.isAI === false
                      ? 'bg-purple-600 text-white rounded-bl-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {msg.sender === 'ai' ? (
                      msg.isAI === false ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-green-600" />
                      )
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs opacity-75">
                      {msg.sender === 'ai'
                        ? msg.isAI === false
                          ? 'Human Agent'
                          : 'AI Assistant'
                        : 'You'} • {msg.timestamp}
                    </span>
                  </div>
                  {msg.sender === 'ai' && msg.isAI && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      AI
                    </span>
                  )}
                </div>
                <p className="text-sm">{msg.text}</p>
                
                {msg.hasFile && (
                  <div className="mt-2 p-2 bg-white/20 rounded-lg flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-xs">Document processed by AI</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSend} className="flex gap-2">
          {/* File Upload */}
          <label className="cursor-pointer p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-600" />
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
            />
          </label>
          
          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about bookings, policies, or upload a document... (${languages.find(l => l.code === language)?.name})`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </form>
        
        {/* Status Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <span>•</span>
            <span>Multilingual Support</span>
            <span>•</span>
            <span>FAQ Database</span>
          </div>
          <div>
            {isAIMode ? 'AI Processing...' : 'Agent Connected'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;