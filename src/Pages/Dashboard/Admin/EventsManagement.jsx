import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import websocketManager from "@/utils/websocketManager";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  MapPin,
  Filter,
  Eye,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
  UserCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Tag,
  Globe,
  Phone,
  Mail,
  Building,
  Info,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Download,
  Printer,
  BarChart3,
} from "lucide-react";

const EventsManagement = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "event_date",
    direction: "asc",
  });

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const [pendingRes, dashboardRes] = await Promise.all([
        api.get("/admin/pending-events", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (Array.isArray(pendingRes?.data?.data)) {
        setPendingEvents(pendingRes.data.data);
      } else {
        throw new Error("Invalid pending events response");
      }

      if (dashboardRes?.data?.success && dashboardRes.data.data) {
        const d = dashboardRes.data.data;
        const eventStats = d.eventStats || {};
        const approvedCount =
          (eventStats.upcoming || 0) + (eventStats.ongoing || 0);
        setStats({
          pending: eventStats.pending || 0,
          approved: approvedCount,
          rejected: eventStats.rejected || 0,
          total:
            d.statsData?.find((s) => s.title === "Total Events")?.value || 0,
        });
      }

      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 403) {
        setError(
          "You don't have permission. Please ensure you have admin privileges."
        );
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(err.message || "Failed to load data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAction = async (eventId, action) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const notificationData = {
        eventId,
        status: action === "approve" ? "approved" : "rejected",
        message: `Your event has been ${
          action === "approve" ? "approved" : "rejected"
        }`,
        type: "event_response",
      };

      const eventResponse = await api.post(
        `/admin/approve-event/${eventId}`,
        {
          status: action === "approve" ? "approved" : "rejected",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (eventResponse?.data?.success) {
        try {
          await api.post(
            `/notifications/events/${eventId}/approve`,
            notificationData
          );
        } catch (notificationError) {
          console.warn(
            "Failed to create persistent notification:",
            notificationError
          );
        }

        if (websocketManager?.isConnected()) {
          try {
            websocketManager.send("event_response", {
              ...notificationData,
              notificationId: Date.now(),
            });
          } catch (wsError) {
            console.warn("WebSocket notification failed:", wsError);
          }
        }

        await fetchData();
      } else {
        throw new Error("Failed to update event status");
      }
    } catch (err) {
      console.error("Action error:", err);
      if (err.response?.status === 403) {
        setError("You don't have permission to perform this action");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          `Failed to ${action} event: ${
            err.response?.data?.message || err.message
          }`
        );
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const viewEventDetailsModal = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const closeModal = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const filteredEvents = pendingEvents.filter((event) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.event_name?.toLowerCase().includes(searchLower) ||
      event.organizer?.name?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower) ||
      event.category?.categoryName?.toLowerCase().includes(searchLower)
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortConfig.key === "event_date") {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === "event_name") {
      const nameA = a.event_name?.toLowerCase() || "";
      const nameB = b.event_name?.toLowerCase() || "";
      return sortConfig.direction === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    if (sortConfig.key === "organizer") {
      const orgA = a.organizer?.name?.toLowerCase() || "";
      const orgB = b.organizer?.name?.toLowerCase() || "";
      return sortConfig.direction === "asc"
        ? orgA.localeCompare(orgB)
        : orgB.localeCompare(orgA);
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);

  const requestSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const EventDetailsModal = ({ event, onClose }) => {
    if (!event) return null;

    const getStatusInfo = (status) => {
      switch (status) {
        case "pending":
          return {
            bg: "bg-amber-100",
            text: "text-amber-700",
            dot: "bg-amber-500",
            label: "Pending",
          };
        case "upcoming":
          return {
            bg: "bg-blue-100",
            text: "text-blue-700",
            dot: "bg-blue-500",
            label: "Upcoming",
          };
        case "ongoing":
          return {
            bg: "bg-emerald-100",
            text: "text-emerald-700",
            dot: "bg-emerald-500",
            label: "Ongoing",
          };
        case "completed":
          return {
            bg: "bg-gray-100",
            text: "text-gray-700",
            dot: "bg-gray-500",
            label: "Completed",
          };
        case "cancelled":
          return {
            bg: "bg-rose-100",
            text: "text-rose-700",
            dot: "bg-rose-500",
            label: "Cancelled",
          };
        case "rejected":
          return {
            bg: "bg-rose-100",
            text: "text-rose-700",
            dot: "bg-rose-500",
            label: "Rejected",
          };
        default:
          return {
            bg: "bg-gray-100",
            text: "text-gray-700",
            dot: "bg-gray-500",
            label: status || "Unknown",
          };
      }
    };

    const statusInfo = getStatusInfo(event.status);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="relative p-8 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 pr-8">
              <Calendar className="w-6 h-6" />
              Event Details
            </h2>
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div
            className="p-8 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 140px)" }}
          >
            <div className="space-y-8">
              {/* Event Image (if available) */}
              {event.image && (
                <div className="rounded-xl overflow-hidden h-64">
                  <img
                    src={`/uploads/events/${event.image.split("/").pop()}`}
                    alt={event.event_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Event Title & Category */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {event.event_name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-base font-medium">
                    {event.category?.categoryName || "Uncategorized"}
                  </span>
                  {event.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <span className="font-semibold text-gray-900 text-lg">
                      Date & Time
                    </span>
                  </div>
                  <p className="text-gray-700 text-base">
                    {formatDateTime(event.event_date)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                    <span className="font-semibold text-gray-900 text-lg">
                      Location
                    </span>
                  </div>
                  <p className="text-gray-700 text-base">
                    {event.location || "Not specified"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-6 h-6 text-indigo-600" />
                    <span className="font-semibold text-gray-900 text-lg">
                      Price
                    </span>
                  </div>
                  <p className="text-gray-700 text-base font-semibold">
                    ${event.price || "0"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <span className="font-semibold text-gray-900 text-lg">
                      Capacity
                    </span>
                  </div>
                  <p className="text-gray-700 text-base">
                    {event.totalSlots || "Unlimited"} slots
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    <span className="font-semibold text-gray-900 text-lg">
                      Duration
                    </span>
                  </div>
                  <p className="text-gray-700 text-base">
                    {event.duration || "Not specified"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-6 h-6 text-indigo-600" />
                    <span className="font-semibold text-gray-900 text-lg">
                      Event Type
                    </span>
                  </div>
                  <p className="text-gray-700 text-base capitalize">
                    {event.eventType || "Physical"}
                  </p>
                </div>
              </div>

              {/* Organizer Information */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
                <h4 className="font-semibold text-gray-900 text-xl mb-4 flex items-center gap-2">
                  <UserCircle className="w-6 h-6 text-orange-600" />
                  Organizer Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {event.organizer?.name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {event.organizer?.email || "Not provided"}
                    </p>
                  </div>
                  {event.organizer?.phone && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-900 text-lg">
                        {event.organizer.phone}
                      </p>
                    </div>
                  )}
                  {event.organizer?.company && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Company</p>
                      <p className="font-medium text-gray-900 text-lg">
                        {event.organizer.company}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 text-xl mb-3 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-gray-600" />
                  Description
                </h4>
                <p className="text-gray-700 bg-gray-50 p-6 rounded-xl text-base leading-relaxed">
                  {event.description || "No description provided"}
                </p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.registrationDeadline && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm text-gray-500 mb-2">
                      Registration Deadline
                    </p>
                    <p className="font-medium text-gray-900 text-lg">
                      {formatDateTime(event.registrationDeadline)}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-sm text-gray-500 mb-2">Current Status</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${statusInfo.dot}`} />
                    <span
                      className={`px-4 py-2 rounded-full text-base font-medium ${statusInfo.bg} ${statusInfo.text}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-sm text-gray-500 mb-2">Created At</p>
                  <p className="font-medium text-gray-900 text-lg">
                    {formatDateTime(event.createdAt)}
                  </p>
                </div>
                {event.updatedAt && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm text-gray-500 mb-2">Last Updated</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {formatDateTime(event.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Event Details Modal */}
      {showEventDetails && (
        <EventDetailsModal event={selectedEvent} onClose={closeModal} />
      )}

      {/* Error Alert */}
      {error && (
        <div className="relative p-6 pl-16 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-6 top-6">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div className="pr-12">
            <h4 className="font-bold text-red-800 text-lg mb-1">
              Action Required
            </h4>
            <p className="text-base text-red-600">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Close error"
          >
            <XCircle className="w-6 h-6 text-red-500" />
          </button>
        </div>
      )}

      {/* Header with Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <CalendarDays className="w-7 h-7 text-white" />
                </div>
                Event Management Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Review and manage pending event submissions from organizers
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className={`mt-4 md:mt-0 px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 text-base ${
                isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Refresh Data
                </>
              )}
            </button>
          </div>

          {/* Stats Cards - Now using real dashboard data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <BarChart3 className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2">
                {stats.pending}
              </h3>
              <p className="text-gray-600 font-medium text-lg">
                Pending Review
              </p>
              <div className="mt-4 h-3 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width:
                      stats.total > 0
                        ? `${(stats.pending / stats.total) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2">
                {stats.approved}
              </h3>
              <p className="text-gray-600 font-medium text-lg">Live Events</p>
              <div className="mt-4 h-3 bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{
                    width:
                      stats.total > 0
                        ? `${(stats.approved / stats.total) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-xl p-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2">
                {stats.rejected}
              </h3>
              <p className="text-gray-600 font-medium text-lg">Rejected</p>
              <div className="mt-4 h-3 bg-rose-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width:
                      stats.total > 0
                        ? `${(stats.rejected / stats.total) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-8 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-2">
                {stats.total}
              </h3>
              <p className="text-gray-600 font-medium text-lg">Total Events</p>
              <div className="mt-4 h-3 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Filter className="w-6 h-6 text-indigo-600" />
                Pending Review Events
              </h2>
              <p className="text-gray-600 text-base mt-1">
                {filteredEvents.length} events found
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-base"
                />
              </div>

              {/* Export Buttons */}
              <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                <Printer className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Events Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            {currentItems.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300">
                        <th className="py-5 pl-8 text-left font-bold text-gray-800 text-base uppercase tracking-wider">
                          <button
                            onClick={() => requestSort("event_name")}
                            className="flex items-center gap-2 hover:text-indigo-700 transition-colors"
                          >
                            Event Details
                            {sortConfig.key === "event_name" && (
                              <span>
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                        </th>
                        <th className="py-5 text-left font-bold text-gray-800 text-base uppercase tracking-wider">
                          <button
                            onClick={() => requestSort("organizer")}
                            className="flex items-center gap-2 hover:text-indigo-700 transition-colors"
                          >
                            Organizer
                            {sortConfig.key === "organizer" && (
                              <span>
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                        </th>
                        <th className="py-5 text-left font-bold text-gray-800 text-base uppercase tracking-wider">
                          <button
                            onClick={() => requestSort("event_date")}
                            className="flex items-center gap-2 hover:text-indigo-700 transition-colors"
                          >
                            Date & Time
                            {sortConfig.key === "event_date" && (
                              <span>
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                        </th>
                        <th className="py-5 text-left font-bold text-gray-800 text-base uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-5 pr-8 text-left font-bold text-gray-800 text-base uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((event) => {
                        const statusStyles = {
                          pending: {
                            dot: "bg-amber-500",
                            bg: "bg-gradient-to-r from-amber-100 to-yellow-100",
                            text: "text-amber-700",
                          },
                          rejected: {
                            dot: "bg-rose-500",
                            bg: "bg-gradient-to-r from-rose-100 to-pink-100",
                            text: "text-rose-700",
                          },
                        };
                        const style = statusStyles[event.status] || {
                          dot: "bg-gray-500",
                          bg: "bg-gray-100",
                          text: "text-gray-700",
                        };

                        return (
                          <tr
                            key={event._id}
                            className="group border-b border-gray-200 hover:bg-gradient-to-r hover:from-indigo-50/70 hover:to-purple-50/70 transition-all duration-300"
                          >
                            <td className="py-6 pl-8">
                              <div className="flex items-start gap-5">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <Calendar className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">
                                    {event.event_name}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <span className="px-4 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                                      {event.category?.categoryName ||
                                        "Uncategorized"}
                                    </span>
                                    {event.location && (
                                      <div className="flex items-center gap-1.5 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">
                                          {event.location.length > 25
                                            ? `${event.location.substring(
                                                0,
                                                25
                                              )}...`
                                            : event.location}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center shadow-md">
                                  <UserCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-base">
                                    {event.organizer?.name || "Unknown"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {event.organizer?.email?.length > 25
                                      ? `${event.organizer.email.substring(
                                          0,
                                          25
                                        )}...`
                                      : event.organizer?.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-indigo-500" />
                                  <span className="font-medium text-gray-900 text-base">
                                    {formatDate(event.event_date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-gray-400" />
                                  <span className="text-gray-600 text-base">
                                    {formatTime(event.event_date)}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-6">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full ${style.dot}`}
                                />
                                <span
                                  className={`px-4 py-2 rounded-full text-base font-medium ${style.bg} ${style.text}`}
                                >
                                  {event.status?.charAt(0).toUpperCase() +
                                    event.status?.slice(1) || "Pending"}
                                </span>
                              </div>
                            </td>
                            <td className="py-6 pr-8">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => viewEventDetailsModal(event)}
                                  className="group/view p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                                  title="View Details"
                                >
                                  <Eye className="w-6 h-6 text-blue-600 group-hover/view:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleEventAction(event._id, "approve")
                                  }
                                  disabled={isLoading}
                                  className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 text-sm ${
                                    isLoading
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg hover:scale-105"
                                  }`}
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleEventAction(event._id, "reject")
                                  }
                                  disabled={isLoading}
                                  className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 text-sm ${
                                    isLoading
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-md hover:shadow-lg hover:scale-105"
                                  }`}
                                >
                                  <XCircle className="w-5 h-5" />
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-gray-600 text-base">
                    Showing{" "}
                    <span className="font-semibold">
                      {indexOfFirstItem + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(indexOfLastItem, sortedEvents.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">{sortedEvents.length}</span>{" "}
                    events
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-12 h-12 rounded-xl font-semibold text-base transition-all ${
                          currentPage === i + 1
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Calendar className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  No Pending Events
                </h3>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                  {searchTerm
                    ? `No events matching "${searchTerm}"`
                    : "All events have been reviewed. Check back later for new submissions."}
                </p>
                <button
                  onClick={fetchData}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-3 mx-auto text-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  Check for New Events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsManagement;
