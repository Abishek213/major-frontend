import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Use alias import

const TopEvents = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { user } = useAuth();

  const events = [
    {
      id: 1,
      name: "Music Festival",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=500&fit=crop",
      aiRecommended: user, // AI recommends to logged-in users
      aiInsight: "Based on your music streaming history"
    },
    {
      id: 2,
      name: "Tech Conference",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
      aiRecommended: user,
      aiInsight: "Matches your professional interests"
    },
    {
      id: 3,
      name: "Art Exhibition",
      image: "https://images.unsplash.com/photo-1536922246289-88c42f957773?w=800&h=500&fit=crop",
      trending: true
    },
    {
      id: 4,
      name: "Food Festival",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop",
      trending: true
    },
    {
      id: 5,
      name: "Sports Tournament",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop",
      aiRecommended: user,
      aiInsight: "Based on your fitness app activity"
    }
  ];

  const handleScroll = (direction) => {
    const container = document.getElementById('events-scroll');
    if (container) {
      const scrollAmount = 380;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Events Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Top Events Happening Worldwide</h2>
              <p className="text-gray-600 mt-2">
                {user ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI-enhanced recommendations based on your profile
                  </span>
                ) : (
                  "Discover trending events globally"
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>AI Personalization Active</span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleScroll('left')}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Event Cards */}
          <div
            id="events-scroll"
            className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((event) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-[360px] h-[240px] rounded-2xl overflow-hidden relative cursor-pointer group"
              >
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* AI Badge */}
                {event.aiRecommended && user && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      For You
                    </span>
                  </div>
                )}
                
                {/* Trending Badge */}
                {event.trending && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-4xl font-bold text-white mb-2">{event.name}</h3>
                  
                  {/* AI Insight */}
                  {event.aiInsight && user && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-purple-300" />
                      </div>
                      <p className="text-sm text-purple-200">{event.aiInsight}</p>
                    </div>
                  )}
                  
                  <button className="inline-flex items-center gap-2 text-white hover:text-blue-200 font-medium text-sm transition-colors">
                    Explore Event
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Progress bar indicator */}
                {event.id === 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-400/30">
                    <div className="h-full w-1/5 bg-blue-500"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* AI Personalization Note */}
          {user && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">AI Insight:</span> Your recommendations are personalized based on 
                    browsing history, past bookings, and stated preferences. 
                    <button className="ml-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
                      Adjust preferences
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopEvents;