import { Search, FileText, HelpCircle, ChevronRight, BookOpen, Filter, XCircle, Clock, Eye, ThumbsUp, AlertTriangle, Brain, Sparkles, RefreshCw, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const FAQViewer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const categories = [
    { id: 'all', name: 'All FAQs', count: 45, color: 'from-indigo-500 to-purple-500' },
    { id: 'booking', name: 'Booking & Tickets', count: 12, color: 'from-blue-500 to-cyan-500' },
    { id: 'payment', name: 'Payment & Refunds', count: 8, color: 'from-emerald-500 to-green-500' },
    { id: 'event', name: 'Event Details', count: 10, color: 'from-amber-500 to-yellow-500' },
    { id: 'account', name: 'Account & Profile', count: 7, color: 'from-purple-500 to-indigo-500' },
    { id: 'technical', name: 'Technical Support', count: 8, color: 'from-rose-500 to-pink-500' }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I book an event?",
      answer: "To book an event, navigate to the event page and click the 'Book Now' button. Follow the steps to select tickets, provide attendee information, and complete payment. You'll receive a confirmation email with your ticket.",
      category: 'booking',
      views: 1245,
      lastUpdated: '2 days ago',
      helpful: 98,
      aiConfidence: 95
    },
    {
      id: 2,
      question: "What's your cancellation policy?",
      answer: "Cancellations are accepted up to 48 hours before the event for a full refund. Within 48 hours, a 50% refund is available. No refunds are provided for no-shows. Special events may have different policies as specified on the event page.",
      category: 'payment',
      views: 892,
      lastUpdated: '1 week ago',
      helpful: 92,
      aiConfidence: 88
    },
    {
      id: 3,
      question: "Can I transfer my ticket to someone else?",
      answer: "Yes, you can transfer your ticket through your account dashboard up to 24 hours before the event. Go to 'My Tickets', select the ticket, and click 'Transfer'. You'll need the recipient's email address.",
      category: 'booking',
      views: 567,
      lastUpdated: '3 days ago',
      helpful: 95,
      aiConfidence: 92
    },
    {
      id: 4,
      question: "How do I contact customer support?",
      answer: "You can contact support through the chat widget (available 24/7), email at support@events.com, or call +1-800-EVENTS. For urgent issues during an event, use the in-app emergency contact feature.",
      category: 'technical',
      views: 345,
      lastUpdated: '1 day ago',
      helpful: 96,
      aiConfidence: 94
    },
    {
      id: 5,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and local payment methods in selected regions. All payments are processed securely through our PCI-compliant payment gateway.",
      category: 'payment',
      views: 678,
      lastUpdated: '2 weeks ago',
      helpful: 97,
      aiConfidence: 96
    },
    {
      id: 6,
      question: "How do I create an organizer account?",
      answer: "Click 'Become an Organizer' in the main menu, fill out the application form with your details and business information. Our team reviews applications within 2 business days. Once approved, you can start creating events.",
      category: 'account',
      views: 234,
      lastUpdated: '5 days ago',
      helpful: 93,
      aiConfidence: 90
    }
  ];

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'from-gray-500 to-slate-500';
  };

  const getCategoryBadge = (categoryId) => {
    const colors = {
      booking: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200',
      payment: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200',
      event: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200',
      account: 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200',
      technical: 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-rose-200'
    };
    return colors[categoryId] || 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200';
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const totalViews = faqs.reduce((acc, faq) => acc + faq.views, 0);
  const avgHelpful = Math.round(faqs.reduce((acc, faq) => acc + faq.helpful, 0) / faqs.length);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Main Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  AI-Powered FAQ Database
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </span>
                </h2>
                <p className="text-sm text-gray-600">
                  Search or browse frequently asked questions with AI-powered answers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Updated daily by AI
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8 bg-gray-50/50 border-b border-gray-200">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Total FAQs</p>
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100">
                <HelpCircle className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{faqs.length}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Total Views</p>
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">Helpful Rate</p>
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-600">{avgHelpful}%</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-600">AI Confidence</p>
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-purple-600">94%</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-6 md:p-8 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs (AI will find relevant answers)..."
                className="w-full pl-12 pr-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={`px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300 border ${
                  filterMenuOpen || selectedCategory !== 'all'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {categories.find(c => c.id === selectedCategory)?.name || 'All FAQs'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Filter Dropdown */}
          {filterMenuOpen && (
            <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-lg animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { 
                      setSelectedCategory(cat.id); 
                      setFilterMenuOpen(false); 
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedCategory === cat.id 
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-md` 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-1.5 text-xs opacity-75">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* AI Search Tips */}
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-800">
                  <span className="font-semibold">AI Tip:</span> Try natural language queries like 
                  "how to get refund" or "booking problems". The AI understands context and can find relevant answers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="p-6 md:p-8">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-xl hover:border-orange-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${getCategoryColor(faq.category)} bg-opacity-10`}>
                        <HelpCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-left text-base mb-2">
                          {faq.question}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadge(faq.category)}`}>
                            {faq.category}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            {faq.views} views
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <ThumbsUp className="w-3 h-3" />
                            {faq.helpful}% helpful
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {faq.lastUpdated}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                        expandedFAQ === faq.id ? 'transform rotate-90' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-5 pb-5 animate-fade-in">
                      <div className="pl-14 border-t border-gray-100 pt-5">
                        <p className="text-gray-700 mb-4 leading-relaxed">{faq.answer}</p>
                        
                        {/* AI Confidence Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-500" />
                              AI Confidence
                            </span>
                            <span className="font-medium text-purple-700">{faq.aiConfidence}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${faq.aiConfidence}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>AI-Powered Answer</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Human-Verified</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium">
                              Was this helpful?
                            </button>
                            <button className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                              Report issue
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No matching FAQs found</h3>
              <p className="text-gray-500 mb-6">
                Try different keywords or ask the AI assistant for help
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredFAQs.length}</span> of {faqs.length} FAQs shown
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">AI-Powered Answers</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Human-Verified</span>
              </div>
              <button className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Ask New Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQViewer;