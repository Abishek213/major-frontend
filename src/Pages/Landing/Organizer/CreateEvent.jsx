import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { getToken } from '../../../utils/auth';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tags, 
  Users, 
  AlertCircle, 
  Plus,
  X,
  CheckCircle,
  FileText,
  Camera,
  DollarSign,
  Star,
  Lightbulb,
  Target,
  Zap,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogAction
} from '@/components/ui/dialog';
import websocketManager from '@/utils/websocketManager';

// Improved helper function to organize categories with recursive support
const organizeCategories = (categories) => {
  // Helper function to recursively find children
  const findChildren = (parentId) => {
    return categories
      .filter(cat => 
        cat.isActive && 
        cat.parentCategory?._id?.toString() === parentId?.toString()
      )
      .map(child => ({
        ...child,
        subCategories: findChildren(child._id)
      }));
  };

  // Start with root categories (those without parents)
  return categories
    .filter(cat => !cat.parentCategory && cat.isActive)
    .map(main => ({
      ...main,
      subCategories: findChildren(main._id)
    }));
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [organizedCategories, setOrganizedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [pendingEventDetails, setPendingEventDetails] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Improved indentation helper for deeper nesting
  const getIndentationStyle = (level) => {
    return `ml-${Math.min(level * 4, 16)}`; // Cap at ml-16 to prevent excessive indentation
  };
  
  const getPrefix = (level) => {
    if (level === 0) return "";
    const spacing = "  ".repeat(level);
    const symbol = "-".repeat(level) + " ";
    return spacing + symbol;
  };

  // Recursive function to render category options
  const renderCategoryOptions = (category, level = 0) => {
    if (!category.isActive) return null;
    
    return (
      <React.Fragment key={category._id}>
        <option 
          value={category._id}
          className={getIndentationStyle(level)}
        >
          {getPrefix(level)}{category.categoryName}
        </option>
        {category.subCategories?.map(subCat => 
          renderCategoryOptions(subCat, level + 1)
        )}
      </React.Fragment>
    );
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const token = getToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (!decodedToken.user?.email) {
          throw new Error("Token does not contain user email");
        }

        const [userResponse, categoryResponse] = await Promise.all([
          api.get(`/users/email/${decodedToken.user.email}`),
          api.get("/categories"),
        ]);

        setUserData(userResponse.data.user);
        setCategories(categoryResponse.data);
        
        // Use the improved organizeCategories function
        const organized = organizeCategories(categoryResponse.data);
        setOrganizedCategories(organized);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!userData?._id) {
        throw new Error("User data not found. Please try again.");
      }

      const form = event.target;
      const eventDate = new Date(form.event_date.value);
      const registrationDeadline = new Date(form.registrationDeadline.value);
      const currentDate = new Date();
      const categoryId = form.category.value;

      // Comprehensive input validations
      const validations = [
        { condition: !categoryId, message: "Please select a valid category" },
        { condition: registrationDeadline >= eventDate, message: "Registration deadline must be before event date" },
        { condition: eventDate <= currentDate, message: "Event date must be in the future" }
      ];

      const failedValidation = validations.find(val => val.condition);
      if (failedValidation) {
        throw new Error(failedValidation.message);
      }

      // Construct event data object
      const eventData = {
        event_name: form.event_name.value.trim(),
        description: form.description.value.trim(),
        event_date: form.event_date.value,
        registrationDeadline: form.registrationDeadline.value,
        time: form.time.value,
        location: form.location.value.trim(),
        price: Number(form.price.value),
        category: categoryId,
        totalSlots: Number(form.totalSlots.value),
        org_ID: userData._id,
        tags: form.tags.value ? form.tags.value.split(",").map(tag => tag.trim()) : [],
        isPublic: form.isPublic?.checked || false
      };

      const response = await api.safePost("/events/create", eventData);

      if (response.data) {
        const eventId = response.data.event._id;
        
        // Handle image upload if present
        const imageFile = form.eventImage.files[0];
        if (imageFile) {
          await uploadEventImage(eventId, imageFile);
        }

        if (response.data.requiresApproval) {
          await sendAdminNotification(response.data.event);
          setPendingEventDetails(response.data.event);
          setShowApprovalDialog(true);
          setShowCreateForm(false);
        } else {
          setShowCreateForm(false);
          navigate("/orgdb/my-events");
        }
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        "Failed to create event";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadEventImage = async (eventId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("eventId", eventId);

      const response = await api.safePost("/events/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        console.log("Image uploaded successfully!");
      } else {
        console.error("Image upload failed:", response.data.message);
      }
    } catch (err) {
      console.error("Error uploading image:", err.message);
      throw new Error("Failed to upload the event image");
    }
  };

  const sendAdminNotification = async (eventDetails) => {
    try {
      if (!eventDetails?._id || !userData?._id) {
        console.error('Missing required IDs:', { event: eventDetails, user: userData });
        return;
      }

      const notificationData = {
        eventId: eventDetails._id,
        message: `New event "${eventDetails.event_name}" requires approval`,
        userId: userData._id,
        type: 'event_request'
      };

      const response = await api.safePost('/notifications/events', notificationData);
      
      if (response.status === 200 || response.status === 201) {
        if (websocketManager && websocketManager.ws?.readyState === WebSocket.OPEN) {
          try {
            await websocketManager.send('notification', {
              type: 'event_request',
              ...notificationData
            });
          } catch (wsError) {
            console.warn('WebSocket notification failed:', wsError);
          }
        }
      }

      return response;
    } catch (err) {
      console.error('Error in sendAdminNotification:', err);
    }
  };

  const handleDialogClose = () => {
    setShowApprovalDialog(false);
    navigate("/orgdb/my-events");
  };

  const guideSteps = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: "Define Your Event",
      description: "Start with a clear, compelling event name and detailed description that captures your audience's attention."
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-500" />,
      title: "Set Dates & Times",
      description: "Choose your event date and registration deadline. Make sure to allow enough time for promotion and registration."
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-500" />,
      title: "Location & Logistics",
      description: "Specify the venue, capacity, and pricing. Consider accessibility and convenience for your attendees."
    },
    {
      icon: <Tags className="w-8 h-8 text-orange-500" />,
      title: "Categorize & Tag",
      description: "Select appropriate categories and add relevant tags to help people discover your event easily."
    },
    {
      icon: <Camera className="w-8 h-8 text-pink-500" />,
      title: "Visual Appeal",
      description: "Upload an eye-catching event image that represents your event and attracts potential attendees."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      title: "Review & Submit",
      description: "Double-check all details before submitting. Your event may require admin approval before going live."
    }
  ];

  const tips = [
    "Use high-quality images that are relevant to your event theme",
    "Write clear, engaging descriptions that answer who, what, when, where, and why",
    "Set reasonable pricing and capacity based on your venue and target audience",
    "Add relevant tags to improve discoverability",
    "Allow sufficient time between registration deadline and event date"
  ];

  if (loading && (!categories.length || !userData)) {
    return <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                Create New Event
              </h1>
              <p className="text-gray-600">
                Design and launch your perfect event with our intuitive creation tools
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 md:mt-0 px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Event Creation Guide */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">How to Create Great Events</h3>
                        <p className="text-sm text-gray-600 mt-1">Follow these steps for success</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {guideSteps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 flex items-center justify-center shadow-md">
                          {step.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-gray-800">
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips and Best Practices */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Pro Tips for Success</h3>
                        <p className="text-sm text-gray-600 mt-1">Expert advice for your events</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Form Overlay */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white border-gray-200 border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Create New Event
                </h2>
                <p className="text-sm text-gray-600">
                  Fill in the details to create your event
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setError("");
                }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleCreateEvent} className="space-y-6">
                {error && (
                  <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm">
                    <div className="absolute left-5 top-5">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="pr-10">
                      <h4 className="font-bold text-red-800 mb-1">Error Creating Event</h4>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Basic Details Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Event Name
                      </label>
                      <input
                        name="event_name"
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                        placeholder="Enter a compelling event name"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          className="w-full px-4 py-3 rounded-xl border appearance-none bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        >
                          <option value="">Select Category</option>
                          {organizedCategories.map(category => renderCategoryOptions(category))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date and Time Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Event Date</span>
                          </div>
                        </label>
                        <input
                          name="event_date"
                          type="date"
                          className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Time</span>
                          </div>
                        </label>
                        <input
                          name="time"
                          type="time"
                          className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Registration Deadline
                      </label>
                      <input
                        name="registrationDeadline"
                        type="date"
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location and Details Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Location</span>
                      </div>
                    </label>
                    <input
                      name="location"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                      placeholder="Enter venue location"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Tags className="w-4 h-4" />
                        <span>Tags</span>
                      </div>
                    </label>
                    <input
                      name="tags"
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Separate tags with commas"
                    />
                  </div>
                </div>

                {/* Capacity and Price Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Total Slots</span>
                      </div>
                    </label>
                    <input
                      name="totalSlots"
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                      min="1"
                      placeholder="Enter capacity"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Price (Rs)</span>
                      </div>
                    </label>
                    <input
                      name="price"
                      type="number"
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                      min="0"
                      step="0.01"
                      placeholder="Enter price"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>Event Image</span>
                    </div>
                  </label>
                  <input
                    name="eventImage"
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:border-0 file:text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:text-sm file:font-medium hover:file:from-blue-100 hover:file:to-indigo-100 transition-colors"
                  />
                </div>

                {/* Description Section */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Description</span>
                    </div>
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    rows="4"
                    required
                    placeholder="Describe your event in detail..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setError("");
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        <span>Creating Event...</span>
                      </div>
                    ) : (
                      'Create Event'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onClose={handleDialogClose}>
        <DialogContent variant="info">
          <DialogTitle>
            Event Submitted Successfully
          </DialogTitle>
          <DialogDescription>
            Your event "{pendingEventDetails?.event_name || 'New Event'}" has been submitted and is awaiting admin approval. 
            You'll be notified once it's approved. You can view the status of your event in the My Events section.
          </DialogDescription>
          <DialogAction onClick={handleDialogClose}>
            Go to My Events
          </DialogAction>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateEvent;