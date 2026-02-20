import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  FileText,
  DollarSign,
  Ticket,
  UserCircle,
  ClipboardList,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Brain,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  ChevronRight,
  Bot,
  HelpCircle,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  Clock,
  Users,
  Calendar,
  Shield,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
  Home,
  ArrowLeft,
  Filter,
  RefreshCw,
  Download,
  Share2,
  Smartphone  // Add this missing import
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import FAQViewer from "@/components/ai/user/FAQViewer";

// Enhanced AI Chat Component
function AIChatSupport({ isOpen, onClose }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  
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
  } = useChatAssistant();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        from: 'bot',
        text: `👋 Hello${user?.name ? ' ' + user.name : ''}! I'm your AI support assistant. I can help you with:
• Ticket issues and refunds
• Event information
• Account settings
• Technical support
• And more!`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: true,
        suggestions: ['Find my tickets', 'Request refund', 'Contact organizer', 'Transfer tickets']
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage('');
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    handleSend();
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-2 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] flex flex-col" style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-12 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Support Assistant
             
            </h3>
            <p className="text-xs text-blue-100">Online • Instant response</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-end gap-2 max-w-[85%]">
              {msg.sender !== 'user' && (
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
                  className={`group relative px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                      : msg.isError
                      ? 'bg-red-100 text-red-800 rounded-bl-none border border-red-200'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  
                  {/* Message Actions */}
                  <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleCopyMessage(msg.text, msg.id)}
                      className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-600" />
                      )}
                    </button>
                    {msg.sender !== 'user' && (
                      <>
                        <button className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition">
                          <ThumbsUp className="w-3 h-3 text-gray-600" />
                        </button>
                        <button className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition">
                          <ThumbsDown className="w-3 h-3 text-gray-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
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
              <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-4 border-t bg-white rounded-b-2xl">
        <input
          type="text"
          placeholder={`Type your question in ${language.toUpperCase()}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Footer Info */}
      <div className="px-4 pb-3 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Avg. response: &lt;10s</span>
        </div>
        <button
          onClick={clearChat}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          Clear chat
        </button>
      </div>
    </div>
  );
}

// Main Contact Page
export default function Contact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(true);
  const [expandedArticle, setExpandedArticle] = useState(null);

  // Enhanced FAQ database with AI-powered search
  const featuredArticlesAttending = [
    { 
      id: 1,
      title: 'Find your tickets', 
      icon: Ticket,
      category: 'tickets',
      views: 15432,
      helpful: 98,
      lastUpdated: '2 days ago',
      content: 'To find your tickets: 1) Log into your account, 2) Go to "My Tickets", 3) Select the event to view your tickets. You can also find tickets in your confirmation email.',
      tags: ['tickets', 'access', 'login']
    },
    { 
      id: 2,
      title: 'Request a refund', 
      icon: DollarSign,
      category: 'payments',
      views: 12345,
      helpful: 95,
      lastUpdated: '5 days ago',
      content: 'To request a refund: Navigate to "My Tickets", select the event, and click "Request Refund". Refunds are processed within 5-7 business days and subject to the event organizer cancellation policy.',
      tags: ['refund', 'payment', 'cancellation']
    },
    { 
      id: 3,
      title: 'Contact the event organizer', 
      icon: MessageSquare,
      category: 'support',
      views: 8765,
      helpful: 92,
      lastUpdated: '1 week ago',
      content: 'To contact an organizer: 1) Go to the event page, 2) Click "Contact Organizer" button, 3) Send your message. Organizers typically respond within 24 hours.',
      tags: ['organizer', 'contact', 'support']
    },
    { 
      id: 4,
      title: 'What is this charge from e-VENTA?', 
      icon: FileText,
      category: 'billing',
      views: 6789,
      helpful: 96,
      lastUpdated: '3 days ago',
      content: 'e-VENTA charges appear for ticket purchases, service fees, and event bookings. Check your email for the receipt or view your purchase history in your account.',
      tags: ['charge', 'billing', 'payment']
    },
    { 
      id: 5,
      title: 'Transfer tickets to someone else', 
      icon: Users,
      category: 'tickets',
      views: 5678,
      helpful: 94,
      lastUpdated: '4 days ago',
      content: 'To transfer tickets: 1) Go to "My Tickets", 2) Select the ticket, 3) Click "Transfer", 4) Enter recipient email. The recipient will receive an email to accept the transfer.',
      tags: ['transfer', 'tickets', 'share']
    },
    { 
      id: 6,
      title: 'Edit your order information', 
      icon: UserCircle,
      category: 'account',
      views: 4567,
      helpful: 91,
      lastUpdated: '6 days ago',
      content: 'To edit order information: Go to "My Tickets", find your order, and click "Edit Order". You can update attendee details, contact information, and ticket quantities if available.',
      tags: ['edit', 'order', 'information']
    },
  ];

  const featuredArticlesOrganizing = [
    { 
      id: 7,
      title: 'Create your first event', 
      icon: Calendar,
      category: 'organizing',
      views: 3456,
      helpful: 99,
      lastUpdated: '1 day ago',
      content: 'To create an event: 1) Click "Create Event", 2) Fill in event details, 3) Set ticket types, 4) Add description and images, 5) Publish. Our team will review within 24 hours.',
      tags: ['create', 'event', 'organizer']
    },
    { 
      id: 8,
      title: 'Set up ticket types', 
      icon: Ticket,
      category: 'organizing',
      views: 2345,
      helpful: 97,
      lastUpdated: '2 days ago',
      content: 'Configure ticket types: General Admission, VIP, Early Bird, etc. Set prices, quantities, and sale periods. You can create multiple tiers and add promo codes.',
      tags: ['tickets', 'pricing', 'organizer']
    },
    { 
      id: 9,
      title: 'Manage attendees', 
      icon: Users,
      category: 'organizing',
      views: 1987,
      helpful: 96,
      lastUpdated: '3 days ago',
      content: 'Access your attendee list from the event dashboard. View check-in status, send announcements, and export attendee data for your records.',
      tags: ['attendees', 'check-in', 'organizer']
    },
    { 
      id: 10,
      title: 'Payout and billing', 
      icon: DollarSign,
      category: 'organizing',
      views: 1876,
      helpful: 95,
      lastUpdated: '4 days ago',
      content: 'Payouts are processed 5-7 business days after your event ends. View earnings, invoices, and payout history in your organizer dashboard.',
      tags: ['payout', 'billing', 'organizer']
    },
    { 
      id: 11,
      title: 'Promote your event', 
      icon: TrendingUp,
      category: 'organizing',
      views: 1654,
      helpful: 98,
      lastUpdated: '2 days ago',
      content: 'Promote your event using social media, email marketing, and our promotional tools. Create discount codes and track marketing performance.',
      tags: ['promote', 'marketing', 'organizer']
    },
    { 
      id: 12,
      title: 'Event analytics', 
      icon: Brain,
      category: 'organizing',
      views: 1432,
      helpful: 97,
      lastUpdated: '5 days ago',
      content: 'Track ticket sales, attendee demographics, and engagement metrics. Use AI-powered insights to optimize your event strategy.',
      tags: ['analytics', 'insights', 'organizer']
    },
  ];

  const browseTopics = [
    { title: 'Buy and register', icon: DollarSign, count: 24 },
    { title: 'Your tickets', icon: Ticket, count: 18 },
    { title: 'Your account', icon: UserCircle, count: 15 },
    { title: 'Terms and policies', icon: ClipboardList, count: 12 },
    { title: 'Payments & refunds', icon: Shield, count: 20 },
    { title: 'Technical support', icon: Zap, count: 16 },
    { title: 'Organizer tools', icon: Calendar, count: 22 },
    { title: 'Mobile app', icon: Smartphone, count: 8 },
  ];

  const featuredArticles =
    activeTab === 'attending'
      ? featuredArticlesAttending
      : featuredArticlesOrganizing;

  // AI-powered search function
  useEffect(() => {
    const searchArticles = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      
      // Simulate AI search with delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allArticles = [...featuredArticlesAttending, ...featuredArticlesOrganizing];
      const query = searchQuery.toLowerCase();
      
      const results = allArticles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      ).map(article => ({
        ...article,
        relevance: Math.floor(Math.random() * 30) + 70 // Mock relevance score
      })).sort((a, b) => b.relevance - a.relevance);
      
      setSearchResults(results);
      setIsSearching(false);
    };

    const debounce = setTimeout(searchArticles, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleArticleClick = (article) => {
    setExpandedArticle(expandedArticle === article.id ? null : article.id);
  };

  const handleContactSupport = (method) => {
    if (method === 'chat') {
      setIsChatOpen(true);
    } else if (method === 'email') {
      window.location.href = 'mailto:support@eventa.com';
    } else if (method === 'phone') {
      window.location.href = 'tel:+1800EVENTA';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Help Center</span>
          </div>
        </div>
      </div>

      {/* Hero Section with AI Badge */}
      <div className="pb-8 px-4 pt-24">
        <div className="flex justify-center mb-4">
          <AIBadge 
            score={98} 
            reason="24/7 AI Support Available"
            size="lg"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center text-[#1e0a3c] mb-8">
          How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">help</span> you?
        </h1>

        {/* AI-Powered Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ask a question or search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-lg"
            />
            {isSearching && (
              <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
            )}
            {!isSearching && searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          {/* AI Search Tip */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Brain className="w-4 h-4 text-purple-600" />
            <span>Try: "How do I get a refund?", "Transfer my ticket", "Event not showing up"</span>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">AI Search Results</h3>
                  <span className="text-xs text-gray-600 ml-auto">
                    {searchResults.length} articles found
                  </span>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((result) => (
                    <div key={result.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <result.icon className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{result.title}</h4>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                {result.relevance}% match
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{result.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">{result.views} views</span>
                              <span className="text-xs text-green-600">{result.helpful}% helpful</span>
                              <span className="text-xs text-gray-500">Updated {result.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleArticleClick(result)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">No results found</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Try different keywords or ask our AI assistant
                    </p>
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium hover:opacity-90 transition"
                    >
                      Ask AI Assistant
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-8 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('attending')}
              className={`pb-4 px-2 text-sm font-medium transition-all ${
                activeTab === 'attending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Attending an event
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organizing')}
              className={`pb-4 px-2 text-sm font-medium transition-all ${
                activeTab === 'organizing'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Organizing an event
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {!searchQuery && (
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-xs text-gray-600">AI Support</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">&lt;10s</div>
              <div className="text-xs text-gray-600">Response Time</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">98%</div>
              <div className="text-xs text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Articles */}
      {!searchQuery && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1e0a3c]">Featured articles</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>AI-curated for you</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredArticles.map((article) => (
              <div key={article.id} className="relative">
                <button
                  type="button"
                  onClick={() => handleArticleClick(article)}
                  className="w-full flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <article.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-[#1e0a3c] group-hover:text-blue-600 transition">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">{article.views} views</span>
                      <span className="text-xs text-green-600">{article.helpful}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Expanded Article Content */}
                {expandedArticle === article.id && (
                  <div className="absolute left-0 right-0 mt-2 p-4 bg-white border border-blue-200 rounded-xl shadow-xl z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{article.title}</h4>
                      <button
                        onClick={() => setExpandedArticle(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">{article.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          Was this helpful? <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button className="text-xs text-gray-600 hover:text-gray-700 font-medium">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Updated {article.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse by Topic */}
      {!searchQuery && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-[#1e0a3c] mb-6">Browse by topic</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {browseTopics.map((topic) => (
              <button
                key={topic.title}
                type="button"
                className="group flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <topic.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition">
                    {topic.title}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{topic.count} articles</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact Options */}
      {!searchQuery && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">Still need help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleContactSupport('chat')}
                className="group flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <span className="font-semibold text-lg">Live Chat</span>
                <span className="text-sm text-blue-100">24/7 AI & Human Support</span>
                <span className="text-xs text-blue-200 mt-2">Avg. response: 2 min</span>
              </button>

              <button
                onClick={() => handleContactSupport('email')}
                className="group flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <span className="font-semibold text-lg">Email Support</span>
                <span className="text-sm text-blue-100">support@eventa.com</span>
                <span className="text-xs text-blue-200 mt-2">Reply within 24h</span>
              </button>

              <button
                onClick={() => handleContactSupport('phone')}
                className="group flex flex-col items-center gap-3 p-6 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <span className="font-semibold text-lg">Phone Support</span>
                <span className="text-sm text-blue-100">1-800-EVENTA</span>
                <span className="text-xs text-blue-200 mt-2">Mon-Fri, 9am-6pm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {!searchQuery && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <FAQViewer />
        </div>
      )}

      {/* Floating AI Assistant Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-full flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 z-[9999] group"
      >
        <div className="relative">
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
        </div>
        <span className="font-medium">Ask AI Assistant</span>
        <Sparkles className="w-4 h-4 animate-pulse" />
      </button>

      {/* Enhanced Chat Component */}
      <AIChatSupport isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}