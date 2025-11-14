import { useState } from 'react';
import api from '../../../utils/api';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plus, X, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Political', label: 'Political' },
];

const INITIAL_FORM_STATE = {
  eventType: '',
  venue: '',
  date: '',
  budget: '',
  description: '',
};

const EventRequestForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [errors, setErrors] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setMessage({ type: '', content: '' });
  
    if (!validateForm()) {
      setMessage({ type: 'error', content: 'Please fix form errors' });
      return;
    }
  
    const requestData = {
      eventType: formData.eventType,
      venue: formData.venue,
      date: formData.date,
      budget: parseFloat(formData.budget),
      description: formData.description
    };
  
    setLoading(true);
    
    try {
      const response = await api.safePost(
        '/eventrequest',
        requestData
      );

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          content: response.data.message || 'Request submitted successfully!' 
        });
        setFormData(INITIAL_FORM_STATE);
        setTimeout(() => setIsFormOpen(false), 2000);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        content: err.response?.data?.message || 'Failed to submit request'
      });
    } finally {
      setLoading(false);
    }
  };

  const openForm = () => {
    setIsFormOpen(true);
    setMessage({ type: '', content: '' });
    setErrors({});
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(INITIAL_FORM_STATE);
    setMessage({ type: '', content: '' });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      {/* Request Event Button */}
      <div className="fixed top-20 right-6 z-50">
        <Button
          onClick={openForm}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-3 rounded-full font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Request Event
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            eventA
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create unforgettable experiences with our professional event management services.
          </p>
        </div>

        {/* Event Request Guide */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
              How to Request Your Event
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              {[
                { num: '1', title: 'Click Request', desc: 'Click the "Request Event" button', color: 'blue' },
                { num: '2', title: 'Fill Details', desc: 'Provide event information', color: 'purple' },
                { num: '3', title: 'Submit Request', desc: 'Review and submit', color: 'green' },
                { num: '4', title: 'Get Response', desc: 'Organizer will response and you see interested organnizers', color: 'orange' }
              ].map(({ num, title, desc, color }) => (
                <div key={num} className="text-center group">
                  <div className={`bg-gradient-to-br from-${color}-500 to-${color}-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <span className="text-white font-bold">{num}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm">{title}</h3>
                  <p className="text-xs text-gray-600">{desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Tips for Better Requests</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Be specific about your event vision</li>
                <li>• Include special accommodations needed</li>
                <li>• Provide realistic budget range</li>
                <li>• Mention preferred dates or flexibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-40 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-in slide-in-from-bottom-4 duration-500"
          >
            {/* Simplified Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center mb-1">Create Event Request</h2>
                <p className="text-center text-white/90 text-sm">Tell us about your event</p>
                <Button
                  onClick={closeForm}
                  variant="ghost"
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Compact Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Event Type */}
                  <div>
                    <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      Event Type
                    </label>
                    <Select value={formData.eventType} onValueChange={handleChange('eventType')}>
                      <SelectTrigger className={`h-12 rounded-xl border-2 bg-white transition-all duration-300 ${errors.eventType ? 'border-red-300' : 'border-gray-200 focus:border-blue-400'} text-base`}>
                        <SelectValue placeholder="Choose event type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {EVENT_TYPES.map(({ value, label }) => (
                          <SelectItem key={value} value={value} className="rounded-lg py-2">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.eventType && (
                      <p className="text-sm text-red-500 mt-1">{errors.eventType}</p>
                    )}
                  </div>

                  {/* Venue & Date Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                        Venue
                      </label>
                      <Input
                        type="text"
                        value={formData.venue}
                        onChange={handleChange('venue')}
                        placeholder="Enter venue"
                        className={`h-12 rounded-xl border-2 bg-white transition-all duration-300 ${errors.venue ? 'border-red-300' : 'border-gray-200 focus:border-green-400'} text-base`}
                      />
                      {errors.venue && (
                        <p className="text-xs text-red-500 mt-1">{errors.venue}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-white" />
                        </div>
                        Date
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={handleChange('date')}
                        className={`h-12 rounded-xl border-2 bg-white transition-all duration-300 ${errors.date ? 'border-red-300' : 'border-gray-200 focus:border-orange-400'} text-base`}
                      />
                      {errors.date && (
                        <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-3 h-3 text-white" />
                      </div>
                      Budget
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.budget}
                        onChange={handleChange('budget')}
                        placeholder="Enter budget"
                        min="0"
                        step="0.01"
                        className={`h-12 rounded-xl border-2 bg-white transition-all duration-300 ${errors.budget ? 'border-red-300' : 'border-gray-200 focus:border-yellow-400'} text-base pl-10`}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">$</div>
                    </div>
                    {errors.budget && (
                      <p className="text-sm text-red-500 mt-1">{errors.budget}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                      Event Details
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={handleChange('description')}
                      placeholder="Describe your event..."
                      className={`rounded-xl border-2 resize-none bg-white transition-all duration-300 ${errors.description ? 'border-red-300' : 'border-gray-200 focus:border-purple-400'} text-base`}
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </Button>
                </div>
              </form>

              {message.content && (
                <div className="mt-4">
                  <Alert className={`rounded-xl border-2 ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                    <AlertDescription className="font-medium text-sm">
                      {message.content}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRequestForm;

