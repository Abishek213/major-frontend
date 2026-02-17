// AI Configuration with Comprehensive Agent Settings
export const aiConfig = {
  // Enable/disable AI features
  enabled: true,
  
  // Development mode settings
  development: {
    useMockData: import.meta.env.MODE === 'development',
    mockDelay: 1000, // Simulate API delay in ms
    logLevel: 'debug', // debug, info, warn, error
    enableMockResponses: true,
  },
  
  // Production settings
  production: {
    useMockData: false,
    logLevel: 'error',
    cacheResponses: true,
    cacheTTL: 300000, // 5 minutes
  },
  
  // API endpoints
  endpoints: {
    // Base endpoints
    base: '/api/v1/ai',
    
    // Recommendations
    recommendations: '/ai/recommendations',
    personalized: '/ai/recommendations/personalized',
    similar: '/ai/recommendations/similar',
    trending: '/ai/recommendations/trending',
    
    // Chat & Support
    chat: '/ai/chat',
    chatStream: '/ai/chat/stream', // WebSocket for real-time
    faq: '/ai/faq',
    faqSearch: '/ai/faq/search',
    
    // Event Request & Planning
    eventRequest: '/ai/event-request',
    eventAnalysis: '/ai/event-analysis',
    priceSuggestion: '/ai/price-suggestion',
    tagRecommendation: '/ai/tag-recommendations',
    slotSuggestion: '/ai/slot-suggestion',
    dateOptimization: '/ai/date-optimization',
    
    // Negotiation
    negotiation: '/ai/negotiation',
    competitorAnalysis: '/ai/competitor-analysis',
    offerPrediction: '/ai/offer-prediction',
    
    // Admin & Analytics
    fraudDetection: '/ai/fraud-detection',
    fraudAnalysis: '/ai/fraud-analysis',
    platformAnalytics: '/ai/analytics/platform',
    trendAnalysis: '/ai/analytics/trends',
    cohortAnalysis: '/ai/analytics/cohorts',
    sentimentAnalysis: '/ai/analytics/sentiment',
    
    // Organizer Dashboard
    organizerMetrics: '/ai/organizer/metrics',
    eventPerformance: '/ai/organizer/performance',
    organizerInsights: '/ai/organizer/insights',
    
    // WebSocket endpoints
    websocket: {
      chat: '/ws/ai/chat',
      fraud: '/ws/ai/fraud-monitoring',
      analytics: '/ws/ai/analytics-stream',
    }
  },
  
  // AI Agent configurations with detailed settings
  agents: {
    // Admin Agents
    fraud: {
      id: 'fraud-agent',
      name: 'Fraud Detection Agent',
      type: 'admin',
      description: 'Real-time fraud monitoring and threat detection for bookings and transactions',
      tools: ['LangChain', 'TensorFlow', 'MongoDB', 'Redis'],
      models: ['anomaly-detection-v2', 'risk-scoring-v1'],
      capabilities: [
        'Real-time transaction monitoring',
        'Risk score calculation (0-1)',
        'Pattern anomaly detection',
        'Automated blocking (risk > 0.8)',
        'IP geolocation validation',
        'Payment method verification',
        'Velocity checking',
        'Historical pattern analysis'
      ],
      settings: {
        enabled: true,
        riskThreshold: 0.7,
        autoBlock: true,
        sensitivity: 'medium', // low, medium, high
        alertOnSuspicious: true,
        maxAlertsPerDay: 100,
        scanFrequency: 'realtime', // realtime, batch, scheduled
        retentionPeriod: 90, // days
        confidenceThreshold: 0.85,
      },
      endpoints: {
        analyze: '/fraud/analyze',
        check: '/fraud/check',
        alert: '/fraud/alerts',
        block: '/fraud/block',
      },
      performance: {
        avgResponseTime: 150, // ms
        accuracy: 0.94,
        falsePositiveRate: 0.03,
      }
    },
    
    analytics: {
      id: 'analytics-agent',
      name: 'Analytics & Insights Agent',
      type: 'admin',
      description: 'Platform-wide data analysis, trend reporting, and predictive analytics',
      tools: ['LangChain', 'Python', 'Pandas', 'Scikit-learn', 'MongoDB'],
      models: ['predictive-v3', 'trend-analysis-v2', 'cohort-analysis-v1'],
      capabilities: [
        'Platform-wide metrics aggregation',
        'Trend analysis and forecasting',
        'Cohort retention analysis',
        'Revenue prediction',
        'Category trend tracking',
        'User behavior analysis',
        'Performance benchmarking',
        'Visualization generation'
      ],
      settings: {
        enabled: true,
        predictionConfidence: 0.8,
        generateReports: true,
        reportFrequency: 'daily', // hourly, daily, weekly, monthly
        trackTrends: true,
        trendWindow: '30d', // 7d, 30d, 90d, 1y
        exportData: true,
        cacheResults: true,
        cacheTTL: 3600000, // 1 hour
      },
      endpoints: {
        metrics: '/analytics/metrics',
        trends: '/analytics/trends',
        cohorts: '/analytics/cohorts',
        predict: '/analytics/predict',
        report: '/analytics/report',
      },
      performance: {
        avgResponseTime: 500, // ms
        predictionAccuracy: 0.87,
        dataFreshness: '5m', // 5 minutes
      }
    },
    
    sentiment: {
      id: 'sentiment-agent',
      name: 'Feedback Sentiment Agent',
      type: 'admin',
      description: 'Analyzes review sentiment, detects toxicity, and generates actionable insights',
      tools: ['LangChain', 'NLTK', 'Transformers', 'ChromaDB'],
      models: ['sentiment-bert-v2', 'toxicity-detector-v1', 'keyword-extractor-v2'],
      capabilities: [
        'Sentiment scoring (-1 to 1)',
        'Emotion detection',
        'Toxicity analysis',
        'Keyword extraction',
        'Trend identification',
        'Actionable insight generation',
        'Content moderation',
        'Review summarization'
      ],
      settings: {
        enabled: true,
        analyzeReviews: true,
        detectToxicity: true,
        autoModerate: false,
        toxicityThreshold: 0.7,
        generateInsights: true,
        insightFrequency: 'weekly', // daily, weekly, monthly
        sentimentThresholds: {
          veryPositive: 0.7,
          positive: 0.3,
          neutral: 0,
          negative: -0.3,
          veryNegative: -0.7
        },
      },
      endpoints: {
        analyze: '/sentiment/analyze',
        review: '/sentiment/review',
        toxicity: '/sentiment/toxicity',
        insights: '/sentiment/insights',
      },
      performance: {
        avgResponseTime: 200, // ms
        sentimentAccuracy: 0.91,
        toxicityPrecision: 0.89,
      }
    },
    
    // Organizer Agents
    planning: {
      id: 'planning-agent',
      name: 'Event Planning Agent',
      type: 'organizer',
      description: 'Assists with event creation, optimization, and best practices',
      tools: ['LangChain', 'Ollama', 'MongoDB', 'Redis'],
      models: ['pricing-optimizer-v2', 'tag-recommender-v3', 'capacity-planner-v1'],
      capabilities: [
        'Dynamic price optimization',
        'Smart tag recommendations',
        'Capacity planning',
        'Date/time optimization',
        'Category trend analysis',
        'Location-based suggestions',
        'Event description enhancement',
        'Competitive analysis'
      ],
      settings: {
        enabled: true,
        priceSuggestions: true,
        tagRecommendations: true,
        capacityPlanning: true,
        dateOptimization: true,
        descriptionEnhancement: true,
        competitorAnalysis: true,
        maxSuggestions: 5,
        marketDataRefresh: 86400000, // 24 hours
      },
      endpoints: {
        price: '/planning/price',
        tags: '/planning/tags',
        capacity: '/planning/capacity',
        date: '/planning/date',
        enhance: '/planning/enhance',
      },
      performance: {
        avgResponseTime: 300, // ms
        priceAccuracy: 0.88,
        tagRelevance: 0.92,
      }
    },
    
    negotiation: {
      id: 'negotiation-agent',
      name: 'Negotiation Agent',
      type: 'organizer',
      description: 'Manages event requests, bidding, and negotiation strategies',
      tools: ['LangChain', 'Game Theory Models', 'MongoDB'],
      models: ['bid-optimizer-v2', 'win-probability-v3', 'competitor-analyzer-v1'],
      capabilities: [
        'Win probability calculation',
        'Competitive offer analysis',
        'Bid optimization',
        'Negotiation strategy recommendations',
        'Market rate analysis',
        'Counter-offer suggestions',
        'Deal tracking',
        'Success prediction'
      ],
      settings: {
        enabled: true,
        competitorAnalysis: true,
        winProbability: true,
        counterOfferSuggestions: true,
        maxOffersPerRequest: 3,
        priceRangeBuffer: 0.2, // 20% range
        alertOnStatusChange: true,
      },
      endpoints: {
        analyze: '/negotiation/analyze',
        bid: '/negotiation/bid',
        competitors: '/negotiation/competitors',
        probability: '/negotiation/probability',
      },
      performance: {
        avgResponseTime: 250, // ms
        predictionAccuracy: 0.82,
        successRate: 0.76,
      }
    },
    
    dashboard: {
      id: 'dashboard-agent',
      name: 'Organizer Dashboard Agent',
      type: 'organizer',
      description: 'Provides real-time insights and analytics for organizer events',
      tools: ['LangChain', 'Python', 'MongoDB', 'Redis'],
      models: ['metrics-aggregator-v2', 'performance-analyzer-v1'],
      capabilities: [
        'Real-time metric aggregation',
        'Event performance tracking',
        'Revenue analytics',
        'Attendance forecasting',
        'Sentiment integration',
        'Benchmark comparison',
        'Trend visualization',
        'Actionable insights'
      ],
      settings: {
        enabled: true,
        realtimeUpdates: true,
        refreshInterval: 300000, // 5 minutes
        showPredictions: true,
        exportEnabled: true,
        metricCategories: ['revenue', 'attendance', 'engagement', 'satisfaction'],
        defaultTimeframe: 'month', // week, month, quarter, year
      },
      endpoints: {
        metrics: '/dashboard/metrics',
        performance: '/dashboard/performance',
        insights: '/dashboard/insights',
        forecast: '/dashboard/forecast',
      },
      performance: {
        avgResponseTime: 200, // ms
        dataFreshness: '1m', // 1 minute
      }
    },
    
    // User Agents
    recommendations: {
      id: 'recommendations-agent',
      name: 'Personalized Recommendation Agent',
      type: 'user',
      description: 'Suggests events based on user behavior, preferences, and trends',
      tools: ['LangChain', 'TensorFlow', 'MongoDB', 'Redis'],
      models: ['collaborative-filtering-v3', 'content-based-v2', 'hybrid-recommender-v4'],
      capabilities: [
        'Personalized event suggestions',
        'Similar event discovery',
        'Trend-based recommendations',
        'Category preferences',
        'Location-based suggestions',
        'Time-based optimization',
        'Social graph integration',
        'Cold-start handling'
      ],
      settings: {
        enabled: true,
        maxRecommendations: 20,
        refreshInterval: 3600000, // 1 hour
        diversityFactor: 0.3,
        popularityBias: 0.2,
        recencyWeight: 0.3,
        locationWeight: 0.4,
        categoryWeight: 0.5,
        useCollaborativeFiltering: true,
        useContentBased: true,
        useHybridModel: true,
      },
      endpoints: {
        get: '/recommendations',
        similar: '/recommendations/similar',
        trending: '/recommendations/trending',
        refresh: '/recommendations/refresh',
        feedback: '/recommendations/feedback',
      },
      performance: {
        avgResponseTime: 400, // ms
        precision: 0.85,
        recall: 0.78,
        coverage: 0.92,
      }
    },
    
    assistant: {
      id: 'assistant-agent',
      name: 'General AI Assistant',
      type: 'user',
      description: 'Handles general queries, FAQs, and routes to specialized agents',
      tools: ['LangChain', 'ChromaDB', 'OpenAI/Ollama', 'Redis'],
      models: ['chat-v3', 'faq-embeddings-v2', 'intent-classifier-v4'],
      capabilities: [
        'Natural language understanding',
        'Multi-language support',
        'FAQ answering',
        'Intent classification',
        'Context management',
        'Document processing',
        'Sentiment detection',
        'Agent routing'
      ],
      settings: {
        enabled: true,
        supportedLanguages: ['en', 'es', 'fr', 'de', 'hi', 'ne', 'zh', 'ja'],
        defaultLanguage: 'en',
        responseTimeout: 30000, // 30 seconds
        maxContextLength: 10,
        useStreaming: true,
        enableFileUpload: true,
        maxFileSize: 10485760, // 10MB
        supportedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
        autoDetectLanguage: true,
        showConfidenceScores: true,
      },
      endpoints: {
        chat: '/assistant/chat',
        stream: '/assistant/stream',
        faq: '/assistant/faq',
        upload: '/assistant/upload',
        intent: '/assistant/intent',
      },
      performance: {
        avgResponseTime: 350, // ms
        intentAccuracy: 0.93,
        languageSupport: 8,
        concurrentSessions: 1000,
      }
    }
  },
  
  // Model configurations
  models: {
    // Embedding models
    embeddings: {
      provider: 'openai', // openai, ollama, huggingface
      model: 'text-embedding-3-small',
      dimensions: 1536,
      maxTokens: 8191,
    },
    
    // Chat models
    chat: {
      provider: 'ollama', // openai, ollama, anthropic
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
    },
    
    // Recommendation models
    recommendation: {
      provider: 'hybrid',
      algorithms: ['collaborative', 'content', 'popularity'],
      weights: {
        collaborative: 0.4,
        content: 0.3,
        popularity: 0.3,
      },
    },
    
    // Fraud detection models
    fraud: {
      provider: 'tensorflow',
      model: 'anomaly-detection-v2',
      threshold: 0.7,
      features: ['velocity', 'location', 'amount', 'history', 'device'],
    },
    
    // Sentiment analysis models
    sentiment: {
      provider: 'transformers',
      model: 'bert-base-uncased',
      labels: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'],
    }
  },
  
  // Vector database settings
  vectorDB: {
    provider: 'chromadb',
    collection: 'event-embeddings',
    distance: 'cosine',
    maxResults: 20,
    similarityThreshold: 0.7,
    persistDirectory: './data/chromadb',
  },
  
  // Cache settings
  cache: {
    enabled: true,
    provider: 'redis',
    ttl: {
      recommendations: 3600, // 1 hour
      analytics: 300, // 5 minutes
      faq: 86400, // 24 hours
      userPreferences: 604800, // 7 days
    },
    maxSize: 1000, // MB
  },
  
  // User preferences
  defaultPreferences: {
    categories: [],
    priceRange: { min: 0, max: 1000 },
    location: '',
    dateRange: null,
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
    privacySettings: {
      shareData: true,
      allowPersonalization: true,
    }
  },
  
  // UI settings
  ui: {
    showAIBadges: true,
    enableAIToggle: true,
    showAIInsights: true,
    showConfidenceScores: true,
    animationDuration: 300,
    badgeVariants: ['default', 'outline', 'ghost'],
    insightDisplay: 'hover', // hover, always, click
    maxVisibleAgents: 5,
  },
  
  // Rate limiting
  rateLimiting: {
    enabled: true,
    maxRequests: {
      user: 100, // per hour
      organizer: 500, // per hour
      admin: 1000, // per hour
    },
    windowMs: 3600000, // 1 hour
  },
  
  // Logging
  logging: {
    level: import.meta.env.MODE === 'development' ? 'debug' : 'error',
    format: 'json',
    destination: 'console',
    includeTimestamp: true,
    includeUserContext: false,
  },
  
  // Feature flags
  features: {
    realtimeUpdates: true,
    streamingChat: true,
    fileUpload: true,
    voiceInput: false,
    webhookIntegrations: true,
    exportReports: true,
    scheduledReports: true,
  }
};

// Helper function to check if AI features should be enabled
export const shouldEnableAI = () => {
  return aiConfig.enabled && (import.meta.env.MODE === 'development' || process.env.NODE_ENV === 'production');
};

// Get mock data based on environment and agent type
export const getMockData = (type, agentType = null) => {
  if (!aiConfig.development.useMockData) return null;
  
  const mockData = {
    // Recommendations
    recommendations: {
      user: [
        {
          id: 101,
          title: "Tech Networking: AI & ML Summit",
          category: "Technology",
          date: "Fri, Jan 15",
          time: "6:00 PM",
          location: "Tech Hub Center, San Francisco",
          price: 25.00,
          originalPrice: 45.00,
          tags: ["ai", "networking", "tech"],
          image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop",
          aiReason: "Matches your interest in technology events",
          matchScore: 95,
          confidence: 94,
          matchReasons: [
            "You attended 3 tech events last month",
            "Similar to events you've liked",
            "Popular among your network"
          ]
        },
        {
          id: 102,
          title: "Advanced JavaScript Workshop",
          category: "Education",
          date: "Sat, Jan 16",
          time: "10:00 AM",
          location: "Online",
          price: 49.99,
          originalPrice: 79.99,
          tags: ["javascript", "programming", "workshop"],
          image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&h=300&fit=crop",
          aiReason: "Based on your past workshop attendance",
          matchScore: 88,
          confidence: 82,
          matchReasons: [
            "You completed JavaScript basics course",
            "Preferred online events",
            "Early bird discount available"
          ]
        }
      ],
      similar: [],
      trending: []
    },
    
    // Fraud detection
    fraud: {
      alerts: [
        {
          id: 1,
          type: 'Multiple Failed Logins',
          severity: 'high',
          description: '10 failed login attempts in 5 minutes',
          riskScore: 0.94,
          confidence: 94,
          recommendedAction: 'Block IP and notify user'
        },
        {
          id: 2,
          type: 'Suspicious Purchase Pattern',
          severity: 'medium',
          description: 'Bulk ticket purchase with multiple cards',
          riskScore: 0.76,
          confidence: 76,
          recommendedAction: 'Verify with user'
        }
      ],
      stats: {
        riskLevel: 'medium',
        blockedToday: 23,
        activeAlerts: 8,
        falsePositives: 3
      }
    },
    
    // Analytics
    analytics: {
      metrics: {
        totalUsers: 15234,
        totalEvents: 2341,
        totalBookings: 12456,
        totalRevenue: 456789
      },
      trends: [
        { name: 'Virtual Events', growth: 45 },
        { name: 'Tech Conferences', growth: 32 },
        { name: 'Workshops', growth: 28 }
      ]
    },
    
    // Sentiment
    sentiment: {
      overall: 0.78,
      distribution: {
        positive: 65,
        neutral: 25,
        negative: 10
      },
      keywords: ['great', 'organized', 'fun', 'expensive', 'parking']
    },
    
    // Planning
    planning: {
      priceSuggestion: {
        suggested: 45,
        range: { min: 35, max: 60 },
        confidence: 88
      },
      tags: ['tech', 'networking', 'workshop', 'ai'],
      capacity: {
        suggested: 100,
        reason: 'Based on similar events in your area'
      }
    },
    
    // Negotiation
    negotiation: {
      winProbability: 75,
      competitorCount: 3,
      suggestedPrice: 1500,
      marketAverage: 1650
    },
    
    // Chat
    chat: {
      responses: {
        en: "I can help you with that! Let me analyze your request...",
        es: "¡Puedo ayudarte con eso! Déjame analizar tu solicitud...",
        fr: "Je peux vous aider avec ça ! Laissez-moi analyser votre demande..."
      },
      intents: ['booking', 'faq', 'support', 'complaint']
    },
    
    // FAQs
    faqs: [
      {
        question: "How do I book an event?",
        answer: "You can book an event by browsing our events page and clicking 'Book Now' on your chosen event.",
        category: "booking",
        confidence: 0.98
      },
      {
        question: "What's the cancellation policy?",
        answer: "Cancellation policies vary by event. Check the event details page for specific information.",
        category: "policy",
        confidence: 0.95
      }
    ],
    
    // Organizers
    organizers: [
      {
        id: 1,
        name: "Tech Events Inc.",
        category: "Technology",
        rating: 4.8,
        eventsCount: 45,
        matchScore: 92
      },
      {
        id: 2,
        name: "Music Festivals Co.",
        category: "Music",
        rating: 4.9,
        eventsCount: 67,
        matchScore: 88
      }
    ]
  };
  
  if (agentType && mockData[type]?.[agentType]) {
    return mockData[type][agentType];
  }
  
  return mockData[type] || null;
};

// Get agent configuration by type
export const getAgentConfig = (agentType) => {
  return aiConfig.agents[agentType] || null;
};

// Check if agent is enabled
export const isAgentEnabled = (agentType) => {
  const agent = aiConfig.agents[agentType];
  return agent && agent.settings.enabled && aiConfig.enabled;
};

// Get all enabled agents
export const getEnabledAgents = () => {
  return Object.entries(aiConfig.agents)
    .filter(([_, agent]) => agent.settings.enabled)
    .map(([type, agent]) => ({ type, ...agent }));
};

// Get agents by type (admin, organizer, user)
export const getAgentsByType = (type) => {
  return Object.entries(aiConfig.agents)
    .filter(([_, agent]) => agent.type === type)
    .map(([agentType, agent]) => ({ type: agentType, ...agent }));
};

// Get API endpoint for specific agent and action
export const getAgentEndpoint = (agentType, action) => {
  const agent = aiConfig.agents[agentType];
  if (!agent || !agent.endpoints[action]) return null;
  return `${aiConfig.endpoints.base}${agent.endpoints[action]}`;
};

// Get WebSocket endpoint for real-time features
export const getWebSocketEndpoint = (feature) => {
  return aiConfig.endpoints.websocket[feature] || null;
};

export default aiConfig;