import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Updated import statement
import { Calendar, MapPin, DollarSign, User, Mail, Filter, Check, X, Clock, Sparkles, Search } from "lucide-react";


const EventRequest = () => {
  const [eventRequests, setEventRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposedBudget, setProposedBudget] = useState({});

  const handleProposedBudgetChange = (eventId, value) => {
    setProposedBudget((prevState) => ({
      ...prevState,
      [eventId]: value,
    }));
  };

  useEffect(() => {
    const fetchEventRequests = async () => {
      setLoading(true);
      try {
        const url = `http://localhost:4001/api/v1/eventrequest/event-requests${
          filter ? `?eventType=${filter}` : ""
        }`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEventRequests(data);
        } else {
          alert("Failed to fetch event requests. Please try again.");
        }
      } catch (error) {
        alert("Error fetching event requests: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventRequests();
  }, [filter]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter events based on both filter and search term
  const filteredEventRequests = eventRequests.filter(request => {
    const matchesFilter = filter === "" || request.eventType === filter;
    const matchesSearch = searchTerm === "" || 
      request.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.userId?.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleAccept = async (eventId, proposedBudget) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      const decodedToken = jwtDecode(token);
      const organizerId = decodedToken.user?.id;

      if (!organizerId) {
        console.error("Organizer ID is not found in the token.");
        alert("Organizer ID is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:4001/api/v1/eventrequest/event-request/${eventId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizerId,
            proposedBudget,
          }),
        }
      );

      if (response.ok) {
        setEventRequests((prevRequests) =>
          prevRequests.map((request) =>
            request._id === eventId
              ? {
                  ...request,
                  status: "deal_done",
                  interestedOrganizers: request.interestedOrganizers.map((org) =>
                    org.organizerId === organizerId
                      ? { ...org, status: "accepted", proposedBudget }
                      : org
                  ),
                }
              : request
          )
        );
        alert("Event request accepted successfully");
      } else {
        alert("Error accepting event request");
      }
    } catch (error) {
      console.error("Error accepting event request:", error);
      alert("Error accepting event request");
    }
  };

  const handleReject = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      const decodedToken = jwtDecode(token);
      const organizerId = decodedToken.user?.id;

      if (!organizerId) {
        console.error("Organizer ID is not found in the token.");
        alert("Organizer ID is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:4001/api/v1/eventrequest/event-request/${eventId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setEventRequests((prevRequests) =>
          prevRequests
            .map((request) =>
              request._id === eventId
                ? {
                    ...request,
                    status: "open",
                    interestedOrganizers: request.interestedOrganizers.map((org) =>
                      org.organizerId === organizerId
                        ? { ...org, status: "rejected" }
                        : org
                    ),
                  }
                : request
            )
            .filter((request) => request._id !== eventId)
        );
        alert("Event request rejected successfully");
      } else {
        alert("Error rejecting event request");
      }
    } catch (error) {
      console.error("Error rejecting event request:", error);
      alert("Error rejecting event request");
    }
  };

  const getEventTypeIcon = (eventType) => {
    const icons = {
      Wedding: "💒",
      Sports: "⚽",
      Corporate: "🏢",
      Political: "🏛️"
    };
    return icons[eventType] || "🎉";
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      Wedding: "bg-pink-50 border-pink-200",
      Sports: "bg-blue-50 border-blue-200",
      Corporate: "bg-gray-50 border-gray-200",
      Political: "bg-purple-50 border-purple-200"
    };
    return colors[eventType] || "bg-green-50 border-green-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Event Requests
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Manage and respond to incoming event requests</p>
        </div>

        {/* Filter and Search Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <label htmlFor="eventType" className="text-sm font-medium text-gray-700">
                Filter:
              </label>
              <select
                id="eventType"
                value={filter}
                onChange={handleFilterChange}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Events</option>
                <option value="Wedding">💒 Wedding</option>
                <option value="Sports">⚽ Sports</option>
                <option value="Corporate">🏢 Corporate</option>
                <option value="Political">🏛️ Political</option>
              </select>
            </div>
            
            {/* Search */}
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by event type, venue, name, or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading event requests...</p>
            </div>
          </div>
        ) : filteredEventRequests && filteredEventRequests.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEventRequests.map((request) => (
              <div 
                key={request._id} 
                className={`${getEventTypeColor(request.eventType)} rounded-lg border p-4 transition-all duration-300 hover:shadow-lg hover:scale-102 bg-white`}
              >
                {/* Event Header */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">{getEventTypeIcon(request.eventType)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{request.eventType}</h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Request received</span>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <User className="w-4 h-4 text-gray-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Requested by</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {request.userId?.fullname || "Unknown User"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {request.userId?.email || "No email provided"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(request.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="text-sm font-semibold text-gray-800">{request.budget}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Venue</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{request.venue}</p>
                    </div>
                  </div>
                </div>

                {/* Proposed Budget Input */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your Proposed Budget (Optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      id={`proposedBudget-${request._id}`}
                      value={proposedBudget[request._id] || ""}
                      onChange={(e) =>
                        handleProposedBudgetChange(request._id, e.target.value)
                      }
                      placeholder="Enter budget"
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                    onClick={() =>
                      handleAccept(request._id, proposedBudget[request._id] || "")
                    }
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                    onClick={() => handleReject(request._id)}
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto">
              <div className="text-5xl mb-3">📭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Event Requests Found</h3>
              <p className="text-gray-600 text-sm">
                {filter || searchTerm
                  ? "No event requests match your current filter or search criteria." 
                  : "No event requests available at the moment."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRequest;