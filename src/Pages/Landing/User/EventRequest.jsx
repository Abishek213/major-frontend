import { useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useEventRequest } from '@/hooks/useEventRequest';
import EventRequestAssistant from '@/components/ai/EventRequestAssistant';
import {
  AlertTriangle,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Plus,
  X,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Clock,
  Wand2,
  Bot,
  Send,
  Building,
} from 'lucide-react';

const EVENT_TYPES = [
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Political', label: 'Political' },
  { value: 'Conference', label: 'Conference' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Concert', label: 'Concert' },
  { value: 'Festival', label: 'Festival' },
];

const INITIAL_FORM_STATE = {
  eventType: '',
  venue: '',
  date: '',
  budget: '',
  description: '',
};

const EventRequestForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [errors, setErrors] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [aiMode, setAiMode] = useState(true); // Toggle between AI and Manual mode
  const [aiSuggestions, setAiSuggestions] = useState(null);
  
  // AI Event Request Hook
  const { 
    processRequest, 
    loading: aiLoading, 
    entities, 
    organizerMatches,
    requests 
  } = useEventRequest();

  const validateForm = () => {
    const newErrors = {};
    const { eventType, venue, date, budget, description } = formData;

    if (!eventType) newErrors.eventType = 'Event type is required';
    if (!venue) newErrors.venue = 'Venue is required';
    if (!date) newErrors.date = 'Date is required';
    if (!budget) newErrors.budget = 'Budget is required';
    else if (isNaN(budget) || parseFloat(budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget amount';
    }
    if (!description) newErrors.description = 'Description is required';
    else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target?.value ?? e;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // AI-powered form auto-fill
  const handleAISuggestions = (extractedEntities) => {
    setAiSuggestions(extractedEntities);
    
    // Auto-fill form with AI extracted data
    setFormData(prev => ({
      ...prev,
      eventType: extractedEntities.eventType || prev.eventType,
      venue: extractedEntities.location || prev.venue,
      date: extractedEntities.date || prev.date,
      budget: extractedEntities.budget === 'Free' ? '0' : 
              extractedEntities.budget === 'Paid' ? '1000' : prev.budget,
      description: `Event request: ${extractedEntities.eventType} for ${extractedEntities.attendees} people. ${prev.description}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (!validateForm()) {
      setMessage({ type: 'error', content: 'Please fix form errors' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.safePost('/eventrequest', {
        ...formData,
        budget: parseFloat(formData.budget),
        userId: user?.id,
        aiEnhanced: aiMode,
        extractedEntities: entities || null,
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          content: response.data.message || 'Request submitted successfully!',
        });
        setFormData(INITIAL_FORM_STATE);
        setAiSuggestions(null);
        setTimeout(() => setIsFormOpen(false), 2000);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        content: err.response?.data?.message || 'Failed to submit request',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Main Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                AI Event Request Assistant
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Describe your event in natural language - AI will handle the rest
              </p>
            </div>

            {/* Mode Toggle & Request Button */}
            <div className="flex items-center gap-3">
              {/* AI/Manual Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setAiMode(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    aiMode 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  AI Mode
                </button>
                <button
                  onClick={() => setAiMode(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    !aiMode 
                      ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Manual
                </button>
              </div>

              <button
                onClick={() => setIsFormOpen(true)}
                className="group px-6 py-3 rounded-xl font-medium flex items-center gap-2
                  bg-gradient-to-r from-indigo-500 to-purple-500
                  hover:from-indigo-600 hover:to-purple-600
                  text-white shadow-lg hover:shadow-xl
                  transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                {aiMode ? 'AI Request' : 'New Request'}
              </button>
            </div>
          </div>

          {/* AI Mode - Natural Language Input */}
          {aiMode && !isFormOpen && (
            <div className="mb-10">
              <EventRequestAssistant 
                onSuccess={(entities) => {
                  handleAISuggestions(entities);
                  setIsFormOpen(true);
                }}
              />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { title: 'Active Organizers', value: '100+', icon: Users },
              { title: 'AI Success Rate', value: '95%', icon: CheckCircle },
              { title: 'AI Response', value: '< 10s', icon: Clock },
              { title: 'Smart Matches', value: organizerMatches?.length || '0', icon: Sparkles },
            ].map(({ title, value, icon: Icon }) => (
              <div
                key={title}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition"
              >
                <Icon className="w-8 h-8 text-indigo-500 mb-3" />
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                <p className="text-gray-600">{title}</p>
              </div>
            ))}
          </div>

          {/* Recent AI Requests */}
          {requests.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Recent AI Requests
              </h3>
              <div className="space-y-3">
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">"{req.text.substring(0, 60)}..."</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {req.entities.eventType}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {req.entities.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {req.entities.attendees}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(req.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Enhanced with AI suggestions */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-6 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {aiMode && <Sparkles className="w-5 h-5 text-purple-500" />}
                  {aiMode ? 'AI-Assisted Request' : 'Create Event Request'}
                </h2>
                {aiSuggestions && (
                  <p className="text-sm text-gray-600 mt-1">
                    AI extracted details from your description
                  </p>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsFormOpen(false);
                  setAiSuggestions(null);
                }} 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Suggestions Banner */}
            {aiSuggestions && (
              <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">AI Detected:</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(aiSuggestions).map(([key, value]) => (
                    value && value !== 'Not specified' && (
                      <div key={key} className="bg-white rounded-lg px-3 py-2 text-sm">
                        <span className="text-xs text-gray-500 capitalize block">{key}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={handleChange('eventType')}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.eventType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Event Type</option>
                  {EVENT_TYPES.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                {errors.eventType && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue/Location</label>
                <input
                  type="text"
                  placeholder="Enter venue or 'Online'"
                  value={formData.venue}
                  onChange={handleChange('venue')}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.venue ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.venue && (
                  <p className="mt-1 text-sm text-red-600">{errors.venue}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={handleChange('date')}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  placeholder="Enter your budget"
                  value={formData.budget}
                  onChange={handleChange('budget')}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
                <textarea
                  placeholder="Describe your event requirements..."
                  value={formData.description}
                  onChange={handleChange('description')}
                  rows={4}
                  className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                {aiMode && (
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Tip: Be specific about attendees, theme, and requirements
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || aiLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 
                  text-white font-medium hover:from-indigo-700 hover:to-purple-700 
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {aiMode ? 'Submit AI-Enhanced Request' : 'Submit Request'}
                  </>
                )}
              </button>

              {message.content && (
                <div
                  className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                    message.type === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {message.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRequestForm;