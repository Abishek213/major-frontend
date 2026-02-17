import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Globe, 
  Bot, 
  User, 
  Send, 
  Paperclip, 
  Zap, 
  BookOpen,
  Shield,
  BarChart3,
  MessageCircle,
  Calendar,
  DollarSign,
  Activity,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  Award,
  Clock,
  MapPin,
  Users,
  Tag,
  Camera,
  FileText,
  Settings,
  ChevronDown,
  RefreshCw,
  Filter,
  Search,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import AIBadge, { AIAgentBadge, AIRiskBadge, AISentimentBadge } from './AIBadge';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI booking assistant. I can help you with event bookings, answer FAQs, and support multiple languages. I can also route your queries to specialized AI agents for fraud detection, analytics, sentiment analysis, and event planning. How can I help you today?",
      sender: 'ai',
      timestamp: '10:00 AM',
      agent: 'assistant'
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [isAIMode, setIsAIMode] = useState(true);
  const [currentAgent, setCurrentAgent] = useState('assistant');
  const [agentMode, setAgentMode] = useState('auto');
  const [faqSuggestions, setFaqSuggestions] = useState([
    "How do I book an event?",
    "What's the cancellation policy?",
    "Can I transfer my ticket?",
    "How do I contact support?"
  ]);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const agents = {
    fraud: {
      name: 'Fraud Detection',
      icon: Shield,
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      iconColor: 'text-rose-600',
      keywords: ['fraud', 'scam', 'suspicious', 'security', 'blocked', 'payment failed', 'chargeback', 'unauthorized'],
      description: 'Specializes in detecting and preventing fraudulent activities',
      capabilities: [
        'Analyze suspicious transactions',
        'Check for payment anomalies',
        'Verify user identities',
        'Flag high-risk bookings'
      ]
    },
    analytics: {
      name: 'Analytics',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
      keywords: ['analytics', 'trends', 'statistics', 'data', 'report', 'metrics', 'performance', 'insights'],
      description: 'Provides platform-wide data analysis and trend reporting',
      capabilities: [
        'Generate performance reports',
        'Analyze user behavior',
        'Track event trends',
        'Provide market insights'
      ]
    },
    sentiment: {
      name: 'Sentiment',
      icon: MessageCircle,
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      iconColor: 'text-purple-600',
      keywords: ['sentiment', 'feedback', 'review', 'rating', 'opinion', 'comment', 'toxic', 'moderation'],
      description: 'Analyzes user feedback and detects sentiment patterns',
      capabilities: [
        'Analyze review sentiment',
        'Detect toxic content',
        'Extract key feedback',
        'Generate insights'
      ]
    },
    planning: {
      name: 'Event Planning',
      icon: Calendar,
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      iconColor: 'text-emerald-600',
      keywords: ['plan', 'create event', 'organize', 'schedule', 'venue', 'pricing', 'capacity', 'planning'],
      description: 'Assists with event creation and optimization',
      capabilities: [
        'Suggest optimal pricing',
        'Recommend tags',
        'Advise on capacity',
        'Optimize event timing'
      ]
    },
    negotiation: {
      name: 'Negotiation',
      icon: DollarSign,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      keywords: ['negotiate', 'offer', 'budget', 'proposal', 'counter', 'deal', 'bidding', 'price'],
      description: 'Manages event requests and custom event bidding',
      capabilities: [
        'Analyze competitor offers',
        'Suggest optimal bids',
        'Track negotiation status',
        'Provide win probability'
      ]
    },
    dashboard: {
      name: 'Dashboard',
      icon: Activity,
      color: 'from-indigo-500 to-violet-500',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      iconColor: 'text-indigo-600',
      keywords: ['dashboard', 'overview', 'metrics', 'performance', 'stats', 'analytics', 'summary'],
      description: 'Provides real-time insights and analytics',
      capabilities: [
        'Track key metrics',
        'Monitor event performance',
        'Generate reports',
        'Visualize data'
      ]
    },
    recommendations: {
      name: 'Recommendations',
      icon: Star,
      color: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      iconColor: 'text-pink-600',
      keywords: ['recommend', 'suggest', 'similar', 'like this', 'related', 'personalized'],
      description: 'Suggests personalized events based on preferences',
      capabilities: [
        'Personalized event suggestions',
        'Similar event discovery',
        'Trending recommendations',
        'Category-based suggestions'
      ]
    },
    assistant: {
      name: 'General Assistant',
      icon: Bot,
      color: 'from-cyan-500 to-teal-500',
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      iconColor: 'text-cyan-600',
      keywords: ['help', 'support', 'question', 'faq', 'how to', 'what is', 'assist'],
      description: 'Handles general queries and routes to specialized agents',
      capabilities: [
        'Answer FAQs',
        'Provide booking support',
        'Multilingual assistance',
        'Route to specialists'
      ]
    }
  };

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

  const detectAgent = (text) => {
    const lowerText = text.toLowerCase();
    
    for (const [agentId, agent] of Object.entries(agents)) {
      if (agent.keywords.some(keyword => lowerText.includes(keyword))) {
        return agentId;
      }
    }
    
    return 'assistant';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const detectedAgent = agentMode === 'auto' ? detectAgent(input) : currentAgent;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agent: detectedAgent
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setCurrentAgent(detectedAgent);
    updateFAQSuggestions(detectedAgent);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const aiResponse = generateAIResponse(input, detectedAgent);
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const generateAIResponse = (query, agentId) => {
    const agent = agents[agentId];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const responses = {
      fraud: {
        en: `🔒 **Fraud Detection Analysis**\n\nI've analyzed your query about "${query}". Based on our security protocols, I recommend:\n\n• Reviewing recent transaction patterns\n• Enabling two-factor authentication\n• Contacting support for suspicious activities\n\nWould you like me to run a security check on any specific transaction?`,
      },
      analytics: {
        en: `📊 **Analytics Insights**\n\nBased on your interest in "${query}", here are some key metrics:\n\n• Platform growth: +15% this month\n• Most popular category: Music Events\n• Peak booking times: Weekends 2-6 PM\n\nWhat specific metrics would you like to explore?`,
      },
      sentiment: {
        en: `💭 **Sentiment Analysis**\n\nI've analyzed feedback related to "${query}". Key findings:\n\n• Overall sentiment: Positive (78%)\n• Common keywords: great, organized, fun\n• Action items: Address parking concerns\n\nWould you like detailed review analysis?`,
      },
      planning: {
        en: `📅 **Event Planning Assistant**\n\nFor your query about "${query}", I can help with:\n\n• Optimal pricing based on market data\n• Recommended tags for discoverability\n• Capacity planning suggestions\n• Best dates for your event type\n\nWhat aspect would you like to optimize?`,
      },
      negotiation: {
        en: `💰 **Negotiation Assistant**\n\nRegarding "${query}", here's my analysis:\n\n• Market rate range: $500 - $2000\n• Your win probability: 75%\n• Competitor offers: 3 active\n• Suggested counter-offer: $1500\n\nShall I prepare a proposal?`,
      },
      dashboard: {
        en: `📈 **Dashboard Insights**\n\nBased on "${query}", here's your current snapshot:\n\n• Total events: 12\n• Total attendees: 345\n• Revenue: $12,450\n• Avg rating: 4.5 ⭐\n\nWhat metrics would you like to monitor?`,
      },
      recommendations: {
        en: `🎯 **Personalized Recommendations**\n\nBased on your interest in "${query}", I recommend:\n\n• Similar events in your area\n• Trending in your favorite categories\n• Early bird specials this week\n• Events followed by friends\n\nWould you like me to show you these recommendations?`,
      },
      assistant: {
        en: `🤖 **General Assistant**\n\nI've processed your request about "${query}". Based on our FAQ database and booking policies, here's what I found:\n\n• Check our help center for detailed guides\n• Contact support for personalized assistance\n• Browse our community forums\n\nIs there anything specific I can help you with?`,
      }
    };

    const responseText = responses[agentId]?.[language] || responses[agentId]?.en || responses.assistant.en;

    return {
      id: messages.length + 2,
      text: responseText,
      sender: 'ai',
      timestamp: timestamp,
      agent: agentId,
      confidence: Math.floor(Math.random() * 20 + 80)
    };
  };

  const updateFAQSuggestions = (agentId) => {
    const suggestions = {
      fraud: [
        "Check if my payment is secure",
        "Report suspicious activity",
        "Enable two-factor authentication",
        "Review my recent transactions"
      ],
      analytics: [
        "Show me platform statistics",
        "Event category trends",
        "User growth metrics",
        "Revenue analysis"
      ],
      sentiment: [
        "Analyze recent reviews",
        "Check event ratings",
        "Detect toxic comments",
        "Get feedback insights"
      ],
      planning: [
        "Suggest pricing for my event",
        "Recommend event tags",
        "Optimal event timing",
        "Capacity planning help"
      ],
      negotiation: [
        "Competitor analysis",
        "How to win bids",
        "Pricing strategy",
        "Negotiation tips"
      ],
      dashboard: [
        "Show my event metrics",
        "Performance overview",
        "Attendance statistics",
        "Revenue breakdown"
      ],
      recommendations: [
        "Find events near me",
        "Personalized suggestions",
        "Trending events",
        "Events like this"
      ],
      assistant: [
        "How do I book an event?",
        "Cancellation policy",
        "Transfer my ticket",
        "Contact support"
      ]
    };

    setFaqSuggestions(suggestions[agentId] || suggestions.assistant);
  };

  const handleFAQClick = (question) => {
    setInput(question);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      let agent = 'assistant';
      if (file.type.includes('image')) {
        agent = 'planning';
      } else if (file.name.includes('review') || file.name.includes('feedback')) {
        agent = 'sentiment';
      } else if (file.name.includes('transaction') || file.name.includes('payment')) {
        agent = 'fraud';
      }

      const message = {
        id: messages.length + 1,
        text: `Uploaded document: ${file.name}`,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hasFile: true,
        agent: agent
      };
      setMessages(prev => [...prev, message]);
      setCurrentAgent(agent);
      updateFAQSuggestions(agent);
    }
  };

  const handleAgentSwitch = (agentId) => {
    setCurrentAgent(agentId);
    setAgentMode('manual');
    setShowAgentMenu(false);
    updateFAQSuggestions(agentId);
    
    const switchMessage = {
      id: messages.length + 1,
      text: `Switched to **${agents[agentId].name}**. How can I help you with ${agents[agentId].description.toLowerCase()}?`,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agent: agentId,
      isSystem: true
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  const currentAgentData = agents[currentAgent];

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Main Chat Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentAgentData.color} flex items-center justify-center shadow-lg`}>
                {React.createElement(currentAgentData.icon, { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    AI Booking Assistant
                  </h2>
                  <AIBadge agent={currentAgent} size="sm" />
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAIMode ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                    <span className="text-xs md:text-sm text-gray-600">
                      {isAIMode ? 'AI Assistant Active' : 'Human Agent'}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">24/7 Support</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10 animate-fade-in">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                          language === lang.code ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 font-medium' : ''
                        }`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* AI/Human Toggle */}
              <button
                onClick={() => setIsAIMode(!isAIMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isAIMode
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md hover:shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isAIMode ? (
                  <>
                    <Bot className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Mode</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Human Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Agent Mode Toggle & Current Agent */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">Agent Routing:</span>
              <button
                onClick={() => setAgentMode('auto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  agentMode === 'auto'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Auto-detect
              </button>
              <button
                onClick={() => setAgentMode('manual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  agentMode === 'manual'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Manual
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Current Agent:</span>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentAgentData.bg} border ${currentAgentData.border}`}>
                {React.createElement(currentAgentData.icon, { className: `w-4 h-4 ${currentAgentData.iconColor}` })}
                <span className={`text-xs font-medium ${currentAgentData.text}`}>
                  {currentAgentData.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Quick Switch - Manual Mode */}
        {agentMode === 'manual' && (
          <div className="p-3 border-b border-gray-200 bg-gray-50/80">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300">
              {Object.entries(agents).map(([id, agent]) => {
                const Icon = agent.icon;
                return (
                  <button
                    key={id}
                    onClick={() => handleAgentSwitch(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all duration-300 ${
                      currentAgent === id
                        ? `bg-gradient-to-r ${agent.color} text-white shadow-md hover:shadow-lg`
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{agent.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQ Suggestions */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${currentAgentData.bg}`}>
                <Zap className={`w-4 h-4 ${currentAgentData.iconColor}`} />
              </div>
              <span className="text-sm font-semibold text-gray-800">Quick Questions:</span>
            </div>
            <AIBadge agent={currentAgent} size="sm" showScore={false} />
          </div>
          <div className="flex flex-wrap gap-2">
            {faqSuggestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleFAQClick(question)}
                className="group px-4 py-2 text-xs bg-white border border-gray-200 hover:border-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 text-gray-700 hover:text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="h-[200px] md:h-[300px] overflow-y-auto p-4 md:p-6 bg-gray-50/30">
          <div className="space-y-4">
            {messages.map((msg) => {
              const msgAgent = agents[msg.agent || 'assistant'];
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none'
                        : msg.isSystem
                          ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-bl-none'
                          : `bg-gradient-to-r ${msgAgent.color} text-white rounded-bl-none`
                    } shadow-md hover:shadow-lg transition-shadow duration-300`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {msg.sender === 'ai' ? (
                          <>
                            <div className="p-1 rounded-lg bg-white/20">
                              {React.createElement(msgAgent.icon, { className: "w-3 h-3" })}
                            </div>
                            <span className="text-xs opacity-90">
                              {msgAgent.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="p-1 rounded-lg bg-white/20">
                              <User className="w-3 h-3" />
                            </div>
                            <span className="text-xs opacity-90">You</span>
                          </>
                        )}
                        <span className="text-xs opacity-50">• {msg.timestamp}</span>
                      </div>
                      
                      {msg.sender === 'ai' && msg.confidence && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-2">
                          {msg.confidence}% confidence
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                    
                    {msg.hasFile && (
                      <div className="mt-3 p-2 bg-white/20 rounded-lg flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-xs">Document processed by {msgAgent.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {typing && (
              <div className="flex justify-start animate-fade-in">
                <div className={`bg-gradient-to-r ${currentAgentData.color} text-white rounded-2xl rounded-bl-none p-4 shadow-md`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs opacity-90">{currentAgentData.name} is typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-gray-200 bg-white">
          <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              {/* File Upload */}
              <label className="cursor-pointer p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 hover:scale-110">
                <Paperclip className="w-5 h-5 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                />
              </label>
              
              {/* Agent Selector - Mobile */}
              {agentMode === 'manual' && (
                <div className="relative sm:hidden">
                  <button
                    type="button"
                    onClick={() => setShowAgentMenu(!showAgentMenu)}
                    className={`p-3 rounded-xl ${currentAgentData.bg} border ${currentAgentData.border}`}
                  >
                    {React.createElement(currentAgentData.icon, { className: `w-5 h-5 ${currentAgentData.iconColor}` })}
                  </button>
                  
                  {showAgentMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
                      {Object.entries(agents).map(([id, agent]) => {
                        const Icon = agent.icon;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              handleAgentSwitch(id);
                              setShowAgentMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                              currentAgent === id ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : ''
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {agent.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about bookings, policies, or upload a document...`}
                className="w-full px-4 py-3 pr-24 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {languages.find(l => l.code === language)?.flag}
              </div>
            </div>
            
            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          
          {/* Status Bar */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
              <span>•</span>
              <span>Multilingual Support</span>
              <span>•</span>
              <span className="hidden sm:inline">Agent: {currentAgentData.name}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg ${currentAgentData.bg} text-xs font-medium ${currentAgentData.text}`}>
              {isAIMode ? `${currentAgentData.name} Processing...` : 'Human Agent Connected'}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Info Card (Optional) */}
      {agentMode === 'manual' && (
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${currentAgentData.bg}`}>
              {React.createElement(currentAgentData.icon, { className: `w-5 h-5 ${currentAgentData.iconColor}` })}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">{currentAgentData.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{currentAgentData.description}</p>
              <div className="flex flex-wrap gap-2">
                {currentAgentData.capabilities.map((cap, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;