import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useEventRequest } from '@/hooks/useEventRequest';
import AIBadge from '@/components/ai/AIBadge';
import AILoadingSpinner from '@/components/ai/AILoadingSpinner';
import { 
  AlertTriangle, CheckCircle, XCircle, Users, MapPin, Calendar, 
  DollarSign, FileText, MessageSquare, Phone, TrendingUp, Sparkles,
  Plus, ChevronRight, RefreshCw, UserCircle, Clock, Award, Brain,
  Star, ThumbsUp, ThumbsDown, TrendingDown, BarChart3, Mail,
  Globe, Briefcase, Heart, Share2, Filter, SortAsc, Download, Eye,
  Zap, Shield, Bot, Wallet, Smartphone, X  // Add X here
} from 'lucide-react';

const InterestedOrganizers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventRequests, setEventRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState({});
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonList, setComparisonList] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    budget: 'all',
    rating: 'all',
    experience: 'all',
    responseTime: 'all'
  });
  const [sortBy, setSortBy] = useState('matchScore');
  const [showFilters, setShowFilters] = useState(false);
  
  // AI Event Request Hook
  const { 
    processRequest, 
    getRequestStats,
    organizerMatches 
  } = useEventRequest();

  useEffect(() => {
  const fetchEventRequests = async () => {
    try {
      const response = await api.safeGet("/eventrequest/event-requests-for-user");
      
      // Check if response has data
      if (response.data && response.data.eventRequests) {
        setEventRequests(response.data.eventRequests);
      } else {
        setEventRequests([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching event requests:', error);
      
      // Handle 404 gracefully - user has no requests yet
      if (error.status === 404) {
        setEventRequests([]);
        setError(null); // Clear error - this is not an error state
      } else {
        setEventRequests([]);
        // Only set error for non-404 errors
        if (error.status !== 404) {
          setError(error.message || 'Failed to fetch event requests');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  fetchEventRequests();
}, []);

  // AI: Enhance organizers with match scores and insights
  const enhanceOrganizersWithAI = (organizers, eventRequest) => {
    if (!organizers || organizers.length === 0) return [];
    
    return organizers.map((organizer, index) => {
      // Calculate AI match score based on multiple factors
      const matchScore = calculateAIMatchScore(organizer, eventRequest);
      
      // Generate AI insights for each organizer
      const insights = generateOrganizerInsights(organizer, eventRequest, matchScore);
      
      return {
        ...organizer,
        aiMatchScore: matchScore,
        aiInsights: insights,
        aiRecommended: matchScore > 85,
        rank: index + 1,
        strengths: generateStrengths(organizer),
        weaknesses: generateWeaknesses(organizer, matchScore),
        priceCompetitiveness: calculatePriceCompetitiveness(organizer.proposedBudget, eventRequest.budget),
        responseSpeed: calculateResponseSpeed(organizer.responseDate),
        experienceLevel: calculateExperienceLevel(organizer),
        reliabilityScore: calculateReliabilityScore(organizer)
      };
    }).sort((a, b) => b.aiMatchScore - a.aiMatchScore); // Sort by AI match score
  };

  // AI: Calculate match score based on multiple factors
  const calculateAIMatchScore = (organizer, eventRequest) => {
    let score = 70; // Base score
    
    // Budget compatibility (30 points)
    const budgetRatio = organizer.proposedBudget / eventRequest.budget;
    if (budgetRatio <= 1.1) score += 30;
    else if (budgetRatio <= 1.2) score += 20;
    else if (budgetRatio <= 1.3) score += 10;
    else score -= 10;
    
    // Response time (20 points)
    const responseDays = (new Date() - new Date(organizer.responseDate)) / (1000 * 60 * 60 * 24);
    if (responseDays <= 1) score += 20;
    else if (responseDays <= 3) score += 15;
    else if (responseDays <= 7) score += 10;
    else score += 5;
    
    // Experience level (20 points) - mock data
    const experienceScore = Math.floor(Math.random() * 20) + 10;
    score += experienceScore;
    
    // Past performance (15 points) - mock data
    const performanceScore = Math.floor(Math.random() * 15) + 5;
    score += performanceScore;
    
    // Event type expertise (15 points) - mock data
    const expertiseScore = Math.floor(Math.random() * 15) + 5;
    score += expertiseScore;
    
    return Math.min(Math.round(score), 100);
  };

  // AI: Generate personalized insights for each organizer
  const generateOrganizerInsights = (organizer, eventRequest, matchScore) => {
    const insights = [];
    
    if (matchScore > 90) {
      insights.push("🎯 Excellent match - highly recommended");
    } else if (matchScore > 80) {
      insights.push("👍 Good match - meets most requirements");
    } else if (matchScore > 70) {
      insights.push("📊 Average match - consider alternatives");
    } else {
      insights.push("⚠️ Below average match - review carefully");
    }
    
    // Budget insight
    const budgetRatio = organizer.proposedBudget / eventRequest.budget;
    if (budgetRatio <= 1) {
      insights.push(`💰 Within your budget (${Math.round((1 - budgetRatio) * 100)}% under)`);
    } else if (budgetRatio <= 1.1) {
      insights.push(`💰 Slightly above budget (${Math.round((budgetRatio - 1) * 100)}% over)`);
    } else {
      insights.push(`💰 Significantly above budget (${Math.round((budgetRatio - 1) * 100)}% over)`);
    }
    
    // Response time insight
    const responseDays = (new Date() - new Date(organizer.responseDate)) / (1000 * 60 * 60 * 24);
    if (responseDays <= 1) {
      insights.push("⚡ Very fast response time");
    } else if (responseDays <= 3) {
      insights.push("📨 Average response time");
    } else {
      insights.push("🐢 Slow response time");
    }
    
    return insights;
  };

  // AI: Generate organizer strengths
  const generateStrengths = (organizer) => {
    const strengths = [];
    
    // Mock strengths based on organizer data
    if (organizer.proposedBudget < 1000) {
      strengths.push("Competitive pricing");
    }
    if (organizer.message?.length > 100) {
      strengths.push("Detailed proposal");
    }
    if (Math.random() > 0.5) {
      strengths.push("Similar events experience");
    }
    if (Math.random() > 0.5) {
      strengths.push("Quick responder");
    }
    if (Math.random() > 0.5) {
      strengths.push("High satisfaction rate");
    }
    
    return strengths.slice(0, 3);
  };

  // AI: Generate organizer weaknesses
  const generateWeaknesses = (organizer, matchScore) => {
    const weaknesses = [];
    
    if (matchScore < 75) {
      weaknesses.push("Lower match score");
    }
    if (organizer.proposedBudget > 1000) {
      weaknesses.push("Premium pricing");
    }
    if (organizer.message?.length < 50) {
      weaknesses.push("Brief proposal");
    }
    if (Math.random() > 0.7) {
      weaknesses.push("Limited availability");
    }
    
    return weaknesses.slice(0, 2);
  };

  // AI: Calculate price competitiveness
  const calculatePriceCompetitiveness = (proposed, requested) => {
    const ratio = proposed / requested;
    if (ratio <= 0.9) return 'excellent';
    if (ratio <= 1) return 'good';
    if (ratio <= 1.1) return 'fair';
    return 'premium';
  };

  // AI: Calculate response speed
  const calculateResponseSpeed = (responseDate) => {
    const days = (new Date() - new Date(responseDate)) / (1000 * 60 * 60 * 24);
    if (days <= 1) return 'lightning';
    if (days <= 3) return 'fast';
    if (days <= 7) return 'normal';
    return 'slow';
  };

  // AI: Calculate experience level
  const calculateExperienceLevel = (organizer) => {
    // Mock experience level calculation
    const score = Math.floor(Math.random() * 100);
    if (score > 80) return 'expert';
    if (score > 60) return 'experienced';
    if (score > 40) return 'intermediate';
    return 'beginner';
  };

  // AI: Calculate reliability score
  const calculateReliabilityScore = (organizer) => {
    return Math.floor(Math.random() * 30) + 70; // Mock score between 70-100
  };

  // AI: Generate overall insights for the event request
  const generateAIInsights = () => {
    const insights = {};
    
    eventRequests.forEach(request => {
      const totalOrganizers = request.organizers.length;
      const avgMatchScore = request.organizers.reduce((sum, org) => sum + (org.aiMatchScore || 0), 0) / totalOrganizers || 0;
      const topOrganizer = request.organizers[0];
      
      insights[request.eventId] = {
        totalOrganizers,
        avgMatchScore: Math.round(avgMatchScore),
        topMatchScore: topOrganizer?.aiMatchScore || 0,
        topOrganizerName: topOrganizer?.fullname || 'N/A',
        budgetRange: {
          min: Math.min(...request.organizers.map(o => o.proposedBudget), request.budget),
          max: Math.max(...request.organizers.map(o => o.proposedBudget), request.budget),
          average: Math.round(request.organizers.reduce((sum, o) => sum + o.proposedBudget, 0) / totalOrganizers)
        },
        recommendation: getAIRecommendation(request),
        marketInsight: getMarketInsight(request)
      };
    });
    
    setAiInsights(insights);
  };

  // AI: Get recommendation based on all factors
  const getAIRecommendation = (request) => {
    if (request.organizers.length === 0) {
      return "No organizers yet. Consider promoting your request.";
    }
    
    const topOrganizer = request.organizers[0];
    if (topOrganizer.aiMatchScore > 85) {
      return `Strongly recommend ${topOrganizer.fullname} (${topOrganizer.aiMatchScore}% match)`;
    } else if (topOrganizer.aiMatchScore > 75) {
      return `${topOrganizer.fullname} is a good match. Consider comparing options.`;
    } else {
      return "Consider waiting for more organizer responses or adjusting your budget.";
    }
  };

  // AI: Get market insight
  const getMarketInsight = (request) => {
    const avgBudget = request.organizers.reduce((sum, o) => sum + o.proposedBudget, 0) / request.organizers.length || request.budget;
    const ratio = avgBudget / request.budget;
    
    if (ratio < 0.9) {
      return "Market prices are below your budget - good opportunity!";
    } else if (ratio < 1.1) {
      return "Market prices align with your budget";
    } else {
      return "Market prices are above your budget. Consider increasing it.";
    }
  };

  const handleSelectOrganizer = async (eventId, organizerId) => {
    try {
      const response = await api.safePut(
        '/eventrequest/event-request/select-organizer',
        { eventId, organizerId }
      );

      if (response.status >= 200 && response.status < 300) {
        // Track selection for AI learning
        if (user?.id) {
          await api.safePost('/user-interactions', {
            userId: user.id,
            eventId,
            organizerId,
            interactionType: 'select_organizer',
            timestamp: new Date().toISOString()
          });
        }
        
        const updatedResponse = await api.safeGet("/eventrequest/event-requests-for-user");
        setEventRequests(updatedResponse.data.eventRequests);
        setError(null);
      }
    } catch (error) {
      console.error('Error selecting organizer:', error);
      setError(error.message || 'An error occurred while selecting the organizer.');
    }
  };

  const handleCompareOrganizer = (organizer) => {
    if (comparisonList.includes(organizer.organizerId)) {
      setComparisonList(comparisonList.filter(id => id !== organizer.organizerId));
    } else {
      if (comparisonList.length < 3) {
        setComparisonList([...comparisonList, organizer.organizerId]);
      } else {
        setError('You can compare up to 3 organizers at once');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200',
      approved: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200',
      rejected: 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 border border-rose-200',
      deal_done: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
    };
    
    return (
      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusClasses[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getPriceCompetitivenessColor = (level) => {
    switch(level) {
      case 'excellent': return 'text-emerald-600 bg-emerald-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-amber-600 bg-amber-100';
      case 'premium': return 'text-rose-600 bg-rose-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getResponseSpeedColor = (speed) => {
    switch(speed) {
      case 'lightning': return 'text-purple-600 bg-purple-100';
      case 'fast': return 'text-emerald-600 bg-emerald-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'slow': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getExperienceLevelColor = (level) => {
    switch(level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'experienced': return 'text-emerald-600 bg-emerald-100';
      case 'intermediate': return 'text-blue-600 bg-blue-100';
      case 'beginner': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCreateEventRequest = () => {
    navigate('/userdb/eventrequest');
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AILoadingSpinner />
                <p className="text-lg font-medium text-gray-700 mt-4">AI is analyzing organizer matches...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !eventRequests.length) {
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

  if (!eventRequests || eventRequests.length === 0) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  AI-Powered Organizer Matching
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Smart matches based on your event requirements
                </p>
              </div>
              
              <button
                onClick={handleCreateEventRequest}
                className="mt-4 md:mt-0 px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create New Event Request
              </button>
            </div>

            {/* Empty State */}
            <div className="py-16 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Brain className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Event Requests Found</h3>
              <p className="text-gray-500 mb-6">
                Create your first event request and let AI find the perfect organizers for you!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCreateEventRequest}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Event Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Error Alert */}
      {error && (
        <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-fade-in">
          <div className="absolute left-5 top-5">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="pr-10">
            <h4 className="font-bold text-red-800 mb-1">Action Required</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-red-100 transition-colors"
          >
            <XCircle className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                AI Organizer Matching
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Smart rankings based on budget, experience, and reliability
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                  comparisonMode
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Compare ({comparisonList.length}/3)
              </button>
              <button
                onClick={fetchEventRequests}
                className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreateEventRequest}
                className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                New Request
              </button>
            </div>
          </div>

          {/* AI Stats Overview */}
          {eventRequests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <Sparkles className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {eventRequests.reduce((acc, req) => acc + req.organizers.length, 0)}
                </h3>
                <p className="text-gray-600 font-medium">Total Organizer Matches</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <Brain className="w-8 h-8 text-purple-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {eventRequests.filter(req => req.organizers.some(o => o.aiMatchScore > 85)).length}
                </h3>
                <p className="text-gray-600 font-medium">High Match Requests</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <TrendDown className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  ${eventRequests.reduce((acc, req) => acc + (aiInsights[req.eventId]?.budgetRange?.average || 0), 0) / eventRequests.length || 0}
                </h3>
                <p className="text-gray-600 font-medium">Avg. Proposed Budget</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <Zap className="w-8 h-8 text-amber-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {Math.round(eventRequests.reduce((acc, req) => {
                    const fastResponses = req.organizers.filter(o => o.responseSpeed === 'lightning' || o.responseSpeed === 'fast').length;
                    return acc + (fastResponses / req.organizers.length || 0) * 100;
                  }, 0) / eventRequests.length)}%
                </h3>
                <p className="text-gray-600 font-medium">Fast Response Rate</p>
              </div>
            </div>
          )}

          {/* Event Requests List */}
          <div className="space-y-8">
            {eventRequests.map((event) => (
              <div key={event.eventId} className="border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Event Header with AI Insights */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                        <FileText className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-xl font-bold text-gray-800">{event.eventType} Event</h2>
                          {aiInsights[event.eventId]?.topMatchScore > 85 && (
                            <AIBadge score={aiInsights[event.eventId]?.topMatchScore} reason="Top match available" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Request ID: {event.eventId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(event.status)}
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-800">{event.organizers.length} Organizers</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Market Insights */}
                  {aiInsights[event.eventId] && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-900 mb-1">AI Market Insight</p>
                          <p className="text-sm text-gray-700">{aiInsights[event.eventId].marketInsight}</p>
                          <p className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">Recommendation:</span> {aiInsights[event.eventId].recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Venue</p>
                        <p className="font-bold text-gray-800">{event.venue}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-bold text-gray-800">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-bold text-gray-800 text-xl">${event.budget}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg. Match</p>
                        <p className="font-bold text-gray-800 text-xl">{aiInsights[event.eventId]?.avgMatchScore || 0}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Event Description
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  </div>

                  {/* Organizers Section with AI Rankings */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-600" />
                        AI-Ranked Organizers ({event.organizers.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="matchScore">Sort by Match Score</option>
                          <option value="budget">Sort by Budget</option>
                          <option value="responseTime">Sort by Response Time</option>
                          <option value="experience">Sort by Experience</option>
                        </select>
                      </div>
                    </div>
                    
                    {event.organizers.length === 0 ? (
                      <div className="py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-6">
                          <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No organizers have accepted for this event yet.</p>
                        <p className="text-sm text-gray-500 mt-2">AI will notify you as soon as matches are found.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {event.organizers
                          .sort((a, b) => {
                            if (sortBy === 'matchScore') return b.aiMatchScore - a.aiMatchScore;
                            if (sortBy === 'budget') return a.proposedBudget - b.proposedBudget;
                            if (sortBy === 'responseTime') return (a.responseSpeed === 'lightning' ? 1 : 0) - (b.responseSpeed === 'lightning' ? 1 : 0);
                            return 0;
                          })
                          .map((organizer, index) => (
                          <div 
                            key={organizer.organizerId} 
                            className={`group bg-gradient-to-br from-white to-gray-50 border rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 relative ${
                              organizer.aiRecommended ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'
                            }`}
                          >
                            {/* AI Rank Badge */}
                            <div className="absolute -top-3 -left-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                                'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}>
                                #{index + 1}
                              </div>
                            </div>

                            {/* Compare Checkbox */}
                            {comparisonMode && (
                              <div className="absolute top-4 right-4">
                                <input
                                  type="checkbox"
                                  checked={comparisonList.includes(organizer.organizerId)}
                                  onChange={() => handleCompareOrganizer(organizer)}
                                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                              </div>
                            )}

                            <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                  <UserCircle className="w-7 h-7 text-indigo-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-800 text-lg">{organizer.fullname}</h4>
                                    {organizer.aiRecommended && (
                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                        Best Match
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(organizer.status)}
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getExperienceLevelColor(organizer.experienceLevel)}`}>
                                      {organizer.experienceLevel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* AI Match Score */}
                              <div className="text-center">
                                <div className="relative w-16 h-16">
                                  <svg className="w-16 h-16 transform -rotate-90">
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="28"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                      className="text-gray-200"
                                    />
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="28"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                      strokeDasharray={`${2 * Math.PI * 28}`}
                                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - organizer.aiMatchScore / 100)}`}
                                      className={`${
                                        organizer.aiMatchScore > 85 ? 'text-emerald-500' :
                                        organizer.aiMatchScore > 75 ? 'text-blue-500' :
                                        organizer.aiMatchScore > 65 ? 'text-amber-500' :
                                        'text-rose-500'
                                      }`}
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-gray-800">{organizer.aiMatchScore}%</span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">AI Match</p>
                              </div>
                            </div>
                            
                            {/* AI Insights */}
                            <div className="space-y-2 mb-4">
                              {organizer.aiInsights?.map((insight, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  <Sparkles className="w-3 h-3 text-purple-600 mt-0.5" />
                                  <span className="text-gray-700">{insight}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                <div>
                                  <p className="text-xs text-gray-600">Proposed</p>
                                  <p className="font-bold text-gray-800">${organizer.proposedBudget}</p>
                                </div>
                                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${getPriceCompetitivenessColor(organizer.priceCompetitiveness)}`}>
                                  {organizer.priceCompetitiveness}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <div>
                                  <p className="text-xs text-gray-600">Response</p>
                                  <p className="font-bold text-gray-800">{new Date(organizer.responseDate).toLocaleDateString()}</p>
                                </div>
                                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${getResponseSpeedColor(organizer.responseSpeed)}`}>
                                  {organizer.responseSpeed}
                                </span>
                              </div>
                            </div>

                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                                  Strengths
                                </p>
                                <div className="space-y-1">
                                  {organizer.strengths?.map((strength, i) => (
                                    <div key={i} className="flex items-center gap-1 text-xs text-emerald-700">
                                      <CheckCircle className="w-3 h-3" />
                                      {strength}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                                  <ThumbsDown className="w-3 h-3 text-rose-600" />
                                  Considerations
                                </p>
                                <div className="space-y-1">
                                  {organizer.weaknesses?.map((weakness, i) => (
                                    <div key={i} className="flex items-center gap-1 text-xs text-rose-700">
                                      <AlertTriangle className="w-3 h-3" />
                                      {weakness}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-indigo-600" />
                                <p className="text-sm font-medium text-gray-800">Organizer's Proposal</p>
                              </div>
                              <p className="text-sm text-gray-700">{organizer.message}</p>
                            </div>
                            
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleSelectOrganizer(event.eventId, organizer.organizerId)}
                                className="flex-1 group/select py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                              >
                                <CheckCircle className="w-5 h-5 group-hover/select:scale-110 transition-transform" />
                                Select Organizer
                              </button>
                              <button
                                onClick={() => window.location.href = `mailto:${organizer.contact}`}
                                className="px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 hover:from-blue-200 hover:to-cyan-200 shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                <Mail className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {comparisonMode && comparisonList.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-6 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Organizer Comparison
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Compare {comparisonList.length} organizers side by side
                </p>
              </div>
              <button
                onClick={() => {
                  setComparisonMode(false);
                  setComparisonList([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {eventRequests.flatMap(event => 
                  event.organizers
                    .filter(org => comparisonList.includes(org.organizerId))
                    .map((organizer, idx) => (
                      <div key={organizer.organizerId} className="border border-gray-200 rounded-xl p-6">
                        <div className="text-center mb-6">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                            <UserCircle className="w-10 h-10 text-indigo-600" />
                          </div>
                          <h3 className="font-bold text-gray-800">{organizer.fullname}</h3>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(organizer.experienceLevel)}`}>
                            {organizer.experienceLevel}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">AI Match Score</span>
                            <span className={`font-bold ${
                              organizer.aiMatchScore > 85 ? 'text-emerald-600' :
                              organizer.aiMatchScore > 75 ? 'text-blue-600' :
                              'text-amber-600'
                            }`}>
                              {organizer.aiMatchScore}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Proposed Budget</span>
                            <span className="font-bold text-gray-800">${organizer.proposedBudget}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Response Speed</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResponseSpeedColor(organizer.responseSpeed)}`}>
                              {organizer.responseSpeed}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Reliability Score</span>
                            <span className="font-bold text-gray-800">{organizer.reliabilityScore}%</span>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleSelectOrganizer(event.eventId, organizer.organizerId)}
                              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:from-emerald-600 hover:to-green-600 transition"
                            >
                              Select This Organizer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestedOrganizers;