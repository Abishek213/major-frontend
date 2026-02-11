// AI Configuration
export const aiConfig = {
  // Enable/disable AI features
  enabled: true,
  
  // Development mode settings
  development: {
    useMockData: import.meta.env.MODE === 'development',
    mockDelay: 1000, // Simulate API delay in ms
  },
  
  // API endpoints
  endpoints: {
    recommendations: '/ai/recommendations',
    chat: '/ai/chat',
    eventRequest: '/ai/event-request',
    faq: '/ai/faq',
  },
  
  // AI Agent configurations
  agents: {
    recommendation: {
      name: 'Event Recommendation Agent',
      description: 'Uses user history and event tags to suggest events',
      tools: ['LangChain', 'OpenAI/Ollama', 'MongoDB'],
      maxRecommendations: 10,
      refreshInterval: 3600000, // 1 hour in milliseconds
    },
    eventRequest: {
      name: 'Event Request Assistant',
      description: 'Understands natural language requests and matches with organizers',
      tools: ['LangChain/LlamaIndex', 'Named Entity Extraction'],
      maxOrganizerMatches: 5,
    },
    chatSupport: {
      name: 'Booking Support Agent',
      description: 'Answers FAQs and handles multilingual queries 24/7',
      tools: ['LangChain', 'ChromaDB', 'OpenAI'],
      supportedLanguages: ['en', 'es', 'fr', 'hi', 'ne'],
      responseTimeout: 30000, // 30 seconds
    }
  },
  
  // User preferences
  defaultPreferences: {
    categories: [],
    priceRange: { min: 0, max: 1000 },
    location: '',
    dateRange: null,
  },
  
  // UI settings
  ui: {
    showAIBadges: true,
    enableAIToggle: true,
    showAIInsights: true,
    animationDuration: 300,
  }
};

// Helper function to check if AI features should be enabled
export const shouldEnableAI = () => {
  return aiConfig.enabled && (import.meta.env.MODE === 'development' || process.env.NODE_ENV === 'production');
};

// Get mock data based on environment
export const getMockData = (type) => {
  if (!aiConfig.development.useMockData) return null;
  
  const mockData = {
    recommendations: [
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
        aiReason: "Matches your interest in technology and networking events",
        matchScore: 95
      },
      // ... more mock recommendations
    ],
    faqs: [
      // ... mock FAQs
    ],
    organizers: [
      // ... mock organizers
    ]
  };
  
  return mockData[type] || null;
};