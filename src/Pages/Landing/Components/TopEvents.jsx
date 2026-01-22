import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const TopEvents = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const events = [
    {
      id: 1,
      name: "Music Festival",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=500&fit=crop"
    },
    {
      id: 2,
      name: "Tech Conference",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop"
    },
    {
      id: 3,
      name: "Art Exhibition",
      image: "https://images.unsplash.com/photo-1536922246289-88c42f957773?w=800&h=500&fit=crop"
    },
    {
      id: 4,
      name: "Food Festival",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop"
    },
    {
      id: 5,
      name: "Sports Tournament",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=500&fit=crop"
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Top Events Happening Worldwide</h2>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-4xl font-bold text-white">{event.name}</h3>
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
        </div>
      </div>
    </div>
  );
};

export default TopEvents;