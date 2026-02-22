import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import LanguageSelector from '@/components/ui/language-selector';
import {
  Bot,
  User,
  Send,
  Globe,
  Paperclip,
  X,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Loader,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';

const ChatBox = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true); // Set to false by default, true for development
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const {
    messages,
    loading,
    language,
    setLanguage,
    isAIMode,
    setIsAIMode,
    sendMessage,
    clearChat,
    switchToHuman,
    conversationHistory,
  } = useChatAssistant();

  // Preset questions - Now dynamic based on language
  const getPresetQuestions = () => {
    const questions = {
      en: [
        'How do I cancel my booking?',
        'What is your refund policy?',
        'Can I transfer my ticket?',
        'Where is my e-ticket?',
      ],
      es: [
        '¿Cómo cancelo mi reserva?',
        '¿Cuál es su política de reembolso?',
        '¿Puedo transferir mi boleto?',
        '¿Dónde está mi boleto electrónico?',
      ],
      fr: [
        'Comment annuler ma réservation ?',
        'Quelle est votre politique de remboursement ?',
        'Puis-je transférer mon billet ?',
        'Où est mon billet électronique ?',
      ],
      hi: [
        'मैं अपनी बुकिंग कैसे रद्द करूं?',
        'आपकी रिफंड नीति क्या है?',
        'क्या मैं अपना टिकट ट्रांसफर कर सकता हूं?',
        'मेरा ई-टिकट कहां है?',
      ],
      ne: [
        'म कसरी मेरो बुकिङ रद्द गर्न सक्छु?',
        'तपाईंको रिफन्ड नीति के हो?',
        'के म मेरो टिकट स्थानान्तरण गर्न सक्छु?',
        'मेरो ई-टिकट कहाँ छ?',
      ],
    };
    return questions[language] || questions.en;
  };

  // Welcome message based on language
  const getWelcomeMessage = () => {
    const welcome = {
      en: `👋 Hello${user?.name ? ' ' + user.name : ''}! I'm your AI booking assistant. I can help you with bookings, cancellations, refunds, and answer any questions 24/7.`,
      es: `👋 ¡Hola${user?.name ? ' ' + user.name : ''}! Soy tu asistente de reservas AI. Puedo ayudarte con reservas, cancelaciones, reembolsos y responder cualquier pregunta 24/7.`,
      fr: `👋 Bonjour${user?.name ? ' ' + user.name : ''}! Je suis votre assistant de réservation AI. Je peux vous aider avec les réservations, annulations, remboursements et répondre à toutes vos questions 24/7.`,
      hi: `👋 नमस्ते${user?.name ? ' ' + user.name : ''}! मैं आपका AI बुकिंग सहायक हूं। मैं बुकिंग, रद्दीकरण, रिफंड और किसी भी सवाल का जवाब 24/7 दे सकता हूं।`,
      ne: `👋 नमस्ते${user?.name ? ' ' + user.name : ''}! म तपाईंको AI बुकिङ सहायक हुँ। म बुकिङ, रद्दीकरण, रिफन्ड र कुनै पनि प्रश्नहरूको जवाफ 24/7 दिन सक्छु।`,
    };
    return welcome[language] || welcome.en;
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: getWelcomeMessage(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: true,
      };
      setMessages([welcomeMessage]);
    }
  }, [language, user, messages.length, setMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (event) => {
    event?.preventDefault();
    if (!inputValue.trim() && !file) return;
    
    await sendMessage(inputValue, file);
    setInputValue('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePresetQuestion = (question) => {
    setInputValue(question);
    handleSendMessage();
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      // Check file size (max 5MB)
      if (uploadedFile.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      setFile(uploadedFile);
    }
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (messageId, type) => {
    setFeedbackGiven(prev => ({ ...prev, [messageId]: type }));
    // Send feedback to API
    console.log(`Feedback for message ${messageId}: ${type}`);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return timestamp;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 
          rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
          hover:scale-110 flex items-center justify-center z-50 group"
      >
        <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-blue-100">Online • 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col"
         style={{ height: '650px' }}>
      
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                AI Booking Assistant
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {isAIMode ? 'AI' : 'Human'}
                </span>
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Wifi className="w-3 h-3 text-green-300" />
                <span className="text-xs text-blue-100">24/7 Online • Instant Response</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              compact={true}
            />
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI/Human Toggle */}
        <div className="flex items-center gap-2 mt-3 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setIsAIMode(true)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              isAIMode
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Assistant
          </button>
          <button
            onClick={switchToHuman}
            className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              !isAIMode
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-white hover:bg-white/20'
            }`}
          >
            <User className="w-4 h-4" />
            Human Agent
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                    {msg.isAI === false ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
                
                <div className="flex flex-col">
                  <div
                    className={`group relative rounded-2xl p-3 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                        : msg.isError
                        ? 'bg-red-100 text-red-800 rounded-bl-none border border-red-200'
                        : msg.isAI === false
                        ? 'bg-purple-100 text-purple-800 rounded-bl-none border border-purple-200'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-75">
                          {msg.sender === 'user' ? 'You' : msg.agentName || 'AI Assistant'}
                        </span>
                      </div>
                      <span className="text-xs opacity-50">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    
                    {msg.hasFile && (
                      <div className="mt-2 p-2 bg-white/20 rounded-lg flex items-center gap-2">
                        <Paperclip className="w-3 h-3" />
                        <span className="text-xs">Document attached</span>
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-600" />
                        )}
                      </button>
                      {msg.sender === 'ai' && (
                        <>
                          <button
                            onClick={() => handleFeedback(msg.id, 'like')}
                            className={`p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition ${
                              feedbackGiven[msg.id] === 'like' ? 'text-green-600' : 'text-gray-600'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'dislike')}
                            className={`p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition ${
                              feedbackGiven[msg.id] === 'dislike' ? 'text-red-600' : 'text-gray-600'
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-gray-700">Quick Questions</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {getPresetQuestions().map((question, index) => (
            <button
              key={index}
              onClick={() => handlePresetQuestion(question)}
              className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 
                rounded-full text-xs text-gray-700 transition whitespace-nowrap
                hover:shadow-md"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* File Attachment Preview */}
      {file && (
        <div className="flex-shrink-0 mx-4 mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="w-4 h-4 text-blue-600" />
            <span className="text-sm truncate text-blue-700">{file.name}</span>
            <span className="text-xs text-blue-500">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="p-1 hover:bg-blue-100 rounded transition"
          >
            <X className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <label className="cursor-pointer p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            <Paperclip className="w-5 h-5 text-gray-600" />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            />
          </label>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Type your message in ${language.toUpperCase()}...`}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              bg-white text-gray-900 placeholder-gray-500 text-sm"
          />
          
          <button
            type="submit"
            disabled={!inputValue.trim() && !file}
            className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 
              text-white rounded-lg hover:opacity-90 disabled:opacity-50 
              disabled:cursor-not-allowed transition-all hover:shadow-md
              flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Response in {loading ? '...' : '&lt; 10s'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isAIMode ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <span>{isAIMode ? 'AI Mode' : 'Human Mode'}</span>
          </div>
          <button
            onClick={clearChat}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            Clear chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;