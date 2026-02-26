import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  TrendingUp,
  Sparkles,
  Filter,
  Tag,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  DollarSign,
  Clock,
  Eye,
  CheckCircle,
  X,
  Star,
  MessageSquarePlus,
  History,
  Brain,
} from "lucide-react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import ReviewModal from "@/components/ReviewModal";
import { getUserReviews } from "@/services/reviewService";
import RecommendationSection from "@/components/ai/user/RecommendationSection";

const UserEvents = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const [reviewModalEvent, setReviewModalEvent] = useState(null);
  const [reviewedEventIds, setReviewedEventIds] = useState(new Set());

  // Memoized list of parent categories (categories without a parent)
  const parentCategories = useMemo(() => {
    return categories.filter(
      (cat) => !cat.parentCategory || cat.parentCategory === null
    );
  }, [categories]);

  // If the currently selected category is not a parent category, reset to "all"
  useEffect(() => {
    if (selectedCategory !== "all") {
      const isParent = parentCategories.some(
        (cat) => cat._id === selectedCategory
      );
      if (!isParent) {
        setSelectedCategory("all");
      }
    }
  }, [selectedCategory, parentCategories]);

  const determineEventStatus = (eventDate) => {
    const now = new Date();
    const eventDay = new Date(eventDate);
    if (eventDay.toDateString() === now.toDateString()) return "ongoing";
    if (eventDay < now) return "completed";
    return "upcoming";
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [eventsResponse, categoriesResponse] = await Promise.all([
          api.safeGet("/events"),
          api.safeGet("/categories"),
        ]);

        const processedEvents = (eventsResponse?.data || []).map((event) => ({
          ...event,
          status: event.status || determineEventStatus(event.event_date),
        }));

        setEvents(processedEvents);
        setFilteredEvents(processedEvents);
        setCategories(categoriesResponse?.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch user's reviews and build a set of reviewed event IDs
  useEffect(() => {
    if (!authUser) return;

    const fetchUserReviews = async () => {
      try {
        const res = await getUserReviews();
        console.log("Reviews API response:", res);

        let reviewsArray = [];
        if (res?.data) {
          if (Array.isArray(res.data)) {
            reviewsArray = res.data;
          } else if (res.data.reviews && Array.isArray(res.data.reviews)) {
            reviewsArray = res.data.reviews;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            reviewsArray = res.data.data;
          } else {
            console.warn("Unexpected reviews response structure:", res.data);
          }
        }

        const ids = new Set();
        reviewsArray.forEach((review) => {
          let eventId = null;

          if (
            review.eventId &&
            typeof review.eventId === "object" &&
            review.eventId._id
          ) {
            eventId = review.eventId._id;
          } else if (review.eventId && typeof review.eventId === "string") {
            eventId = review.eventId;
          } else if (
            review.event &&
            typeof review.event === "object" &&
            review.event._id
          ) {
            eventId = review.event._id;
          } else if (review.event && typeof review.event === "string") {
            eventId = review.event;
          }

          if (eventId) {
            ids.add(eventId.toString());
          }
        });

        setReviewedEventIds(ids);
      } catch (err) {
        console.error("Failed to fetch user reviews:", err);
      }
    };

    fetchUserReviews();
  }, [authUser]);

  useEffect(() => {
    if (activeTab === "past") {
      let completedEvents = events.filter((event) => {
        const isAttendee = event.attendees?.some((attendee) => {
          const attendeeId = attendee?._id
            ? attendee._id.toString()
            : attendee?.toString();
          if (attendeeId === authUser?._id?.toString()) return true;

          if (
            attendee?.email &&
            authUser?.email &&
            attendee.email === authUser.email
          )
            return true;

          return false;
        });

        if (!isAttendee) return false;

        const status = event.status || determineEventStatus(event.event_date);
        return (
          status === "completed" || new Date(event.event_date) < new Date()
        );
      });

      if (selectedCategory !== "all") {
        completedEvents = completedEvents.filter(
          (e) =>
            e.category?._id === selectedCategory ||
            e.category?.parentCategory?._id === selectedCategory
        );
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        completedEvents = completedEvents.filter(
          (e) =>
            e.event_name?.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q) ||
            e.location?.toLowerCase().includes(q) ||
            e.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }

      // Sort latest attended event first
      completedEvents.sort(
        (a, b) => new Date(b.event_date) - new Date(a.event_date)
      );

      setFilteredEvents(completedEvents);
      return;
    }

    let filtered = [...events];

    if (activeTab === "all") {
      filtered = filtered.filter((e) => e.status !== "completed");
    } else {
      filtered = filtered.filter((e) => e.status === activeTab);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (e) =>
          e.category?._id === selectedCategory ||
          e.category?.parentCategory?._id === selectedCategory
      );
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.event_name?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    setFilteredEvents(filtered);
  }, [searchTerm, events, activeTab, selectedCategory, authUser]);

  const refreshEvents = async () => {
    try {
      setLoading(true);
      const response = await api.safeGet("/events");
      const processedEvents = (response?.data || []).map((event) => ({
        ...event,
        status: event.status || determineEventStatus(event.event_date),
      }));
      setEvents(processedEvents);
      setFilteredEvents(processedEvents);
      setError(null);
    } catch {
      setError("Failed to refresh events");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (event) => {
    const urlFriendlyName = event.event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    navigate(`/userdb/events/${urlFriendlyName}`, {
      state: {
        eventId: event._id,
        eventData: event,
        source: "events",
      },
    });
  };

  const tabs = [
    { id: "all", label: "All Events", icon: Calendar },
    { id: "upcoming", label: "Upcoming", icon: TrendingUp },
    { id: "ongoing", label: "Ongoing", icon: Clock },
    { id: "past", label: "My History", icon: History },
    { id: "for-you", label: "For You", icon: Brain },
  ];

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                <p className="text-lg font-medium text-gray-700 mt-4">
                  Loading events...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !events.length) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm">
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

  const isPastTab = activeTab === "past";
  const isForYouTab = activeTab === "for-you";

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                Events Dashboard
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Discover and join amazing events
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={refreshEvents}
                disabled={loading}
                className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                  loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                }`}
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh Events"}
              </button>
            </div>
          </div>
          <div className="space-y-6 mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {isForYouTab ? (
                    <Brain className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Filter className="w-5 h-5 text-indigo-600" />
                  )}
                  {isForYouTab
                    ? "Recommendations"
                    : isPastTab
                    ? "My Event History"
                    : "Discover Events"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isForYouTab
                    ? "Personalized picks powered by AI — just for you"
                    : isPastTab
                    ? `${filteredEvents.length} attended events — share your experience!`
                    : `${filteredEvents.length} events found`}
                </p>
              </div>

              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                        isActive && tab.id === "for-you"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                          : isActive
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Past events banner */}
            {isPastTab && (
              <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Help others by rating events you've attended. Your feedback
                  makes a difference!
                </p>
              </div>
            )}

            {/* For You banner */}
            {isForYouTab && (
              <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <Brain className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <p className="text-sm text-purple-800">
                  Your AI picks are refreshed based on your interests, past
                  events, and activity. The more you explore, the smarter it
                  gets!
                </p>
              </div>
            )}

            {/* Search input – now visible on all tabs */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by name, description, location, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categories – now visible on all tabs */}
            {parentCategories.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" />
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {parentCategories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === cat._id
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat.category_Name || cat.categoryName || cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* For You tab — render AI RecommendationSection with external filters */}
          {isForYouTab ? (
            <div className="-mx-6 md:-mx-8 -mb-6 md:-mb-8">
              <RecommendationSection
                minimal
                externalSearchTerm={searchTerm}
                externalCategoryId={
                  selectedCategory !== "all" ? selectedCategory : null
                }
              />
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.length === 0 ? (
                <div className="py-16 text-center border border-gray-200 rounded-xl">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No Events Found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {isPastTab
                      ? "You haven't attended any events yet. Join an event to see your history here."
                      : searchTerm
                      ? `No events matching "${searchTerm}". Try a different search term.`
                      : "No events match your selected filters. Try adjusting your criteria."}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setActiveTab("all");
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => {
                    const isEventFull =
                      event.attendees?.length >= event.totalSlots;
                    const status =
                      event.status || determineEventStatus(event.event_date);
                    const isPast = status === "completed";
                    const hasReviewed = reviewedEventIds.has(
                      event._id?.toString()
                    );

                    return (
                      <div
                        key={event._id}
                        className={`group bg-gradient-to-br from-white to-gray-50 border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative ${
                          isPast ? "border-amber-100" : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`relative overflow-hidden ${
                            isPast ? "h-36" : "h-48"
                          }`}
                        >
                          <img
                            src={
                              event.image
                                ? `/uploads/events/${event.image
                                    .split("/")
                                    .pop()}`
                                : "/default-event.jpg"
                            }
                            alt={event.event_name}
                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                              isPast ? "grayscale-[30%]" : ""
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                          {/* Status badge */}
                          <div className="absolute top-4 right-4">
                            {isPast ? (
                              <span className="px-3 py-1 rounded-full text-sm font-medium text-white shadow-lg bg-gradient-to-r from-gray-500 to-gray-700 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Attended
                              </span>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium text-white shadow-lg ${
                                  status === "upcoming"
                                    ? "bg-gradient-to-r from-emerald-500 to-green-500"
                                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                                }`}
                              >
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </span>
                            )}
                          </div>

                          {/* Review badge overlay for past reviewed events */}
                          {isPast && hasReviewed && (
                            <div className="absolute top-4 left-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow flex items-center gap-1">
                                <Star className="w-3 h-3 fill-white" />
                                Reviewed
                              </span>
                            </div>
                          )}

                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white font-medium shadow-lg flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {event.price}
                            </span>
                          </div>
                        </div>

                        <div className={isPast ? "p-4" : "p-6"}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(event.event_date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            {!isPast && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {event.attendees?.length || 0}/
                                  {event.totalSlots}
                                </span>
                              </div>
                            )}
                          </div>

                          <h3
                            className={`font-bold text-gray-800 group-hover:text-indigo-700 transition-colors text-lg line-clamp-2 ${
                              isPast ? "mb-2" : "mb-3"
                            }`}
                          >
                            {event.event_name}
                          </h3>

                          <div
                            className={`flex items-center gap-2 ${
                              isPast ? "mb-3" : "mb-4"
                            }`}
                          >
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 line-clamp-1">
                              {event.location}
                            </span>
                          </div>

                          {event.category && (
                            <div
                              className={`flex flex-wrap gap-2 ${
                                isPast ? "mb-3" : "mb-4"
                              }`}
                            >
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                                {event.category.category_Name ||
                                  event.category.categoryName}
                              </span>
                              {event.category.parentCategory?.categoryName && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                                  {event.category.parentCategory.categoryName}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="pt-4 border-t border-gray-200 space-y-2">
                            {isPast ? (
                              /* Past event: review-focused actions only */
                              <>
                                {hasReviewed ? (
                                  <div className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700 text-sm select-none">
                                    <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                                    Reviewed
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-xs text-center text-gray-500 mb-1">
                                      How was your experience?
                                    </p>
                                    <button
                                      onClick={() => setReviewModalEvent(event)}
                                      className="group/rate w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white shadow-md hover:shadow-lg transition-all duration-300 text-sm"
                                    >
                                      <MessageSquarePlus className="w-4 h-4 group-hover/rate:scale-110 transition-transform" />
                                      Rate &amp; Review This Event
                                      <Star className="w-3.5 h-3.5 fill-white/70 group-hover/rate:fill-white transition-all" />
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              /* Active events: normal view details button */
                              <>
                                <button
                                  onClick={() => handleViewDetails(event)}
                                  className="group/view w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  <Eye className="w-4 h-4 group-hover/view:scale-110 transition-transform" />
                                  View Details
                                  <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                                </button>

                                {/* Registration deadline only for non-past events */}
                                {event.registrationDeadline && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-amber-500" />
                                      <p className="text-xs text-gray-600">
                                        Registration closes{" "}
                                        {new Date(
                                          event.registrationDeadline
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {reviewModalEvent && (
        <ReviewModal
          event={reviewModalEvent}
          onClose={() => setReviewModalEvent(null)}
          onSuccess={(eventId) => {
            setReviewedEventIds(
              (prev) => new Set([...prev, eventId?.toString()])
            );
            setReviewModalEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default UserEvents;
