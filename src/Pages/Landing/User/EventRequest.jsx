import { useState } from 'react';
import api from '../../../utils/api';
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
} from 'lucide-react';

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
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          content: response.data.message || 'Request submitted successfully!',
        });
        setFormData(INITIAL_FORM_STATE);
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
                  <Plus className="w-6 h-6 text-white" />
                </div>
                Event Request Dashboard
              </h1>
              <p className="text-gray-600">
                Create unforgettable experiences with professional event management services
              </p>
            </div>

            {/* Request Button (INSIDE CONTAINER) */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="group px-6 py-4 rounded-xl font-medium flex items-center gap-2
                bg-gradient-to-r from-indigo-500 to-purple-500
                hover:from-indigo-600 hover:to-purple-600
                text-white shadow-lg hover:shadow-xl
                transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Request Event
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { title: 'Active Organizers', value: '100+', icon: Users },
              { title: 'Success Rate', value: '95%', icon: CheckCircle },
              { title: 'Response Time', value: '24h', icon: Clock },
              { title: 'Simple Process', value: '4 Steps', icon: FileText },
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
        </div>
      </div>

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-6">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Event Request</h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <select
                value={formData.eventType}
                onChange={handleChange('eventType')}
                className="w-full border rounded-lg p-3"
              >
                <option value="">Select Event Type</option>
                {EVENT_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Venue"
                value={formData.venue}
                onChange={handleChange('venue')}
                className="w-full border rounded-lg p-3"
              />

              <input
                type="date"
                value={formData.date}
                onChange={handleChange('date')}
                className="w-full border rounded-lg p-3"
              />

              <input
                type="number"
                placeholder="Budget"
                value={formData.budget}
                onChange={handleChange('budget')}
                className="w-full border rounded-lg p-3"
              />

              <textarea
                placeholder="Event description"
                value={formData.description}
                onChange={handleChange('description')}
                className="w-full border rounded-lg p-3"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>

              {message.content && (
                <p
                  className={`text-sm mt-2 ${message.type === 'error'
                    ? 'text-red-600'
                    : 'text-green-600'
                    }`}
                >
                  {message.content}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRequestForm;
