import { Sparkles, RefreshCw, Filter, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AILoadingSpinner from './AILoadingSpinner';
import recommendationService from '../../services/recommendationService';

const RecommendationSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState([]); // Fixed: Changed from aiRecommendations to recommendations
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: 'any',
    location: '',
    dateRange: 'anytime'
  });

  const fetchRecommendations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Use the service directly
      const data = await recommendationService.getRecommendations(user.id, filters);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Use mock data in development or on error
      if (import.meta.env.MODE === 'development' || !recommendationService.getMockRecommendations) {
        setRecommendations(recommendationService.getMockRecommendations ? 
          recommendationService.getMockRecommendations() : 
          [
            {
              id: 101,
              title: "AI-Picked: Tech Networking Based on Your Profile",
              category: "AI Recommended",
              date: "Fri, Jan 15",
              time: "6:00 PM",
              location: "Tech Hub Center",
              price: "$25.00",
              promoted: false,
              goingFast: true,
              salesEndSoon: false,
              tags: ["ai-recommended", "today"],
              image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop",
              aiReason: "Matches your interest in technology and networking events"
            },
            {
              id: 102,
              title: "Curated for You: Advanced JavaScript Workshop",
              category: "AI Recommended",
              date: "Sat, Jan 16",
              time: "10:00 AM",
              location: "Online",
              price: "$49.99",
              promoted: false,
              goingFast: false,
              salesEndSoon: true,
              tags: ["ai-recommended", "online"],
              image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&h=300&fit=crop",
              aiReason: "Based on your past programming workshop attendance"
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Apply filters after change
    setTimeout(() => fetchRecommendations(), 500);
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      setRecommendations([]); // Clear recommendations when user logs out
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Recommendations For You</h2>
            <p className="text-sm text-gray-600">
              Personalized events based on your interests and history
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh AI
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              >
                <option value="any">Any Price</option>
                <option value="free">Free Only</option>
                <option value="under50">Under $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="over100">Over $100</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                placeholder="City or Online"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="anytime">Anytime</option>
                <option value="today">Today</option>
                <option value="weekend">This Weekend</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={filters.categories}
                onChange={(e) => handleFilterChange('categories', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="tech">Technology</option>
                <option value="music">Music</option>
                <option value="business">Business</option>
                <option value="arts">Arts</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="py-12">
          <AILoadingSpinner />
          <p className="text-center text-gray-600 mt-4">AI is analyzing your preferences...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    AI Recommended
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                
                <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700 font-medium">🤖 AI Insight</p>
                  <p className="text-sm text-gray-700 mt-1">{event.aiReason}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  <span className="font-medium text-gray-900">{event.price}</span>
                </div>
                
                <button className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI recommendations yet</h3>
          <p className="text-gray-600 mb-6">
            Attend more events to get personalized recommendations
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationSection;