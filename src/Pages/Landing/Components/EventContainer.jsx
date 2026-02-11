import { Calendar, Clock, MapPin, Flame, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EventContainer = () => {
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'for-you', label: 'For you' },
    { id: 'today', label: 'Today' },
    { id: 'this-weekend', label: 'This weekend' },
    { id: 'online', label: 'Online' },
    { id: 'free', label: 'Free' },
  ];

  const events = [
    {
      id: 1,
      title: "New Year Reset: Guided Stillness Meditation",
      category: "Events in",
      date: "Wed, Jan 7",
      time: "9:45 PM GMT+5:45",
      price: "Free",
      promoted: true,
      goingFast: false,
      salesEndSoon: false,
      tags: ["free", "online"],
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=300&fit=crop"
    },
    {
      id: 2,
      title: "KIS 125: Alumni & Community Celebration in Kathmandu on the 18th of January",
      category: "Events in",
      date: "Sun, Jan 18",
      time: "7:00 PM",
      location: "Kathmandu Guest House",
      price: "Free",
      promoted: false,
      goingFast: true,
      salesEndSoon: false,
      tags: ["free", "today"],
      image: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=500&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Wizards meetup",
      category: "Events in",
      date: "Sat, Jan 10",
      time: "10:00 AM",
      location: "Kathmandu",
      price: "Free",
      promoted: false,
      goingFast: false,
      salesEndSoon: false,
      tags: ["free", "this-weekend"],
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Learn 8 Steps to Bring Your Faith Based Story To Life",
      category: "Events in",
      date: "Monday",
      time: "5:45 AM GMT+5:45",
      price: "From $19.99",
      promoted: true,
      goingFast: false,
      salesEndSoon: true,
      tags: ["online"],
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=300&fit=crop"
    },
    {
      id: 5,
      title: "Tech Startup Networking Event",
      category: "Events in",
      date: "Fri, Jan 15",
      time: "6:00 PM",
      location: "Silicon Valley Hub",
      price: "$25.00",
      promoted: true,
      goingFast: true,
      salesEndSoon: false,
      tags: ["today"],
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop"
    },
    {
      id: 6,
      title: "Yoga & Mindfulness Workshop",
      category: "Events in",
      date: "Sun, Jan 17",
      time: "8:00 AM",
      location: "Central Park",
      price: "Free",
      promoted: false,
      goingFast: false,
      salesEndSoon: false,
      tags: ["free", "this-weekend"],
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop"
    },
    {
      id: 7,
      title: "Digital Marketing Conference 2024",
      category: "Events in",
      date: "Thu, Jan 14",
      time: "9:00 AM",
      location: "Convention Center",
      price: "From $199.99",
      promoted: true,
      goingFast: true,
      salesEndSoon: true,
      tags: ["today"],
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop"
    },
    {
      id: 8,
      title: "Live Jazz Night",
      category: "Events in",
      date: "Sat, Jan 16",
      time: "8:30 PM",
      location: "Blue Note Club",
      price: "$40.00",
      promoted: false,
      goingFast: false,
      salesEndSoon: false,
      tags: ["this-weekend"],
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=300&fit=crop"
    }
  ];

  // Filter events based on active tab
  const filteredEvents = events.filter(event => {
    if (activeTab === 'All') return true;
    if (activeTab === 'For you') return event.promoted;
    if (activeTab === 'Free') return event.price === 'Free' || event.price.toLowerCase().includes('free');
    if (activeTab === 'Online') return event.tags?.includes('online');
    if (activeTab === 'Today') return event.tags?.includes('today');
    if (activeTab === 'This weekend') return event.tags?.includes('this-weekend');
    return true;
  });

  // Handle event card click
  const handleEventClick = (eventId) => {
    navigate('/loginsignup');
  };

  // Handle view details button click
  const handleViewDetailsClick = (eventId, e) => {
    e.stopPropagation();
    navigate('/loginsignup');
  };

  // Handle "View all events" button click
  const handleViewAllEventsClick = () => {
    navigate('/loginsignup');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.label)}
              className={`pb-3 px-1 font-medium whitespace-nowrap transition-colors duration-200 ${activeTab === tab.label
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Header with results count */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Events in</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
          <button 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            onClick={handleViewAllEventsClick}
          >
            View all events →
          </button>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
                onClick={() => handleEventClick(event.id)}
              >
                {/* Event Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Event Details */}
                <div className="p-4">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {event.goingFast && (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                        <Flame className="w-3 h-3" />
                        Going fast
                      </span>
                    )}
                    {event.salesEndSoon && (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Sales end soon
                      </span>
                    )}
                    {event.promoted && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        <TrendingUp className="w-3 h-3" />
                        Promoted
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>

                  {/* Date & Time */}
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {event.date} • {event.time}
                    </span>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="mb-2 flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {event.price}
                    </span>
                    <button 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      onClick={(e) => handleViewDetailsClick(event.id, e)}
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              There are no events matching the "{activeTab}" filter.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setActiveTab('All')}
                className="text-blue-600 hover:text-blue-700 font-medium mr-4"
              >
                View all events
              </button>
              <button
                onClick={() => navigate('/loginsignup')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventContainer;