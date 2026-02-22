import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { getToken } from "../../../utils/auth";
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
  Sparkles,
  Activity,
  Bot,
  Wand2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogAction,
} from "@/components/ui/dialog";
import EventPlanningAssistant from "../../../components/ai/organizer/EventPlanningAssistant";
import PriceSuggestion from "../../../components/ai/organizer/PriceSuggestion";
import TagRecommender from "../../../components/ai/organizer/TagRecommender";
import { useOrganizerAI } from "../../../hooks/useOrganizerAI";
import AIBadge from "../../../components/ai/user/AIBadge";

const organizeCategories = (categories) => {
  const findChildren = (parentId) =>
    categories
      .filter(
        (c) =>
          c.isActive &&
          c.parentCategory?._id?.toString() === parentId?.toString()
      )
      .map((child) => ({ ...child, subCategories: findChildren(child._id) }));

  return categories
    .filter((c) => !c.parentCategory && c.isActive)
    .map((main) => ({ ...main, subCategories: findChildren(main._id) }));
};

const renderCategoryOptions = (category, level = 0) => {
  if (!category.isActive) return null;
  const prefix = level > 0 ? "  ".repeat(level) + "– " : "";
  return (
    <React.Fragment key={category._id}>
      <option value={category._id}>
        {prefix}
        {category.categoryName}
      </option>
      {category.subCategories?.map((sub) =>
        renderCategoryOptions(sub, level + 1)
      )}
    </React.Fragment>
  );
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [organizedCategories, setOrganizedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [pendingEventDetails, setPendingEventDetails] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    event_date: "",
    registrationDeadline: "",
    time: "",
    location: "",
    price: "",
    category: "",
    totalSlots: "",
    tags: [],
    isPublic: false,
  });

  const {
    priceSuggestion,
    slotSuggestion,
    loading: aiLoading,
  } = useOrganizerAI();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) throw new Error("No authentication token found");

        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (!decoded.user?.email)
          throw new Error("Token does not contain user email");

        const [userRes, catRes] = await Promise.all([
          api.get(`/users/email/${decoded.user.email}`),
          api.get("/categories"),
        ]);

        setUserData(userRes.data.user);
        setCategories(catRes.data);
        setOrganizedCategories(organizeCategories(catRes.data));
      } catch (err) {
        setError("Failed to load initial data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateField(name, type === "checkbox" ? checked : value);
  };

  const handleApplySuggestion = (type, value) => {
    switch (type) {
      case "price":
        updateField("price", String(value));
        break;
      case "tag": {
        setFormData((prev) => {
          if (prev.tags.includes(value)) return prev;
          return { ...prev, tags: [...prev.tags, value] };
        });
        break;
      }
      case "tags":
        updateField("tags", Array.isArray(value) ? value : [value]);
        break;
      case "slots":
        updateField("totalSlots", String(value));
        break;
      case "date":
        updateField("event_date", value);
        break;
      default:
        break;
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!userData?._id)
        throw new Error("User data not found. Please try again.");

      const eventDate = new Date(formData.event_date);
      const regDeadline = new Date(formData.registrationDeadline);
      const now = new Date();

      if (!formData.category) throw new Error("Please select a valid category");
      if (regDeadline >= eventDate)
        throw new Error("Registration deadline must be before event date");
      if (eventDate <= now) throw new Error("Event date must be in the future");

      const eventPayload = {
        event_name: formData.event_name.trim(),
        description: formData.description.trim(),
        event_date: formData.event_date,
        registrationDeadline: formData.registrationDeadline,
        time: formData.time,
        location: formData.location.trim(),
        price: Number(formData.price),
        category: formData.category,
        totalSlots: Number(formData.totalSlots),
        org_ID: userData._id,
        tags: formData.tags,
        isPublic: formData.isPublic,
      };

      const response = await api.safePost("/events/create", eventPayload);

      if (response.data) {
        const eventId = response.data.event._id;
        const imageFile = formRef.current?.querySelector('[name="eventImage"]')
          ?.files?.[0];
        if (imageFile) await uploadEventImage(eventId, imageFile);

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
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadEventImage = async (eventId, imageFile) => {
    const fd = new FormData();
    fd.append("image", imageFile);
    fd.append("eventId", eventId);
    const res = await api.safePost("/events/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res.data?.success) throw new Error("Failed to upload the event image");
  };

  const sendAdminNotification = async (eventDetails) => {
    try {
      const payload = {
        eventId: eventDetails._id,
        message: `New event "${eventDetails.event_name}" requires approval`,
        userId: userData._id,
        type: "event_request",
      };
      await api.safePost("/notifications/events", payload);
    } catch (err) {
      console.error("sendAdminNotification error:", err);
    }
  };

  const handleDialogClose = () => {
    setShowApprovalDialog(false);
    navigate("/orgdb/my-events");
  };

  const resetForm = () => {
    setFormData({
      event_name: "",
      description: "",
      event_date: "",
      registrationDeadline: "",
      time: "",
      location: "",
      price: "",
      category: "",
      totalSlots: "",
      tags: [],
      isPublic: false,
    });
    setError("");
  };

  if (loading && !categories.length && !userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading…</p>
        </div>
      </div>
    );
  }

  const guideSteps = [
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: "Define Your Event",
      description:
        "Start with a clear, compelling event name and detailed description.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-500" />,
      title: "Set Dates & Times",
      description: "Choose your event date and registration deadline.",
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-500" />,
      title: "Location & Logistics",
      description: "Specify the venue, capacity, and pricing.",
    },
    {
      icon: <Tags className="w-8 h-8 text-orange-500" />,
      title: "Categorize & Tag",
      description:
        "Select categories and add tags to help people discover your event.",
    },
    {
      icon: <Camera className="w-8 h-8 text-pink-500" />,
      title: "Visual Appeal",
      description: "Upload an eye-catching event image.",
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      title: "Review & Submit",
      description: "Double-check all details before submitting.",
    },
  ];

  const tips = [
    "Use high-quality images relevant to your event theme",
    "Write clear descriptions answering who, what, when, where, and why",
    "Set reasonable pricing and capacity based on your venue",
    "Add relevant tags to improve discoverability",
    "Allow sufficient time between registration deadline and event date",
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Create New Event
                </h1>
              </div>
              <p className="text-gray-600">
                Design and launch your perfect event
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <button
                onClick={() => setShowAIAssistant((v) => !v)}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Bot className="w-5 h-5" />
                {showAIAssistant ? "Hide AI Assistant" : "AI Assistant"}
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </button>
            </div>
          </div>

          {/* AI Assistant Panel */}
          {showAIAssistant && (
            <div className="mb-8">
              <EventPlanningAssistant
                onApplySuggestion={handleApplySuggestion}
                categories={organizedCategories}
                initialData={formData}
              />
            </div>
          )}

          {/* Guide + Tips grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    How to Create Great Events
                  </h3>
                  <p className="text-sm text-gray-600">
                    Follow these steps for success
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                {guideSteps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shadow-md">
                      {step.icon}
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Pro Tips for Success
                  </h3>
                  <p className="text-sm text-gray-600">
                    Expert advice for your events
                  </p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                    <p className="text-sm text-gray-600">{tip}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">
                    AI-Powered Features
                  </h4>
                </div>
                <ul className="space-y-1 text-sm text-purple-600">
                  {[
                    "Price optimisation based on market data",
                    "Smart tag recommendations",
                    "Capacity suggestions for your venue",
                    "Best date selection based on trends",
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Event Modal ─────────────────────────────────────────────── */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Create New Event
                  </h2>
                  <AIBadge
                    type="organizer"
                    agent="planning"
                    size="sm"
                    animate={false}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Fill in the details. AI suggestions apply directly to the
                  form.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-6" ref={formRef}>
              <form onSubmit={handleCreateEvent} className="space-y-6">
                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">
                        Error Creating Event
                      </p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                {/* Inline AI panels */}
                {formData.category && formData.location && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PriceSuggestion
                      category={formData.category}
                      location={formData.location}
                      onApplyPrice={(price) =>
                        handleApplySuggestion("price", price)
                      }
                    />
                    {formData.description.length > 50 && (
                      <TagRecommender
                        description={formData.description}
                        category={formData.category}
                        onTagsSelected={(tags) =>
                          handleApplySuggestion("tags", tags)
                        }
                      />
                    )}
                  </div>
                )}

                {/* Row 1 — Name + Category */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Event Name
                    </label>
                    <input
                      name="event_name"
                      type="text"
                      required
                      value={formData.event_name}
                      onChange={handleInputChange}
                      placeholder="Enter a compelling event name"
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border appearance-none bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select Category</option>
                        {organizedCategories.map((c) =>
                          renderCategoryOptions(c)
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 pointer-events-none">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2 — Dates + Time */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Event Date
                      </label>
                      <input
                        name="event_date"
                        type="date"
                        required
                        value={formData.event_date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Time
                      </label>
                      <input
                        name="time"
                        type="time"
                        required
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                      required
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Row 3 — Location + Tags */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Location
                    </label>
                    <input
                      name="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter venue location"
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Tags className="w-4 h-4" /> Tags
                    </label>
                    <input
                      type="text"
                      placeholder="Type a tag and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !formData.tags.includes(val)) {
                            handleApplySuggestion("tag", val);
                          }
                          e.target.value = "";
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    {/* Tag chips */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {formData.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-purple-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4 — Slots + Price */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Total Slots
                    </label>
                    <input
                      name="totalSlots"
                      type="number"
                      required
                      min="1"
                      value={formData.totalSlots}
                      onChange={handleInputChange}
                      placeholder="Enter capacity"
                      className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    {slotSuggestion && (
                      <button
                        type="button"
                        onClick={() =>
                          handleApplySuggestion(
                            "slots",
                            slotSuggestion.suggestedSlots
                          )
                        }
                        className="mt-1.5 text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        AI suggests {slotSuggestion.suggestedSlots} slots —
                        apply
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> Price (Rs)
                    </label>
                    <div className="relative">
                      <input
                        name="price"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                        className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                      {priceSuggestion && (
                        <button
                          type="button"
                          onClick={() =>
                            handleApplySuggestion(
                              "price",
                              priceSuggestion.suggestedPrice
                            )
                          }
                          className="absolute right-2 top-2.5 px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors"
                        >
                          AI: Rs.{priceSuggestion.suggestedPrice}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Camera className="w-4 h-4" /> Event Image
                  </label>
                  <input
                    name="eventImage"
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200
                      file:bg-blue-50 file:border-0 file:text-blue-700 file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:text-sm file:font-medium hover:file:bg-blue-100 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                    <FileText className="w-4 h-4" /> Description
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event in detail…"
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  />
                  {formData.description.length > 0 &&
                    formData.description.length < 50 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Add more details ({50 - formData.description.length}{" "}
                        chars more) to unlock AI tag suggestions
                      </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || aiLoading}
                    className="flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300
                      bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
                      text-white shadow-lg hover:shadow-xl hover:scale-105
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating…
                      </span>
                    ) : (
                      "Create Event"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approval dialog */}
      <Dialog open={showApprovalDialog} onClose={handleDialogClose}>
        <DialogContent variant="info">
          <DialogTitle>Event Submitted Successfully</DialogTitle>
          <DialogDescription>
            Your event "{pendingEventDetails?.event_name}" has been submitted
            and is awaiting admin approval. You'll be notified once it's
            approved.
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
