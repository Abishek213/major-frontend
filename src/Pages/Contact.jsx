import { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';

// Chat Component
function AskQuestionChat({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can we help you today?' },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      { from: 'user', text: message },
      { from: 'bot', text: 'Thanks for your question. Our team will respond shortly.' },
    ]);

    setMessage('');
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-medium text-sm">Ask a Question</h3>
        <button type="button" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3 text-sm flex-1">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] px-3 py-2 rounded-lg break-words ${
              msg.from === 'user'
                ? 'ml-auto bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t">
        <input
          type="text"
          placeholder="Type your question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          type="button"
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Main Contact Page
export default function Contact() {
  const [activeTab, setActiveTab] = useState('attending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const featuredArticlesAttending = [
    { title: 'Find your tickets', icon: FileText },
    { title: 'Request a refund', icon: FileText },
    { title: 'Contact the event organizer', icon: FileText },
    { title: 'What is this charge from e-VENTA?', icon: FileText },
    { title: 'Transfer tickets to someone else', icon: FileText },
    { title: 'Edit your order information', icon: FileText },
  ];

  const featuredArticlesOrganizing = [
    { title: 'Create your first event', icon: FileText },
    { title: 'Set up ticket types', icon: FileText },
    { title: 'Manage attendees', icon: FileText },
    { title: 'Payout and billing', icon: FileText },
    { title: 'Promote your event', icon: FileText },
    { title: 'Event analytics', icon: FileText },
  ];

  const browseTopics = [
    { title: 'Buy and register', icon: DollarSign },
    { title: 'Your tickets', icon: Ticket },
    { title: 'Your account', icon: UserCircle },
    { title: 'Terms and policies', icon: ClipboardList },
  ];

  const featuredArticles =
    activeTab === 'attending'
      ? featuredArticlesAttending
      : featuredArticlesOrganizing;

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Hero Section */}
      <div className="pb-8 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-[#1e0a3c] mb-8">
          How can we help?
        </h1>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-8 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('attending')}
              className={`pb-4 px-2 text-sm font-medium ${
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
              className={`pb-4 px-2 text-sm font-medium ${
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

      {/* Featured Articles */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-[#1e0a3c] mb-6">Featured articles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredArticles.map((article) => (
            <button
              key={article.title}
              type="button"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-600"
            >
              <article.icon className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-[#1e0a3c]">{article.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Browse by Topic */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-[#1e0a3c] mb-6">Browse by topic</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {browseTopics.map((topic) => (
            <button
              key={topic.title}
              type="button"
              className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-lg hover:border-blue-600"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <topic.icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-center">{topic.title}</span>
            </button>
          ))}
        </div>
      </div>

    

      {/* Floating Ask Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg z-[9999]"
      >
        <MessageSquare className="w-5 h-5" />
        Ask a question
      </button>

      {/* Chat Component */}
      <AskQuestionChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
