import { Search, FileText, HelpCircle, ChevronRight, BookOpen, Filter } from 'lucide-react';
import { useState } from 'react';

const FAQViewer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = [
    { id: 'all', name: 'All FAQs', count: 45 },
    { id: 'booking', name: 'Booking & Tickets', count: 12 },
    { id: 'payment', name: 'Payment & Refunds', count: 8 },
    { id: 'event', name: 'Event Details', count: 10 },
    { id: 'account', name: 'Account & Profile', count: 7 },
    { id: 'technical', name: 'Technical Support', count: 8 }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I book an event?",
      answer: "To book an event, navigate to the event page and click the 'Book Now' button. Follow the steps to select tickets, provide attendee information, and complete payment. You'll receive a confirmation email with your ticket.",
      category: 'booking',
      views: 1245,
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      question: "What's your cancellation policy?",
      answer: "Cancellations are accepted up to 48 hours before the event for a full refund. Within 48 hours, a 50% refund is available. No refunds are provided for no-shows. Special events may have different policies as specified on the event page.",
      category: 'payment',
      views: 892,
      lastUpdated: '1 week ago'
    },
    {
      id: 3,
      question: "Can I transfer my ticket to someone else?",
      answer: "Yes, you can transfer your ticket through your account dashboard up to 24 hours before the event. Go to 'My Tickets', select the ticket, and click 'Transfer'. You'll need the recipient's email address.",
      category: 'booking',
      views: 567,
      lastUpdated: '3 days ago'
    },
    {
      id: 4,
      question: "How do I contact customer support?",
      answer: "You can contact support through the chat widget (available 24/7), email at support@events.com, or call +1-800-EVENTS. For urgent issues during an event, use the in-app emergency contact feature.",
      category: 'technical',
      views: 345,
      lastUpdated: '1 day ago'
    },
    {
      id: 5,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and local payment methods in selected regions. All payments are processed securely through our PCI-compliant payment gateway.",
      category: 'payment',
      views: 678,
      lastUpdated: '2 weeks ago'
    },
    {
      id: 6,
      question: "How do I create an organizer account?",
      answer: "Click 'Become an Organizer' in the main menu, fill out the application form with your details and business information. Our team reviews applications within 2 business days. Once approved, you can start creating events.",
      category: 'account',
      views: 234,
      lastUpdated: '5 days ago'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered FAQ Database</h3>
              <p className="text-sm text-gray-600">Search or browse frequently asked questions</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            <span>Updated daily by AI</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs (AI will find relevant answers)..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* AI Search Tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            💡 <span className="font-medium">AI Tip:</span> Try natural language queries like 
            "how to get refund" or "booking problems". The AI understands context.
          </p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="p-6">
        {filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-left">{faq.question}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {faq.category}
                        </span>
                        <span className="text-xs text-gray-500">{faq.views} views</span>
                        <span className="text-xs text-gray-500">Updated {faq.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      expandedFAQ === faq.id ? 'transform rotate-90' : ''
                    }`}
                  />
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-5 pb-5">
                    <div className="pl-14 border-t border-gray-100 pt-5">
                      <p className="text-gray-700 mb-4">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          This answer was verified by AI and customer support
                        </div>
                        <div className="flex gap-2">
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            Was this helpful?
                          </button>
                          <button className="text-xs text-gray-600 hover:text-gray-700 font-medium">
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
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matching FAQs found</h3>
            <p className="text-gray-600 mb-6">
              Try different keywords or ask the AI assistant for help
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{filteredFAQs.length}</span> of {faqs.length} FAQs shown
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              AI-Powered Answers
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Human-Verified
            </span>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Ask New Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQViewer;