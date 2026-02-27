import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useEventRequest } from '@/hooks/useEventRequest';
import EventRequestAssistant from '@/components/ai/user/EventRequestAssistant';
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
  const [aiMode, setAiMode] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showAIResults, setShowAIResults] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  
  // AI Event Request Hook - UPDATED with new states
  const { 
    processRequest, 
    loading: aiLoading, 
    entities, 
    organizerMatches,
    budgetAnalysis,
    aiSuggestions: aiTips,
    error: aiError,
    requests,
    clearResults
  } = useEventRequest();

  // Show AI results when they come in
  useEffect(() => {
    if (organizerMatches?.length > 0 || budgetAnalysis) {
      setShowAIResults(true);
      setAiResponse({
        entities,
        organizers: organizerMatches,
        budgetAnalysis,
        suggestions: aiTips
      });
    }
  }, [organizerMatches, budgetAnalysis, entities, aiTips]);

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

  // Handle AI processing
  const handleAIProcess = async (text) => {
    setShowAIResults(false);
    clearResults();
    
    const result = await processRequest(text);
    
    if (!result?.success) {
      setMessage({
        type: 'error',
        content: result?.error || 'Failed to process request'
      });
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
      budget: extractedEntities.rawBudget?.toString() || prev.budget,
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
        useAI: aiMode, // Changed from aiEnhanced to match backend
        naturalLanguage: aiMode ? formData.description : undefined,
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          content: response.data.message || 'Request submitted successfully!',
        });
        setFormData(INITIAL_FORM_STATE);
        setAiSuggestions(null);
        setShowAIResults(false);
        clearResults();
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
    <div className="p-4 space-y-8 md:p-6">
      {/* Main Container */}
      <div className="overflow-hidden border border-gray-100 shadow-xl bg-gradient-to-br from-white to-gray-50 rounded-2xl">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-3 mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
                <div className="flex items-center justify-center w-12 h-12 shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                AI Event Request Assistant
              </h1>
              <p className="flex items-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Describe your event in natural language - AI will handle the rest
              </p>
            </div>

            {/* Mode Toggle & Request Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center p-1 bg-gray-100 rounded-xl">
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
                className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-300 shadow-lg group rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                {aiMode ? 'AI Request' : 'New Request'}
              </button>
            </div>
          </div>

          {/* AI Mode - Natural Language Input */}
          {aiMode && !isFormOpen && (
            <div className="mb-10">
              <EventRequestAssistant 
                onSuccess={handleAIProcess}
                loading={aiLoading}
              />
            </div>
          )}

          {/* AI Results Display */}
          {showAIResults && aiResponse && (
            <div className="p-6 mb-10 border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Analysis Results
              </h3>
              
              {/* Extracted Entities */}
              {aiResponse.entities && (
                <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Event Type</p>
                    <p className="font-medium text-gray-800">{aiResponse.entities.eventType}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium text-gray-800">{aiResponse.entities.location}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-medium text-gray-800">{aiResponse.entities.budget}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Attendees</p>
                    <p className="font-medium text-gray-800">{aiResponse.entities.attendees}</p>
                  </div>
                </div>
              )}

              {/* Budget Analysis */}
              {aiResponse.budgetAnalysis && (
                <div className="p-4 mb-6 bg-white rounded-lg">
                  <h4 className="mb-3 font-medium text-gray-800">💰 Budget Analysis</h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Estimated Range</p>
                      <p className="font-medium text-gray-800">
                        NPR {aiResponse.budgetAnalysis.estimatedCost?.low?.toLocaleString()} - 
                        NPR {aiResponse.budgetAnalysis.estimatedCost?.high?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Feasibility</p>
                      <p className="font-medium text-gray-800 capitalize">{aiResponse.budgetAnalysis.feasibility}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Recommended</p>
                      <p className="font-medium text-gray-800">NPR {aiResponse.budgetAnalysis.recommendedBudget?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Organizer Matches */}
              {aiResponse.organizers?.length > 0 && (
                <div>
                  <h4 className="mb-3 font-medium text-gray-800">🎪 Top Organizer Matches</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {aiResponse.organizers.slice(0, 3).map((org, idx) => (
                      <div key={org.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-gray-800">{org.name}</h5>
                          <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full">
                            {org.matchScore}% match
                          </span>
                        </div>
                        <p className="mb-2 text-sm text-gray-600">⭐ {org.rating} • {org.completedEvents} events</p>
                        <p className="text-xs text-gray-500">{org.specialization}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="px-6 py-2 text-white transition rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  Create Request with AI
                </button>
                <button
                  onClick={() => setShowAIResults(false)}
                  className="px-6 py-2 text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Stats - Updated to use real data */}
          <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-4">
            {[
              { title: 'Active Organizers', value: '100+', icon: Users },
              { title: 'AI Success Rate', value: '95%', icon: CheckCircle },
              { title: 'AI Response', value: '< 10s', icon: Clock },
              { title: 'Smart Matches', value: organizerMatches?.length || requests?.length || '0', icon: Sparkles },
            ].map(({ title, value, icon: Icon }) => (
              <div
                key={title}
                className="p-6 transition bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg"
              >
                <Icon className="w-8 h-8 mb-3 text-indigo-500" />
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                <p className="text-gray-600">{title}</p>
              </div>
            ))}
          </div>

          {/* Recent AI Requests */}
          {requests.length > 0 && (
            <div className="mt-8">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Recent AI Requests
              </h3>
              <div className="space-y-3">
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} className="p-4 transition bg-white border rounded-lg hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">"{req.text.substring(0, 60)}..."</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {req.entities?.eventType || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {req.entities?.location || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {req.entities?.attendees || 'N/A'}
                          </span>
                        </div>
                        {req.organizers && (
                          <p className="mt-1 text-xs text-purple-600">
                            {req.organizers.length} organizer matches found
                          </p>
                        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-6 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  {aiMode && <Sparkles className="w-5 h-5 text-purple-500" />}
                  {aiMode ? 'AI-Assisted Request' : 'Create Event Request'}
                </h2>
                {aiSuggestions && (
                  <p className="mt-1 text-sm text-gray-600">
                    AI extracted details from your description
                  </p>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsFormOpen(false);
                  setAiSuggestions(null);
                }} 
                className="p-2 transition rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Suggestions Banner */}
            {aiSuggestions && (
              <div className="p-4 mx-6 mt-6 border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">AI Detected:</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(aiSuggestions).map(([key, value]) => (
                    value && value !== 'Not specified' && (
                      <div key={key} className="px-3 py-2 text-sm bg-white rounded-lg">
                        <span className="block text-xs text-gray-500 capitalize">{key}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Event Type</label>
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
                <label className="block mb-1 text-sm font-medium text-gray-700">Venue/Location</label>
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
                <label className="block mb-1 text-sm font-medium text-gray-700">Event Date</label>
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
                <label className="block mb-1 text-sm font-medium text-gray-700">Budget (NPR)</label>
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
                <label className="block mb-1 text-sm font-medium text-gray-700">Event Description</label>
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
                  <p className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Sparkles className="w-3 h-3" />
                    Tip: Be specific about attendees, theme, and requirements
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || aiLoading}
                className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition-all rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || aiLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    {aiLoading ? 'AI Processing...' : 'Submitting...'}
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
                    <AlertTriangle className="flex-shrink-0 w-5 h-5" />
                  ) : (
                    <CheckCircle className="flex-shrink-0 w-5 h-5" />
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
              )}

              {aiError && (
                <div className="flex items-start gap-3 p-4 mt-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
                  <AlertTriangle className="flex-shrink-0 w-5 h-5" />
                  <p className="text-sm">{aiError}</p>
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