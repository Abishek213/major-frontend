import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Tag,
  User,
  CalendarCheck,
  Share2,
  XCircle,
  Calendar as CalendarIcon,
  ArrowLeft,
  Check,
  Heart,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Eye,
  ChevronRight,
  Sparkles,
  Bookmark,
  Brain,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
  Gift,
  TrendingDown,
  Bell,
  Info,
  Award,
} from "lucide-react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { useRecommendations } from "@/hooks/useRecommendations";
import AIBadge from "@/components/ai/user/AIBadge";
import AILoadingSpinner from "@/components/ai/user/AILoadingSpinner";
import BookingForm from "@/components/BookingForm";

const EventDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [aiRecommendedEvents, setAiRecommendedEvents] = useState([]);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [priceAlert, setPriceAlert] = useState(false);
  const [availabilityAlert, setAvailabilityAlert] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // AI Recommendations Hook
  const {
    recommendations,
    loading: aiLoading,
    rateRecommendation,
    getRecommendationInsights,
    getSimilarEvents,
  } = useRecommendations();

  const fetchWishlistStatus = async (eventId) => {
    try {
      const response = await api.safeGet("/users/wishlist");
      return (
        response.data.wishlist?.some((item) => item._id === eventId) || false
      );
    } catch (err) {
      console.error("Error fetching wishlist status:", err);
      return false;
    }
  };

  // Generate AI insights for the event
  const generateAIInsights = (eventData) => {
    if (!eventData) return null;

    const insights = {
      popularityScore: Math.floor(Math.random() * 30) + 70, // Mock AI score
      recommendationReason: generateRecommendationReason(eventData),
      bestTimeToBook: generateBestTimeToBook(eventData),
      crowdPrediction: generateCrowdPrediction(eventData),
      priceTrend: generatePriceTrend(eventData),
      similarUserInterest: Math.floor(Math.random() * 40) + 60,
      weatherForecast: generateWeatherForecast(eventData.location),
      aiMatchScore: Math.floor(Math.random() * 25) + 75,
    };

    return insights;
  };

  const generateRecommendationReason = (event) => {
    const reasons = [
      `Matches your interest in ${event.category?.categoryName || "events"}`,
      `Popular among users who attended similar events`,
      `Highly rated by attendees in your area`,
      `Based on your wishlist preferences`,
      `Trending in your network right now`,
      `Perfect match for your ${event.tags?.[0] || "interests"}`,
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const generateBestTimeToBook = (event) => {
    const daysUntilEvent = Math.ceil(
      (new Date(event.event_date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilEvent > 30) return "Book within 2 weeks for best price";
    if (daysUntilEvent > 14) return "Prices expected to rise soon - book now";
    if (daysUntilEvent > 7) return "Limited tickets remaining - book today";
    return "Last chance to book!";
  };

  const generateCrowdPrediction = (event) => {
    const fillRate = (event.attendees?.length / event.totalSlots) * 100;
    if (fillRate > 80) return "Very busy - almost full";
    if (fillRate > 50) return "Moderate crowd expected";
    return "Good availability";
  };

  const generatePriceTrend = (event) => {
    const trends = ["stable", "rising", "falling"];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    return {
      direction: trend,
      message:
        trend === "rising"
          ? "Prices expected to increase"
          : trend === "falling"
          ? "Price drop detected"
          : "Price stable",
      percentage:
        trend === "rising" ? "+15%" : trend === "falling" ? "-10%" : "0%",
    };
  };

  const generateWeatherForecast = (location) => {
    const conditions = ["Sunny", "Partly Cloudy", "Clear", "Mild"];
    return {
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: Math.floor(Math.random() * 15) + 20,
      icon: "☀️",
    };
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventId = location.state?.eventId || id;

        if (eventId) {
          // Fetch event details; gracefully skip endpoints that may not exist yet
          const eventResponse = await api.safeGet(`/events/${eventId}`);
          const eventData = eventResponse.data;
          setEvent(eventData);

          // Generate AI insights locally (no backend endpoint needed)
          setAiInsights(generateAIInsights(eventData));

          // Similar events from the same backend events route (best-effort)
          let similarData = [];
          try {
            const similarResponse = await api.safeGet(
              `/events/${eventId}/similar`
            );
            similarData = similarResponse.data || [];
          } catch {
            // endpoint may not exist yet — silently skip
          }
          setSimilarEvents(similarData);

          // Registration status (best-effort)
          try {
            const registrationResponse = await api.safeGet(
              `/events/${eventId}/registration-status`
            );
            setIsRegistered(registrationResponse.data?.isRegistered || false);
          } catch {
            setIsRegistered(false);
          }

          // Wishlist status
          const wishlistStatus = await fetchWishlistStatus(eventId);
          setIsInWishlist(wishlistStatus);

          // AI similar events — use the hook's getSimilarEvents (uses existing
          // recommendations from GET /api/v1/ai/recommendations; no extra request)
          try {
            const aiSimilar = await getSimilarEvents(eventId);
            setAiRecommendedEvents(aiSimilar || []);
          } catch {
            // Fall back to regular similar events
            setAiRecommendedEvents(similarData.slice(0, 3));
          }

          // Track event view for AI learning (stub — endpoint doesn't exist yet)
          if (user?.id && import.meta.env.DEV) {
            console.log("[EventDetail] view tracked (stub):", {
              userId: user.id,
              eventId,
            });
          }
        } else {
          const eventsResponse = await api.safeGet("/events", {
            params: { search: id.replace(/-/g, " ") },
          });

          if (eventsResponse.data.length > 0) {
            const foundEvent = eventsResponse.data[0];

            setEvent(foundEvent);
            setAiInsights(generateAIInsights(foundEvent));

            try {
              const similarResponse = await api.safeGet(
                `/events/${foundEvent._id}/similar`
              );
              setSimilarEvents(similarResponse.data || []);
            } catch {
              setSimilarEvents([]);
            }

            try {
              const registrationResponse = await api.safeGet(
                `/events/${foundEvent._id}/registration-status`
              );
              setIsRegistered(registrationResponse.data?.isRegistered || false);
            } catch {
              setIsRegistered(false);
            }

            const wishlistStatus = await fetchWishlistStatus(foundEvent._id);
            setIsInWishlist(wishlistStatus);

            try {
              const aiSimilar = await getSimilarEvents(foundEvent._id);
              setAiRecommendedEvents(aiSimilar || []);
            } catch {
              setAiRecommendedEvents([]);
            }
          } else {
            throw new Error("Event not found");
          }
        }

        setError(null);
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, location.state, user?.id]);

  const handleWishlist = async () => {
    if (!event?._id) return;

    try {
      setWishlistLoading(true);

      if (isInWishlist) {
        await api.safeDelete(`/users/wishlist/${event._id}`);
        setIsInWishlist(false);
      } else {
        await api.safePost("/users/wishlist", { eventId: event._id });
        setIsInWishlist(true);

        // Track wishlist add for AI (stub — log only until backend endpoint exists)
        if (user?.id && import.meta.env.DEV) {
          console.log("[EventDetail] wishlist interaction tracked (stub):", {
            userId: user.id,
            eventId: event._id,
          });
        }
      }
    } catch (err) {
      setError(err.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleFeedback = async (type) => {
    if (!event?._id || !user?.id) return;

    setFeedbackGiven((prev) => ({ ...prev, [event._id]: type }));

    try {
      // Rate the recommendation via hook (updates local state)
      await rateRecommendation(event._id, type === "like" ? 5 : 1);

      // Stub: log interaction until backend endpoint is available
      if (import.meta.env.DEV) {
        console.log("[EventDetail] feedback tracked (stub):", {
          userId: user.id,
          eventId: event._id,
          type,
        });
      }

      setTimeout(() => {
        setFeedbackGiven((prev) => ({ ...prev, [event._id]: null }));
      }, 3000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  const handlePriceAlert = async () => {
    setPriceAlert(!priceAlert);
    // Stub: log until /users/price-alerts endpoint is implemented in backend
    if (import.meta.env.DEV) {
      console.log("[EventDetail] price alert stub:", {
        eventId: event._id,
        enabled: !priceAlert,
      });
    }
  };

  const handleAvailabilityAlert = async () => {
    setAvailabilityAlert(!availabilityAlert);
    // Stub: log until /users/availability-alerts endpoint is implemented in backend
    if (import.meta.env.DEV) {
      console.log("[EventDetail] availability alert stub:", {
        eventId: event._id,
        enabled: !availabilityAlert,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRegistration = () => {
    setShowBookingForm(true);
  };

  const handleCancelRegistration = async () => {
    try {
      await api.safeDelete(`/events/${event._id}/register`);
      setIsRegistered(false);

      const response = await api.safeGet(`/events/${event._id}`);
      setEvent(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to cancel registration");
    }
  };

  const handleAddToCalendar = () => {
    const eventDetails = {
      title: event.event_name,
      description: event.description,
      location: event.location,
      start: new Date(event.event_date),
      duration: 60,
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventDetails.title
    )}&details=${encodeURIComponent(
      eventDetails.description
    )}&location=${encodeURIComponent(eventDetails.location)}&dates=${
      eventDetails.start.toISOString().replace(/[-:]/g, "").split(".")[0]
    }Z/${
      new Date(eventDetails.start.getTime() + eventDetails.duration * 60000)
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0]
    }Z`;

    window.open(googleCalendarUrl, "_blank");
    setAddedToCalendar(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: event.event_name,
      text: event.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleBack = () => {
    const source = location.state?.source || "events";
    if (source === "wishlist") {
      navigate("/userdb/wishlist");
    } else {
      navigate("/userdb/events");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AILoadingSpinner />
                <p className="text-lg font-medium text-gray-700 mt-4">
                  AI is analyzing event details...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isEventFull = event.attendees.length >= event.totalSlots;
  const isPastDeadline = new Date(event.registrationDeadline) < new Date();
  const fillPercentage = (event.attendees.length / event.totalSlots) * 100;

  return (
    <>
      <div className="space-y-8 p-4 md:p-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
          {location.state?.source === "wishlist"
            ? "Back to Wishlist"
            : "Back to Events"}
        </button>

        {/* Main Event Container */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Event Hero Image with AI Badge */}
          <div className="relative h-96">
            <img
              src={
                event.image
                  ? `/uploads/events/${event.image.split("/").pop()}`
                  : "/default-event.jpg"
              }
              alt={event.event_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* AI Match Badge */}
            {aiInsights && user && (
              <div className="absolute top-6 left-6">
                <AIBadge
                  score={aiInsights.aiMatchScore}
                  reason={aiInsights.recommendationReason}
                  size="lg"
                />
              </div>
            )}

            <div className="absolute top-6 right-6 flex flex-col items-end gap-3">
              {/* Wishlist Button */}
              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={`group p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                  isInWishlist
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                    : "bg-white/90 hover:bg-white text-gray-700 hover:shadow-lg"
                } ${
                  wishlistLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
              >
                {wishlistLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Heart
                    className={`h-6 w-6 ${isInWishlist ? "fill-current" : ""}`}
                  />
                )}
              </button>

              {/* Status Badge */}
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm ${
                  event.status === "upcoming"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500"
                    : event.status === "ongoing"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                    : event.status === "completed"
                    ? "bg-gradient-to-r from-gray-500 to-gray-700"
                    : "bg-gradient-to-r from-rose-500 to-pink-500"
                } text-white`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">
                {event.event_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 drop-shadow-md">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* AI Insights Banner */}
            {aiInsights && user && (
              <div className="mb-10 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        AI Event Insights
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-normal">
                          {aiInsights.aiMatchScore}% Match
                        </span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedback("like")}
                          className={`p-2 rounded-lg transition-all ${
                            feedbackGiven[event._id] === "like"
                              ? "bg-green-500 text-white"
                              : "bg-white/20 hover:bg-white/30 text-white"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback("dislike")}
                          className={`p-2 rounded-lg transition-all ${
                            feedbackGiven[event._id] === "dislike"
                              ? "bg-red-500 text-white"
                              : "bg-white/20 hover:bg-white/30 text-white"
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-purple-100 mb-4">
                      {aiInsights.recommendationReason}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-purple-100 mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Best Time</span>
                        </div>
                        <p className="text-white font-medium text-sm">
                          {aiInsights.bestTimeToBook}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-purple-100 mb-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">Crowd</span>
                        </div>
                        <p className="text-white font-medium text-sm">
                          {aiInsights.crowdPrediction}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-purple-100 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs">Price Trend</span>
                        </div>
                        <p className="text-white font-medium text-sm">
                          {aiInsights.priceTrend.message}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-purple-100 mb-1">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs">Weather</span>
                        </div>
                        <p className="text-white font-medium text-sm">
                          {aiInsights.weatherForecast.condition},{" "}
                          {aiInsights.weatherForecast.temperature}°C
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Event Stats with AI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
              <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {event.attendees.length}/{event.totalSlots}
                </h3>
                <p className="text-gray-600 font-medium">Attendees</p>
                <div className="mt-3 h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${fillPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <Sparkles className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  Rs. {event.price}
                </h3>
                <p className="text-gray-600 font-medium">Ticket Price</p>
                {aiInsights?.priceTrend.direction === "falling" && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    {aiInsights.priceTrend.percentage}
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <CalendarCheck className="w-8 h-8 text-amber-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {Math.ceil(
                    (new Date(event.event_date) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  )}
                  d
                </h3>
                <p className="text-gray-600 font-medium">Days Left</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <Award className="w-8 h-8 text-purple-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {aiInsights?.popularityScore || 85}%
                </h3>
                <p className="text-gray-600 font-medium">Popularity</p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <Heart className="w-8 h-8 text-rose-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {isRegistered ? "Yes" : "No"}
                </h3>
                <p className="text-gray-600 font-medium">Registered</p>
              </div>
            </div>

            {/* Alert Buttons */}
            {user && (
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handlePriceAlert}
                  className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                    priceAlert
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {priceAlert ? "Price Alert Set" : "Notify me on price drop"}
                </button>

                <button
                  onClick={handleAvailabilityAlert}
                  className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                    availabilityAlert
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {availabilityAlert
                    ? "Availability Alert Set"
                    : "Alert when spots open"}
                </button>
              </div>
            )}

            {/* Event Description */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                About This Event
              </h2>
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Event Details
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Event Date</p>
                      <p className="text-gray-600">
                        {formatDate(event.event_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Registration Deadline
                      </p>
                      <p className="text-gray-600">
                        {formatDate(event.registrationDeadline)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Time</p>
                      <p className="text-gray-600">
                        {formatTime(event.event_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Location</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  Category & Organizer
                </h3>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Tag className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-bold text-gray-800 text-lg">
                        {event.category?.categoryName || "Uncategorized"}
                      </p>
                    </div>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <>
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Event Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Organized by</p>
                      <p className="font-bold text-gray-800 text-lg">
                        {event.org_ID?.fullname || "Event Organizer"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event.org_ID?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-6 mb-10">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleShare}
                  className="group px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Share Event
                </button>

                <button
                  onClick={handleAddToCalendar}
                  className={`group px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
                    addedToCalendar
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {addedToCalendar ? (
                    <>
                      <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Added to Calendar
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Add to Calendar
                    </>
                  )}
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                {isRegistered ? (
                  <button
                    onClick={handleCancelRegistration}
                    className="w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancel Registration
                  </button>
                ) : (
                  <button
                    onClick={handleRegistration}
                    disabled={isEventFull || isPastDeadline}
                    className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                      isEventFull || isPastDeadline
                        ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    }`}
                  >
                    {isEventFull
                      ? "Event Full - Join Waitlist"
                      : isPastDeadline
                      ? "Registration Closed"
                      : "Register for Event"}
                  </button>
                )}
              </div>
            </div>

            {/* AI-Powered Similar Events */}
            {aiRecommendedEvents.length > 0 && (
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600" />
                    AI-Powered Recommendations
                  </h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Personalized for you
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiRecommendedEvents.map((similarEvent, index) => (
                    <div
                      key={similarEvent._id || index}
                      className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative"
                    >
                      {similarEvent.matchScore && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {similarEvent.matchScore}% match
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors pr-16">
                            {similarEvent.event_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(similarEvent.event_date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {similarEvent.aiReason && (
                        <p className="text-xs text-purple-600 mb-3 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {similarEvent.aiReason}
                        </p>
                      )}

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {similarEvent.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">
                          Rs. {similarEvent.price}
                        </span>
                        <button
                          onClick={() => {
                            navigate(`/userdb/events/${similarEvent._id}`);
                            window.scrollTo(0, 0);
                          }}
                          className="group/view px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 transition-all duration-300"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Similar Events Fallback */}
            {similarEvents.length > 0 && aiRecommendedEvents.length === 0 && (
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Similar Events You Might Like
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarEvents.slice(0, 3).map((similarEvent) => (
                    <div
                      key={similarEvent._id}
                      className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                            {similarEvent.event_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(similarEvent.event_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {similarEvent.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-800">
                          Rs. {similarEvent.price}
                        </span>
                        <button
                          onClick={() => {
                            navigate(`/userdb/events/${similarEvent._id}`);
                            window.scrollTo(0, 0);
                          }}
                          className="group/view px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 transition-all duration-300"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          event={event}
          onClose={() => setShowBookingForm(false)}
          onSuccess={async () => {
            setIsRegistered(true);
            setShowBookingForm(false);
            // Refresh event data to reflect updated attendee count
            try {
              const response = await api.safeGet(`/events/${event._id}`);
              setEvent(response.data);
            } catch {
              // silently skip if refresh fails
            }
            // Stub: log registration interaction
            if (user?.id && import.meta.env.DEV) {
              console.log(
                "[EventDetail] register interaction tracked (stub):",
                {
                  userId: user.id,
                  eventId: event._id,
                }
              );
            }
          }}
        />
      )}
    </>
  );
};

export default EventDetails;
