// Import icons
import { 
  BarChart3, 
  Plus, 
  List, 
  Settings as SettingsIcon,
  Users,
  Users2,
  Calendar,
  Heart, 
  PenSquare,
  Ticket,
  FolderTree,
  Lock,
  Sparkles,
  Brain,
  TrendingUp,
  Bell,
  Shield,
  Globe,
  Zap,
  Award,
  Star,
  Clock,
  MessageSquare,
  Bot,
  FileText,
  Download,
  Share2,
  BookOpen,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Info,
  Layout,
  PieChart,
  Activity,
  Target,
  Flag,
  Briefcase,
  Megaphone,
  BarChart,
  LineChart,
  DollarSign,
  Percent,
  ShieldCheck,
  Eye,
  EyeOff,
  Sliders,
  Palette,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Smartphone,
  Tablet,
  Monitor,
  Database,
  Cloud,
  Server,
  Cpu,
  HardDrive,
  Network,
  Key,
  Fingerprint,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Globe2,
  Languages,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Headphones,
  Headset,
  Speaker,
  Music,
  Radio,
  Podcast,
  Film,
  Clapperboard,
  Tv,
  MonitorPlay,
  MonitorSmartphone,
  Gamepad2,
  Joystick,
  Dices,
  Puzzle,
  Palette as PaletteIcon,
  Brush,
  PenTool,
  Ruler,
  Compass,
  Navigation,
  Map,
  Flag as FlagIcon,
  Mountain,
  TreePine,
  Flower2,
  Leaf,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Waves,
  Thermometer,
  Droplets,
  SunDim,
  MoonStar,
  Stars,
  Sparkle,
  ZapOff,
  AlarmClock,
  Hourglass,
  Timer,
  Watch,
  Sunrise,
  Sunset,
  Coffee,
  Utensils,
  Wine,
  Beer,
  Cake,
  Gift,
  PartyPopper,
  Crown,
  Medal,
  Trophy,
  Badge,
  BadgeCheck,
  BadgeAlert,
  BadgeX,
  BadgeDollarSign,
  BadgePercent,
  BadgeInfo,
  BadgeMinus,
  BadgePlus
} from 'lucide-react';

// Import Organizer components
import Overview from '../Pages/Landing/Organizer/Overview';
import CreateEvent from '../Pages/Landing/Organizer/CreateEvent';
import MyEvents from '../Pages/Landing/Organizer/MyEvents';
import EventRequestorg from '../Pages/Landing/Organizer/EventRequest';

// Import Admin components
import AdminOverview from '../Pages/Landing/Admin/Overview';
import EventsManagement from '../Pages/Landing/Admin/EventsManagement';
import UsersManagement from '../Pages/Landing/Admin/UsersManagement';
import PermissionsManagement from '../Pages/Landing/Admin/PermissionsManagement';
import CategoriesManagement from '../Pages/Landing/Admin/CategoriesManagement';
import Settings from '../Pages/Landing/Admin/Settings';

// Import User components
import UserEvents from '../Pages/Landing/User/UserEvents';
import EventDetails from '../Pages/Landing/User/EventDetail';
import EventRequest from '../Pages/Landing/User/EventRequest';
import InterestedOrganizers from '../Pages/Landing/User/IntrestedOrganizers';
import UserWishlist from '../Pages/Landing/User/UserWishlist';
import UserBookings from '../Pages/Landing/User/UserBookings';
import BookingSuccess from '../Pages/Landing/User/booking/BookingSuccess';
import BookingFailed from '../Pages/Landing/User/booking/BookingFailed';

// Import AI components
import RecommendationSection from '../components/ai/RecommendationSection';
import ChatAssistant from '../components/ai/ChatAssistant';
import FAQViewer from '../components/ai/FAQViewer';
import EventRequestAssistant from '../components/ai/EventRequestAssistant';

// ============================================
// AI-POWERED USER DASHBOARD CONFIGURATION
// ============================================

export const userDashboardConfig = {
  basePath: '/userdb',
  defaultTab: 'events',
  
  // AI Personalization Settings
  aiFeatures: {
    enabled: true,
    smartRecommendations: true,
    personalizedInsights: true,
    eventAssistant: true,
    chatSupport: true,
    priceAlerts: true,
    availabilityAlerts: true,
    smartSearch: true,
    multilingualSupport: true,
    voiceCommands: false, // Coming soon
    arPreview: false, // Coming soon
  },

  // User Dashboard Tabs with AI Enhancements
  tabs: {
    // AI-POWERED EVENTS TAB
    events: {
      title: 'AI Recommended Events',
      description: 'Personalized event recommendations powered by AI',
      component: UserEvents,
      permissions: ['VIEW_USER_EVENTS'],
      icon: Sparkles,
      aiFeatures: {
        smartSorting: true,
        personalizedRanking: true,
        categoryPreferences: true,
        pricePredictions: true,
        popularityScore: true,
        matchPercentage: true
      },
      stats: {
        showEngagement: true,
        showRecommendations: true,
        showPersonalizedTips: true
      }
    },

    // AI-POWERED EVENT REQUEST TAB
    eventrequest: {
      title: 'AI Event Assistant',
      description: 'Describe your event naturally - AI handles the rest',
      component: EventRequest,
      permissions: ['CREATE_EVENT_REQUEST'],
      icon: Bot,
      aiFeatures: {
        naturalLanguageProcessing: true,
        entityExtraction: true,
        smartOrganizerMatching: true,
        budgetOptimization: true,
        deadlineSuggestions: true,
        venueRecommendations: true
      },
      quickActions: [
        { label: 'Wedding Planning', icon: Heart },
        { label: 'Tech Conference', icon: Cpu },
        { label: 'Music Festival', icon: Music },
        { label: 'Workshop', icon: PenTool }
      ]
    },

    // AI-POWERED INTERESTED ORGANIZERS TAB
    interestedorganizers: {
      title: 'AI Organizer Matches',
      description: 'Smart organizer recommendations based on your requirements',
      component: InterestedOrganizers,
      permissions: ['VIEW_INTERESTED_ORGANIZERS'],
      icon: Brain,
      aiFeatures: {
        matchScoring: true,
        reputationAnalysis: true,
        priceComparison: true,
        responseTimePrediction: true,
        successRateCalculation: true,
        automatedNegotiation: false // Coming soon
      },
      insights: {
        showMatchScores: true,
        showComparison: true,
        showRecommendations: true
      }
    },

    // AI-POWERED WISHLIST TAB
    wishlist: {
      title: 'AI Smart Wishlist',
      description: 'Intelligent tracking with price alerts and recommendations',
      component: UserWishlist,
      permissions: ['VIEW_USER_WISHLIST'],
      icon: Heart,
      aiFeatures: {
        priceDropAlerts: true,
        availabilityAlerts: true,
        similarEvents: true,
        bundleDeals: true,
        seasonalRecommendations: true,
        giftSuggestions: true
      },
      notifications: {
        priceDrop: true,
        lastChance: true,
        newSimilar: true,
        soldOut: true
      }
    },

    // AI-POWERED BOOKINGS TAB
    bookings: {
      title: 'AI Booking Analytics',
      description: 'Smart insights and predictions from your booking history',
      component: UserBookings,
      permissions: ['VIEW_USER_BOOKINGS'],
      icon: TrendingUp,
      aiFeatures: {
        spendingAnalysis: true,
        categoryPreferences: true,
        bookingPatterns: true,
        nextBookingPrediction: true,
        loyaltyInsights: true,
        refundPredictions: true
      },
      analytics: {
        showTrends: true,
        showForecast: true,
        showRecommendations: true
      }
    },

    // AI CHAT SUPPORT TAB (NEW)
    'ai-support': {
      title: 'AI Support Assistant',
      description: '24/7 multilingual support for all your questions',
      component: ChatAssistant,
      permissions: ['VIEW_SUPPORT'],
      icon: MessageSquare,
      aiFeatures: {
        multilingual: true,
        faqSearch: true,
        documentAnalysis: true,
        humanHandoff: true,
        sentimentAnalysis: true,
        contextualHelp: true
      },
      languages: ['en', 'es', 'fr', 'hi', 'ne'],
      responseTime: '<10s'
    },

    // AI FAQ TAB (NEW)
    'ai-faq': {
      title: 'Smart FAQ',
      description: 'AI-powered answers to frequently asked questions',
      component: FAQViewer,
      permissions: ['VIEW_FAQ'],
      icon: BookOpen,
      aiFeatures: {
        semanticSearch: true,
        contextualAnswers: true,
        relatedQuestions: true,
        feedbackLearning: true
      }
    }
  },

  // AI-Enhanced Additional Routes
  additionalRoutes: {
    'events/:eventName': {
      component: EventDetails,
      permissions: ['VIEW_EVENT_DETAILS'],
      aiFeatures: {
        similarEvents: true,
        priceHistory: true,
        crowdPrediction: true,
        weatherForecast: true,
        venueInsights: true
      }
    },
    'booking/success': {
      component: BookingSuccess,
      permissions: ['VIEW_BOOKING_DETAILS'],
      aiFeatures: {
        qrGeneration: true,
        calendarIntegration: true,
        weatherAlerts: true,
        nearbyRecommendations: true,
        socialSharing: true
      }
    },
    'booking/failed': {
      component: BookingFailed,
      permissions: ['VIEW_BOOKING_DETAILS'],
      aiFeatures: {
        errorAnalysis: true,
        paymentRetry: true,
        alternativeMethods: true,
        supportIntegration: true
      }
    },
    'ai/recommendations': {
      component: RecommendationSection,
      permissions: ['VIEW_RECOMMENDATIONS'],
      aiFeatures: {
        collaborativeFiltering: true,
        contentBased: true,
        hybridModel: true,
        realTimeUpdates: true
      }
    },
    'ai/event-assistant': {
      component: EventRequestAssistant,
      permissions: ['USE_AI_ASSISTANT'],
      aiFeatures: {
        nlpProcessing: true,
        entityExtraction: true,
        organizerMatching: true
      }
    }
  },

  // AI User Preferences
  userPreferences: {
    recommendations: {
      categories: [],
      priceRange: { min: 0, max: 10000 },
      locations: [],
      eventTypes: []
    },
    notifications: {
      email: true,
      push: true,
      priceDrop: true,
      organizerResponse: true,
      eventReminder: true,
      aiSuggestions: true
    },
    privacy: {
      shareInteractionData: true,
      receivePersonalizedAds: false,
      publicWishlist: false
    }
  },

  // Quick Actions Menu
  quickActions: [
    {
      label: 'AI Assistant',
      icon: Bot,
      path: 'ai/event-assistant',
      description: 'Describe your event in natural language'
    },
    {
      label: 'Smart Search',
      icon: Brain,
      path: 'events',
      description: 'AI-powered event discovery'
    },
    {
      label: 'Price Alerts',
      icon: Bell,
      path: 'wishlist',
      description: 'Get notified of price drops'
    },
    {
      label: '24/7 Support',
      icon: MessageSquare,
      path: 'ai-support',
      description: 'Multilingual AI chat support'
    }
  ],

  // Dashboard Insights Cards
  insights: [
    {
      title: 'AI Match Score',
      icon: Brain,
      color: 'purple',
      description: 'Your personalized event compatibility'
    },
    {
      title: 'Smart Budget',
      icon: DollarSign,
      color: 'emerald',
      description: 'AI-optimized spending recommendations'
    },
    {
      title: 'Event Predictions',
      icon: TrendingUp,
      color: 'blue',
      description: 'Upcoming events you might love'
    },
    {
      title: 'Loyalty Tier',
      icon: Award,
      color: 'amber',
      description: 'Exclusive perks and benefits'
    }
  ]
};

// ============================================
// AI-POWERED ORGANIZER DASHBOARD CONFIGURATION
// ============================================

export const organizerDashboardConfig = {
  basePath: '/orgdb',
  defaultTab: 'overview',
  
  aiFeatures: {
    enabled: true,
    eventAnalytics: true,
    attendeeInsights: true,
    pricingOptimization: true,
    marketingRecommendations: true,
    competitorAnalysis: true,
    trendForecasting: true
  },

  tabs: {
    // AI-ENHANCED OVERVIEW
    overview: {
      title: 'AI Analytics Dashboard',
      description: 'Smart insights and predictions for your events',
      component: Overview,
      permissions: ['VIEW_DASHBOARD'],
      icon: BarChart3,
      aiFeatures: {
        salesForecast: true,
        attendancePrediction: true,
        revenueOptimization: true,
        audienceInsights: true,
        trendAnalysis: true,
        competitorTracking: true
      },
      metrics: {
        predictedRevenue: true,
        expectedAttendees: true,
        engagementScore: true,
        marketPosition: true
      }
    },

    // AI-ENHANCED EVENT CREATION
    'create-event': {
      title: 'AI Event Studio',
      description: 'Smart tools to create and optimize your events',
      component: CreateEvent,
      permissions: ['CREATE_EVENT'],
      icon: Zap,
      aiFeatures: {
        smartPricing: true,
        dateOptimization: true,
        venueRecommendations: true,
        ticketTypeSuggestions: true,
        descriptionEnhancement: true,
        imageOptimization: true,
        seoRecommendations: true,
        audienceTargeting: true
      },
      templates: [
        { name: 'Conference', icon: Users },
        { name: 'Workshop', icon: PenTool },
        { name: 'Festival', icon: Music },
        { name: 'Webinar', icon: Video }
      ]
    },

    // AI-ENHANCED EVENT MANAGEMENT
    'my-events': {
      title: 'AI Event Manager',
      description: 'Intelligent tools to manage and grow your events',
      component: MyEvents,
      permissions: ['VIEW_EVENTS'],
      icon: Brain,
      aiFeatures: {
        performanceAnalytics: true,
        attendeeInsights: true,
        engagementMetrics: true,
        churnPrediction: true,
        upsellOpportunities: true,
        feedbackAnalysis: true,
        issueDetection: true
      },
      insights: {
        showRecommendations: true,
        showAlerts: true,
        showOpportunities: true
      }
    },

    // AI-ENHANCED EVENT REQUESTS
    eventrequest: {
      title: 'AI Request Manager',
      description: 'Smart matching with potential clients',
      component: EventRequestorg,
      permissions: ['CREATE_EVENT_REQUEST'],
      icon: Target,
      aiFeatures: {
        leadScoring: true,
        matchProbability: true,
        budgetAnalysis: true,
        responseOptimization: true,
        proposalGeneration: true
      }
    },

    // AI MARKETING TOOLS (NEW)
    marketing: {
      title: 'AI Marketing Hub',
      description: 'Intelligent promotion and audience targeting',
      component: null, // To be implemented
      permissions: ['MANAGE_MARKETING'],
      icon: Megaphone,
      aiFeatures: {
        audienceSegmentation: true,
        channelOptimization: true,
        contentGeneration: true,
        campaignPrediction: true,
        roiForecasting: true
      }
    },

    // AI PRICING OPTIMIZER (NEW)
    pricing: {
      title: 'Smart Pricing',
      description: 'AI-powered dynamic pricing optimization',
      component: null, // To be implemented
      permissions: ['MANAGE_PRICING'],
      icon: DollarSign,
      aiFeatures: {
        demandForecasting: true,
        competitorTracking: true,
        priceElasticity: true,
        discountOptimization: true,
        bundleRecommendations: true
      }
    }
  },

  quickActions: [
    {
      label: 'Create with AI',
      icon: Zap,
      path: 'create-event',
      description: 'AI-assisted event creation'
    },
    {
      label: 'Smart Analytics',
      icon: TrendingUp,
      path: 'overview',
      description: 'Real-time AI insights'
    },
    {
      label: 'Pricing Optimizer',
      icon: DollarSign,
      path: 'pricing',
      description: 'AI price recommendations'
    }
  ],

  insights: [
    {
      title: 'Revenue Forecast',
      icon: TrendingUp,
      color: 'emerald',
      description: 'AI-predicted earnings'
    },
    {
      title: 'Attendance Prediction',
      icon: Users,
      color: 'blue',
      description: 'Expected crowd size'
    },
    {
      title: 'Market Position',
      icon: Target,
      color: 'purple',
      description: 'vs. competitors'
    },
    {
      title: 'Growth Opportunities',
      icon: Award,
      color: 'amber',
      description: 'AI-detected trends'
    }
  ]
};

// ============================================
// AI-POWERED ADMIN DASHBOARD CONFIGURATION
// ============================================

export const adminDashboardConfig = {
  basePath: '/admindb',
  defaultTab: 'overview',
  
  aiFeatures: {
    enabled: true,
    fraudDetection: true,
    systemHealth: true,
    userBehaviorAnalytics: true,
    trendForecasting: true,
    anomalyDetection: true,
    automatedModeration: true,
    resourceOptimization: true
  },

  tabs: {
    // AI-ENHANCED ADMIN OVERVIEW
    overview: {
      title: 'AI System Intelligence',
      description: 'Smart system-wide analytics and predictions',
      component: AdminOverview,
      permissions: ['ADMIN_VIEW_DASHBOARD'],
      icon: Brain,
      aiFeatures: {
        fraudDetection: true,
        anomalyAlert: true,
        growthForecast: true,
        userSegmentation: true,
        revenuePrediction: true,
        riskAssessment: true,
        performanceOptimization: true
      },
      metrics: {
        activeUsers: true,
        systemHealth: true,
        aiConfidence: true,
        predictedGrowth: true
      }
    },

    // AI-ENHANCED EVENTS MANAGEMENT
    events: {
      title: 'AI Event Intelligence',
      description: 'Smart event monitoring and moderation',
      component: EventsManagement,
      permissions: ['MANAGE_EVENTS'],
      icon: Calendar,
      aiFeatures: {
        automatedModeration: true,
        contentFlagging: true,
        fraudDetection: true,
        popularityPrediction: true,
        categoryOptimization: true,
        trendIdentification: true,
        qualityScore: true
      }
    },

    // AI-ENHANCED USERS MANAGEMENT
    users: {
      title: 'AI User Analytics',
      description: 'Smart user behavior analysis and insights',
      component: UsersManagement,
      permissions: ['MANAGE_USERS'],
      icon: Users,
      aiFeatures: {
        behaviorAnalysis: true,
        churnPrediction: true,
        engagementScoring: true,
        segmentRecommendations: true,
        anomalyDetection: true,
        trustScore: true
      }
    },

    // AI-ENHANCED PERMISSIONS
    permissions: {
      title: 'Smart Permissions',
      description: 'AI-recommended access controls',
      component: PermissionsManagement,
      permissions: ['MANAGE_PERMISSIONS'],
      icon: ShieldCheck,
      aiFeatures: {
        roleRecommendations: true,
        accessPatterns: true,
        securityInsights: true,
        complianceMonitoring: true,
        riskAssessment: true
      }
    },

    // AI-ENHANCED CATEGORIES
    categories: {
      title: 'AI Category Manager',
      description: 'Smart event categorization and taxonomy',
      component: CategoriesManagement,
      permissions: ['MANAGE_CATEGORIES'],
      icon: FolderTree,
      aiFeatures: {
        autoCategorization: true,
        trendDetection: true,
        categoryPrediction: true,
        taxonomyOptimization: true,
        contentClustering: true
      }
    },

    // AI-ENHANCED SETTINGS
    settings: {
      title: 'AI System Configuration',
      description: 'Intelligent system settings and optimization',
      component: Settings,
      permissions: ['MANAGE_SETTINGS'],
      icon: Sliders,
      aiFeatures: {
        performanceOptimization: true,
        resourceAllocation: true,
        scalingRecommendations: true,
        securityEnhancements: true,
        costOptimization: true
      }
    },

    // AI FRAUD DETECTION (NEW)
    fraud: {
      title: 'AI Fraud Detection',
      description: 'Smart detection of suspicious activities',
      component: null, // To be implemented
      permissions: ['VIEW_FRAUD_ANALYTICS'],
      icon: Shield,
      aiFeatures: {
        realTimeMonitoring: true,
        patternRecognition: true,
        riskScoring: true,
        automatedAlerts: true,
        investigationTools: true
      }
    },

    // AI TRENDS ANALYTICS (NEW)
    trends: {
      title: 'AI Trend Forecasting',
      description: 'Predictive analytics for event industry trends',
      component: null, // To be implemented
      permissions: ['VIEW_TRENDS'],
      icon: TrendingUp,
      aiFeatures: {
        marketPrediction: true,
        seasonalTrends: true,
        emergingCategories: true,
        demandForecasting: true,
        competitiveAnalysis: true
      }
    }
  },

  quickActions: [
    {
      label: 'AI Risk Scan',
      icon: Shield,
      path: 'fraud',
      description: 'Detect suspicious activities'
    },
    {
      label: 'System Health',
      icon: Activity,
      path: 'overview',
      description: 'AI-powered monitoring'
    },
    {
      label: 'Trend Analysis',
      icon: TrendingUp,
      path: 'trends',
      description: 'Predict market movements'
    }
  ],

  insights: [
    {
      title: 'System Health',
      icon: Activity,
      color: 'emerald',
      description: 'AI-monitored performance'
    },
    {
      title: 'Risk Score',
      icon: Shield,
      color: 'amber',
      description: 'Overall platform risk'
    },
    {
      title: 'Growth Rate',
      icon: TrendingUp,
      color: 'blue',
      description: 'AI-predicted growth'
    },
    {
      title: 'User Satisfaction',
      icon: Star,
      color: 'purple',
      description: 'Sentiment analysis'
    }
  ],

  // AI Model Configuration
  aiModels: {
    recommendation: {
      model: 'hybrid',
      confidence: 0.85,
      updateFrequency: 'realtime'
    },
    fraudDetection: {
      model: 'ensemble',
      sensitivity: 'adaptive',
      alertThreshold: 0.7
    },
    forecasting: {
      model: 'timeseries',
      horizon: '30d',
      granularity: 'daily'
    }
  }
};

// ============================================
// AI FEATURE FLAGS & CONFIGURATION
// ============================================

export const aiFeatureFlags = {
  // Global AI Settings
  global: {
    enabled: true,
    developmentMode: process.env.NODE_ENV === 'development',
    analyticsEnabled: true,
    feedbackLoop: true,
    modelVersion: '2.1.0'
  },

  // User Dashboard AI Features
  user: {
    smartRecommendations: true,
    naturalLanguageRequests: true,
    priceAlerts: true,
    chatSupport: true,
    wishlistInsights: true,
    bookingPredictions: true,
    multilingualSupport: true
  },

  // Organizer Dashboard AI Features
  organizer: {
    pricingOptimizer: true,
    audienceInsights: true,
    competitorAnalysis: true,
    marketingPredictions: true,
    eventAnalytics: true,
    leadScoring: true
  },

  // Admin Dashboard AI Features
  admin: {
    fraudDetection: true,
    trendForecasting: true,
    anomalyDetection: true,
    resourceOptimization: true,
    securityMonitoring: true,
    complianceAutomation: true
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to get tab data with AI features
export const getTabData = (config, tabKey) => {
  const tab = config.tabs[tabKey] || config.tabs[config.defaultTab];
  
  // Add AI feature flags to tab data
  if (tab) {
    tab.aiEnabled = config.aiFeatures?.enabled ?? true;
    tab.supportedFeatures = Object.keys(tab.aiFeatures || {}).filter(key => tab.aiFeatures[key]);
  }
  
  return tab;
};

// Helper function to check if AI feature is enabled
export const isAIFeatureEnabled = (dashboardType, featureKey) => {
  const config = {
    user: userDashboardConfig,
    organizer: organizerDashboardConfig,
    admin: adminDashboardConfig
  }[dashboardType];
  
  return config?.aiFeatures?.[featureKey] ?? false;
};

// Helper function to get dashboard insights
export const getDashboardInsights = (dashboardType) => {
  const config = {
    user: userDashboardConfig,
    organizer: organizerDashboardConfig,
    admin: adminDashboardConfig
  }[dashboardType];
  
  return config?.insights || [];
};

// Helper function to get quick actions
export const getQuickActions = (dashboardType) => {
  const config = {
    user: userDashboardConfig,
    organizer: organizerDashboardConfig,
    admin: adminDashboardConfig
  }[dashboardType];
  
  return config?.quickActions || [];
};

// Helper function to get AI feature status
export const getAIFeatureStatus = (dashboardType, tabKey, featureKey) => {
  const config = {
    user: userDashboardConfig,
    organizer: organizerDashboardConfig,
    admin: adminDashboardConfig
  }[dashboardType];
  
  const tab = config?.tabs[tabKey];
  return tab?.aiFeatures?.[featureKey] ?? false;
};

// Export all configurations
export default {
  user: userDashboardConfig,
  organizer: organizerDashboardConfig,
  admin: adminDashboardConfig,
  aiFeatures: aiFeatureFlags
};