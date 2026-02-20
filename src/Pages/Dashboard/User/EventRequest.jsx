import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useEventRequest } from '@/hooks/useEventRequest';
import EventRequestAssistant from "@/components/ai/user/EventRequestAssistant";
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
  ChevronRight,
  ChevronLeft,
  Home,
  Globe,
  Video,
  Music,
  Trophy,
  Briefcase,
  GraduationCap,
  PartyPopper,
  Coffee,
  Heart,
  Star,
  Zap,
  Shield,
  Info,
  HelpCircle,
  Check,
  ArrowRight,
  Mic,
  MicOff,
  Loader2,
  Rocket,
  Sparkle
} from 'lucide-react';

const EVENT_TYPES = [
  { value: 'Wedding', label: 'Wedding', icon: Heart, color: 'pink', description: 'Celebrate your special day' },
  { value: 'Sports', label: 'Sports', icon: Trophy, color: 'green', description: 'Athletic events & tournaments' },
  { value: 'Educational', label: 'Educational', icon: GraduationCap, color: 'blue', description: 'Workshops & seminars' },
  { value: 'Political', label: 'Political', icon: Building, color: 'purple', description: 'Campaigns & rallies' },
  { value: 'Conference', label: 'Conference', icon: Users, color: 'indigo', description: 'Professional gatherings' },
  { value: 'Workshop', label: 'Workshop', icon: Briefcase, color: 'orange', description: 'Hands-on learning' },
  { value: 'Concert', label: 'Concert', icon: Music, color: 'red', description: 'Live music performances' },
  { value: 'Festival', label: 'Festival', icon: PartyPopper, color: 'yellow', description: 'Community celebrations' },
  { value: 'Corporate', label: 'Corporate', icon: Building, color: 'gray', description: 'Business events' },
  { value: 'Networking', label: 'Networking', icon: Users, color: 'teal', description: 'Connect with professionals' },
];

const VENUE_TYPES = [
  { value: 'physical', label: 'Physical Venue', icon: Building },
  { value: 'virtual', label: 'Virtual Event', icon: Video },
  { value: 'hybrid', label: 'Hybrid Event', icon: Globe },
];

const BUDGET_RANGES = [
  { min: 0, max: 1000, label: 'Budget Friendly (< $1k)' },
  { min: 1000, max: 5000, label: 'Standard ($1k - $5k)' },
  { min: 5000, max: 10000, label: 'Premium ($5k - $10k)' },
  { min: 10000, max: 50000, label: 'Luxury ($10k - $50k)' },
  { min: 50000, max: null, label: 'Enterprise ($50k+)' },
];

const INITIAL_FORM_STATE = {
  eventType: '',
  venue: '',
  venueType: 'physical',
  date: '',
  time: '',
  budget: '',
  attendees: '',
  description: '',
  requirements: '',
  accessibility: false,
  catering: false,
  parking: false,
  accommodation: false,
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
  const [currentStep, setCurrentStep] = useState(0);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestedVenues, setSuggestedVenues] = useState([]);
  const [formProgress, setFormProgress] = useState(0);
  
  const { 
    processRequest, 
    loading: aiLoading, 
    entities, 
    organizerMatches,
    requests 
  } = useEventRequest();

  // Calculate form progress
  useEffect(() => {
    const requiredFields = ['eventType', 'venue', 'date', 'budget', 'description'];
    const filledFields = requiredFields.filter(field => formData[field]).length;
    setFormProgress((filledFields / requiredFields.length) * 100);
  }, [formData]);

  // Mock venue suggestions based on location
  useEffect(() => {
    if (formData.venue && formData.venue.length > 3) {
      // Simulate API call to get venue suggestions
      setSuggestedVenues([
        { name: `${formData.venue} Convention Center`, capacity: 500, price: 2500, rating: 4.5 },
        { name: `${formData.venue} Grand Hall`, capacity: 300, price: 1800, rating: 4.3 },
        { name: `${formData.venue} Community Center`, capacity: 200, price: 1200, rating: 4.0 },
      ]);
    } else {
      setSuggestedVenues([]);
    }
  }, [formData.venue]);

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0 && !formData.eventType) {
      newErrors.eventType = 'Please select an event type';
    }
    if (step === 1) {
      if (!formData.venue) newErrors.venue = 'Venue is required';
      if (!formData.date) newErrors.date = 'Date is required';
      if (!formData.time) newErrors.time = 'Time is required';
    }
    if (step === 2) {
      if (!formData.budget) newErrors.budget = 'Budget is required';
      else if (isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
        newErrors.budget = 'Please enter a valid budget';
      }
      if (!formData.attendees) newErrors.attendees = 'Number of attendees is required';
      else if (isNaN(formData.attendees) || parseInt(formData.attendees) <= 0) {
        newErrors.attendees = 'Please enter a valid number';
      }
    }
    if (step === 3 && !formData.description) {
      newErrors.description = 'Description is required';
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
      attendees: extractedEntities.attendees || prev.attendees,
      description: `Event request for ${extractedEntities.attendees || 'several'} people. ${prev.description}`,
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (!validateStep(currentStep)) {
      setMessage({ type: 'error', content: 'Please complete all required fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.safePost('/eventrequest', {
        ...formData,
        budget: parseFloat(formData.budget),
        attendees: parseInt(formData.attendees),
        userId: user?.id,
        aiEnhanced: aiMode,
        extractedEntities: entities || null,
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          content: '✨ Event request submitted successfully! AI is now matching with organizers...',
        });
        setFormData(INITIAL_FORM_STATE);
        setAiSuggestions(null);
        setCurrentStep(0);
        setTimeout(() => setIsFormOpen(false), 3000);
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

  // Voice input simulation
  const toggleVoiceMode = () => {
    if (!voiceMode) {
      setVoiceMode(true);
      setIsListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        setIsListening(false);
        setFormData(prev => ({
          ...prev,
          description: prev.description + " Looking for a venue with good acoustics and parking facilities.",
        }));
      }, 3000);
    } else {
      setVoiceMode(false);
      setIsListening(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {['Basics', 'Location & Time', 'Budget & Size', 'Details'].map((step, index) => (
          <div
            key={step}
            className={`flex items-center ${index < 3 ? 'flex-1' : ''}`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : index === currentStep
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 ${
                index === currentStep ? 'text-indigo-600 font-medium' : 'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
            {index < 3 && (
              <div className="flex-1 h-1 mx-4">
                <div className="h-full bg-gray-200 rounded">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded transition-all duration-300"
                    style={{ width: index < currentStep ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Form Completion</span>
          <span className="font-medium text-indigo-600">{Math.round(formProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
            style={{ width: `${formProgress}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkle className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What type of event?</h3>
              <p className="text-gray-600">Choose the category that best describes your event</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EVENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.eventType === type.value;
                const colorClasses = {
                  pink: 'from-pink-500 to-rose-500',
                  green: 'from-green-500 to-emerald-500',
                  blue: 'from-blue-500 to-cyan-500',
                  purple: 'from-purple-500 to-violet-500',
                  indigo: 'from-indigo-500 to-purple-500',
                  orange: 'from-orange-500 to-amber-500',
                  red: 'from-red-500 to-pink-500',
                  yellow: 'from-yellow-500 to-amber-500',
                  gray: 'from-gray-500 to-slate-500',
                  teal: 'from-teal-500 to-cyan-500',
                };

                return (
                  <button
                    key={type.value}
                    onClick={() => handleChange('eventType')(type.value)}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${colorClasses[type.color]} text-white shadow-xl scale-105`
                        : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        isSelected 
                          ? 'bg-white/20' 
                          : `bg-${type.color}-100 group-hover:bg-${type.color}-200 transition-colors`
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          isSelected ? 'text-white' : `text-${type.color}-600`
                        }`} />
                      </div>
                      <div>
                        <div className={`font-semibold ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {type.label}
                        </div>
                        <p className={`text-xs mt-1 ${
                          isSelected ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {type.description}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {errors.eventType && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600">{errors.eventType}</p>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Where & When?</h3>
              <p className="text-gray-600">Tell us about your venue and schedule</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Venue Type Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Venue Type</label>
                <div className="flex gap-4">
                  {VENUE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.venueType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleChange('venueType')(type.value)}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50'
                            : 'border-gray-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`font-medium ${
                            isSelected ? 'text-indigo-700' : 'text-gray-700'
                          }`}>
                            {type.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Venue Input with Suggestions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g., Grand Convention Center or Online"
                    value={formData.venue}
                    onChange={handleChange('venue')}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.venue ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>

                {/* Venue Suggestions */}
                {suggestedVenues.length > 0 && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <p className="text-xs font-medium text-indigo-600 mb-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Suggested venues nearby:
                    </p>
                    <div className="space-y-2">
                      {suggestedVenues.map((venue, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChange('venue')(venue.name)}
                          className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{venue.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600">${venue.price}</span>
                            <span className="text-yellow-500">★ {venue.rating}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.venue && <p className="mt-1 text-sm text-red-600">{errors.venue}</p>}
              </div>

              {/* Date and Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={handleChange('date')}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.date ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    value={formData.time}
                    onChange={handleChange('time')}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.time ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Budget & Scale</h3>
              <p className="text-gray-600">Define your budget and expected attendance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget Quick Select */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Quick Budget Select</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handleChange('budget')(range.max ? (range.min + range.max) / 2 : range.min + 25000)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.budget >= range.min && (range.max ? formData.budget <= range.max : formData.budget >= range.min)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-200'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{range.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={formData.budget}
                    onChange={handleChange('budget')}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.budget ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
              </div>

              {/* Attendees Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendees</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Number of people"
                    value={formData.attendees}
                    onChange={handleChange('attendees')}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.attendees ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.attendees && <p className="mt-1 text-sm text-red-600">{errors.attendees}</p>}
              </div>

              {/* Budget Breakdown Preview */}
              {formData.budget && formData.attendees && (
                <div className="md:col-span-2 mt-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Budget Breakdown Preview
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Venue (40%)</p>
                      <p className="font-medium text-gray-900">${(formData.budget * 0.4).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Catering (25%)</p>
                      <p className="font-medium text-gray-900">${(formData.budget * 0.25).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Marketing (15%)</p>
                      <p className="font-medium text-gray-900">${(formData.budget * 0.15).toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Staff (20%)</p>
                      <p className="font-medium text-gray-900">${(formData.budget * 0.2).toFixed(0)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Cost per attendee: ${(formData.budget / formData.attendees).toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Final Details</h3>
              <p className="text-gray-600">Add description and requirements</p>
            </div>

            {/* Voice Input */}
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={toggleVoiceMode}
                className={`p-3 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : voiceMode 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              {isListening && (
                <span className="text-sm text-indigo-600 animate-pulse">
                  Listening... Speak now
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Description</label>
              <textarea
                placeholder="Describe your event in detail..."
                value={formData.description}
                onChange={handleChange('description')}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Include theme, activities, and special requirements
              </p>
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements (Optional)</label>
              <textarea
                placeholder="e.g., AV equipment, dietary restrictions, accessibility needs..."
                value={formData.requirements}
                onChange={handleChange('requirements')}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Additional Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Additional Services</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, accessibility: !prev.accessibility }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.accessibility
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Users className={`w-5 h-5 ${formData.accessibility ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <span className="text-xs">Accessibility</span>
                  </div>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, catering: !prev.catering }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.catering
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Coffee className={`w-5 h-5 ${formData.catering ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <span className="text-xs">Catering</span>
                  </div>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, parking: !prev.parking }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.parking
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <MapPin className={`w-5 h-5 ${formData.parking ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <span className="text-xs">Parking</span>
                  </div>
                </button>

                <button
                  onClick={() => setFormData(prev => ({ ...prev, accommodation: !prev.accommodation }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.accommodation
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Home className={`w-5 h-5 ${formData.accommodation ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <span className="text-xs">Accommodation</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-indigo-600" />
                Request Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Event Type</p>
                  <p className="font-medium text-gray-900">{formData.eventType || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Venue</p>
                  <p className="font-medium text-gray-900">{formData.venue || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {formData.date || 'No date'} {formData.time ? `at ${formData.time}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Budget</p>
                  <p className="font-medium text-gray-900">
                    {formData.budget ? `$${formData.budget}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Attendees</p>
                  <p className="font-medium text-gray-900">{formData.attendees || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Additional Services</p>
                  <p className="font-medium text-gray-900">
                    {[
                      formData.accessibility && 'Accessibility',
                      formData.catering && 'Catering',
                      formData.parking && 'Parking',
                      formData.accommodation && 'Accommodation',
                    ].filter(Boolean).join(', ') || 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Wand2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Event Request</h1>
                  <p className="text-gray-600">Create your perfect event with AI assistance</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setAiMode(true)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
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
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
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
                onClick={() => {
                  setIsFormOpen(true);
                  setCurrentStep(0);
                }}
                className="group px-6 py-3 rounded-xl font-medium flex items-center gap-2
                  bg-gradient-to-r from-indigo-600 to-purple-600
                  hover:from-indigo-700 hover:to-purple-700
                  text-white shadow-lg hover:shadow-xl
                  transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                {aiMode ? 'New Request' : 'New Request'}
              </button>
            </div>
          </div>

          {/* AI Assistant Section */}
          {aiMode && !isFormOpen && (
            <div className="mb-10">
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <EventRequestAssistant 
                  onSuccess={(entities) => {
                    handleAISuggestions(entities);
                    setIsFormOpen(true);
                    setCurrentStep(1);
                  }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { title: 'Active Organizers', value: '156+', icon: Users, color: 'blue' },
              { title: 'AI Success Rate', value: '94%', icon: CheckCircle, color: 'green' },
              { title: 'Avg. Response', value: '< 2h', icon: Clock, color: 'purple' },
              { title: 'Smart Matches', value: organizerMatches?.length || '28', icon: Sparkles, color: 'pink' },
            ].map(({ title, value, icon: Icon, color }) => {
              const colorClasses = {
                blue: 'from-blue-500 to-cyan-500',
                green: 'from-green-500 to-emerald-500',
                purple: 'from-purple-500 to-indigo-500',
                pink: 'from-pink-500 to-rose-500',
              };
              
              return (
                <div
                  key={title}
                  className="group relative bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                       style={{ backgroundImage: `linear-gradient(to bottom right, ${colorClasses[color]})` }} />
                  <Icon className={`w-8 h-8 text-${color}-500 mb-3`} />
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
                  <p className="text-gray-600 text-sm">{title}</p>
                </div>
              );
            })}
          </div>

          {/* Recent Requests */}
          {requests.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Recent AI Requests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {requests.slice(0, 3).map((req) => (
                  <div key={req.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Sparkle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          "{req.text.substring(0, 60)}..."
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(req.timestamp).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {req.entities.attendees || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors group-hover:translate-x-1 transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Enhanced Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="relative p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="pr-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {aiMode && <Sparkles className="w-5 h-5" />}
                  {aiMode ? 'Create Event Request' : 'Create Event Request'}
                </h2>
                {aiSuggestions && (
                  <p className="text-sm text-white/80 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Details from your description
                  </p>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsFormOpen(false);
                  setAiSuggestions(null);
                  setCurrentStep(0);
                }} 
                className="absolute top-6 right-6 p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Suggestions Banner */}
            {aiSuggestions && (
              <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-900">AI Detected Information:</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(aiSuggestions).map(([key, value]) => (
                    value && value !== 'Not specified' && (
                      <div key={key} className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 text-sm border border-purple-100">
                        <span className="text-xs text-gray-500 capitalize block mb-1">{key}</span>
                        <span className="font-medium text-gray-900 flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          {String(value)}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {/* Step Indicator */}
              {renderStepIndicator()}

              {/* Step Content */}
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-2
                    bg-gray-100 text-gray-700 hover:bg-gray-200
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl font-medium flex items-center gap-2
                      bg-gradient-to-r from-indigo-600 to-purple-600
                      hover:from-indigo-700 hover:to-purple-700
                      text-white shadow-lg hover:shadow-xl
                      transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || aiLoading}
                    className="px-8 py-3 rounded-xl font-medium flex items-center gap-2
                      bg-gradient-to-r from-green-600 to-emerald-600
                      hover:from-green-700 hover:to-emerald-700
                      text-white shadow-lg hover:shadow-xl
                      transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Message */}
              {message.content && (
                <div
                  className={`mt-6 p-4 rounded-xl flex items-start gap-3 animate-slideIn ${
                    message.type === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  {message.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${
                    message.type === 'error' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {message.content}
                  </p>
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