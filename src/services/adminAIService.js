// src/services/adminAIService.js
import api from '../utils/api';

class AdminAIService {
  constructor() {
    // Track if endpoints are available to reduce console spam
    this.endpointStatus = {
      platformAnalytics: true,
      trends: true,
      cohortAnalysis: true,
      fraudAnalysis: true,
      sentimentAnalysis: true
    };
  }

  // Helper method to handle API errors gracefully
  async handleRequest(request, fallbackData, endpointKey) {
    try {
      const response = await request();
      
      // If we get a successful response, mark endpoint as available
      if (response && response.status !== 404) {
        this.endpointStatus[endpointKey] = true;
      }
      
      return response.data;
    } catch (error) {
      // Check if it's a 404 error
      if (error.response?.status === 404) {
        // Only log once per endpoint to reduce console spam
        if (this.endpointStatus[endpointKey] !== false) {
          console.warn(`⚠️ Endpoint ${error.config?.url} not found (404). Using mock data.`);
          this.endpointStatus[endpointKey] = false;
        }
        
        // Return fallback data with a flag indicating it's mock data
        return {
          ...fallbackData,
          _mock: true,
          _warning: 'Using mock data - API endpoint not available'
        };
      }
      
      // Log other errors normally
      console.error(`Error in ${endpointKey}:`, error.message);
      
      // Return fallback data for any error
      return {
        ...fallbackData,
        _mock: true,
        _error: error.message
      };
    }
  }

  // ============================================
  // FRAUD DETECTION AGENT SERVICES
  // ============================================
  
  async analyzeFraud(bookingData) {
    return this.handleRequest(
      () => api.post('/ai/admin/fraud-analysis', bookingData),
      {
        riskScore: Math.random() * 0.5 + 0.3,
        riskLevel: 'medium',
        anomalies: ['Unusual login location', 'Multiple payment attempts'],
        recommendations: ['Enable 2FA', 'Verify user identity']
      },
      'fraudAnalysis'
    );
  }

  async getFraudAlerts(status = 'all') {
    return this.handleRequest(
      () => api.get('/ai/admin/fraud-alerts', { params: { status } }),
      {
        alerts: [
          {
            id: 1,
            type: 'Multiple Failed Logins',
            severity: 'high',
            description: '10 failed login attempts in 5 minutes',
            user: 'user123',
            ip: '192.168.1.100',
            location: 'Unknown VPN',
            time: '2 minutes ago',
            status: 'new',
            riskScore: 0.94,
            bookingId: 'BOK12345',
            amount: 450,
            paymentMethod: 'Credit Card',
            transactionId: 'TXN789012'
          },
          {
            id: 2,
            type: 'Suspicious Purchase Pattern',
            severity: 'medium',
            description: 'Bulk ticket purchase with multiple credit cards',
            user: 'eventbuyer',
            ip: '203.0.113.45',
            location: 'New York, US',
            time: '15 minutes ago',
            status: 'investigating',
            riskScore: 0.76,
            bookingId: 'BOK12346',
            amount: 1250,
            paymentMethod: 'Multiple Cards',
            transactionId: 'TXN789013'
          },
          {
            id: 3,
            type: 'Account Takeover Attempt',
            severity: 'high',
            description: 'Login from new device with suspicious behavior',
            user: 'premiumuser',
            ip: '198.51.100.67',
            location: 'Moscow, RU',
            time: '32 minutes ago',
            status: 'new',
            riskScore: 0.96,
            bookingId: 'BOK12347',
            amount: 0,
            paymentMethod: 'N/A',
            transactionId: 'TXN789014'
          }
        ]
      },
      'fraudAlerts'
    );
  }

  async blockSuspiciousBooking(bookingId, reason) {
    return this.handleRequest(
      () => api.post(`/ai/admin/block-booking/${bookingId}`, { reason }),
      { success: true, message: 'Booking blocked (mock)' },
      'blockBooking'
    );
  }

  async resolveFraudAlert(alertId, action) {
    return this.handleRequest(
      () => api.post(`/ai/admin/resolve-alert/${alertId}`, { action }),
      { success: true, message: 'Alert resolved (mock)' },
      'resolveAlert'
    );
  }

  // ============================================
  // ANALYTICS AND INSIGHTS AGENT SERVICES
  // ============================================

  async getPlatformAnalytics(timeframe = '30d', metricType = 'all') {
    return this.handleRequest(
      () => api.get('/ai/admin/platform-analytics', {
        params: { 
          timeframe: this.normalizeTimeframe(timeframe),
          metricType 
        }
      }),
      this.getMockPlatformAnalytics(timeframe),
      'platformAnalytics'
    );
  }

  async getTrendData(trendType = 'all', period = '30d') {
    return this.handleRequest(
      () => api.get('/ai/admin/trends', {
        params: { 
          trendType, 
          period: this.normalizeTimeframe(period) 
        }
      }),
      this.getMockTrendData(trendType, period),
      'trends'
    );
  }

  async getCohortAnalysis(cohortType = 'user', timeframe = '6months') {
    return this.handleRequest(
      () => api.get('/ai/admin/cohort-analysis', {
        params: { cohortType, timeframe }
      }),
      this.getMockCohortData(cohortType),
      'cohortAnalysis'
    );
  }

  // ============================================
  // FEEDBACK SENTIMENT AGENT SERVICES
  // ============================================

  async getSentimentOverview(timeframe = 'week') {
    return this.handleRequest(
      () => api.get('/ai/admin/sentiment-overview', {
        params: { timeframe }
      }),
      {
        positive: 65,
        neutral: 25,
        negative: 10,
        total: 1245,
        keywords: [
          { word: 'great', count: 245 },
          { word: 'organized', count: 189 },
          { word: 'fun', count: 156 },
          { word: 'expensive', count: 98 },
          { word: 'parking', count: 76 }
        ],
        trend: [
          { date: 'Mon', sentiment: 0.75 },
          { date: 'Tue', sentiment: 0.78 },
          { date: 'Wed', sentiment: 0.82 },
          { date: 'Thu', sentiment: 0.79 },
          { date: 'Fri', sentiment: 0.85 },
          { date: 'Sat', sentiment: 0.88 },
          { date: 'Sun', sentiment: 0.86 }
        ]
      },
      'sentimentOverview'
    );
  }

  async getRecentReviews(limit = 20) {
    return this.handleRequest(
      () => api.get('/ai/admin/recent-reviews', { params: { limit } }),
      this.getMockRecentReviews(),
      'recentReviews'
    );
  }

  async analyzeReviewSentiment(reviewId) {
    return this.handleRequest(
      () => api.post(`/ai/admin/analyze-sentiment/${reviewId}`),
      {
        sentiment: 0.78,
        label: 'positive',
        keywords: ['great', 'organized', 'fun'],
        toxicityScore: 0.02
      },
      'analyzeSentiment'
    );
  }

  async getToxicityAlerts(threshold = 0.7) {
    return this.handleRequest(
      () => api.get('/ai/admin/toxicity-alerts', { params: { threshold } }),
      {
        alerts: [
          { id: 1, content: 'Review with inappropriate language', score: 0.89 },
          { id: 2, content: 'Spam comment detected', score: 0.92 }
        ]
      },
      'toxicityAlerts'
    );
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  normalizeTimeframe(timeframe) {
    // Convert between different timeframe formats
    const mapping = {
      'day': '24h',
      'week': '7d',
      'month': '30d',
      'quarter': '90d',
      'year': '365d',
      '24h': '24h',
      '7d': '7d',
      '30d': '30d',
      '90d': '90d',
      '365d': '365d'
    };
    return mapping[timeframe] || timeframe;
  }

  getMockPlatformAnalytics(timeframe = '30d') {
    const mockData = {
      '7d': {
        totalUsers: 5234,
        totalEvents: 841,
        totalBookings: 4456,
        totalRevenue: 156789,
        userGrowth: 5,
        eventGrowth: 4,
        bookingGrowth: 6,
        revenueGrowth: 8,
        categoryDistribution: [
          { name: 'Music', count: 302, percentage: 36 },
          { name: 'Technology', count: 227, percentage: 27 },
          { name: 'Business', count: 160, percentage: 19 },
          { name: 'Arts', count: 152, percentage: 18 }
        ],
        insights: [
          { title: 'User Growth', description: '5% increase in new users this week' },
          { title: 'Peak Hours', description: 'Most bookings between 6-9 PM' },
          { title: 'Popular Category', description: 'Music events trending' }
        ]
      },
      '30d': {
        totalUsers: 15234,
        totalEvents: 2341,
        totalBookings: 12456,
        totalRevenue: 456789,
        userGrowth: 15,
        eventGrowth: 12,
        bookingGrowth: 18,
        revenueGrowth: 22,
        categoryDistribution: [
          { name: 'Music', count: 845, percentage: 36 },
          { name: 'Technology', count: 623, percentage: 27 },
          { name: 'Business', count: 456, percentage: 19 },
          { name: 'Arts', count: 417, percentage: 18 }
        ],
        insights: [
          { title: 'User Growth', description: '15% increase in new users this month' },
          { title: 'Peak Hours', description: 'Most bookings between 6-9 PM' },
          { title: 'Popular Category', description: 'Music events trending' }
        ]
      },
      '90d': {
        totalUsers: 35234,
        totalEvents: 5341,
        totalBookings: 32456,
        totalRevenue: 1256789,
        userGrowth: 32,
        eventGrowth: 28,
        bookingGrowth: 35,
        revenueGrowth: 42,
        categoryDistribution: [
          { name: 'Music', count: 1923, percentage: 36 },
          { name: 'Technology', count: 1442, percentage: 27 },
          { name: 'Business', count: 1015, percentage: 19 },
          { name: 'Arts', count: 961, percentage: 18 }
        ],
        insights: [
          { title: 'User Growth', description: '32% increase in new users this quarter' },
          { title: 'Peak Hours', description: 'Most bookings between 6-9 PM' },
          { title: 'Popular Category', description: 'Music events trending' }
        ]
      }
    };

    return mockData[timeframe] || mockData['30d'];
  }

  getMockTrendData(trendType = 'all', period = '30d') {
    const baseData = {
      labels: period === '7d' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: period === '7d' 
        ? [45, 52, 48, 61, 78, 92, 88]
        : [125, 145, 168, 192],
      growth: 15.4,
      insights: ['Steady growth in tech events', 'Weekend events popular']
    };

    if (trendType !== 'all') {
      return {
        ...baseData,
        type: trendType,
        message: `Trend data for ${trendType}`
      };
    }

    return baseData;
  }

  getMockCohortData(cohortType = 'user') {
    const mockData = {
      user: {
        totalCohorts: 6,
        avgRetention: 42,
        bestCohort: 'Jan 2024',
        periods: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
        cohorts: [
          { name: 'Jan 2024', size: 1250, retention: [100, 68, 54, 42, 38, 32] },
          { name: 'Feb 2024', size: 1420, retention: [100, 72, 58, 45, 40, 35] },
          { name: 'Mar 2024', size: 1380, retention: [100, 70, 55, 44, 39, 33] },
          { name: 'Apr 2024', size: 1510, retention: [100, 75, 62, 48, 42, 36] },
          { name: 'May 2024', size: 1650, retention: [100, 78, 65, 52, 45, 38] },
          { name: 'Jun 2024', size: 1720, retention: [100, 80, 68, 55, 48, 42] }
        ],
        insights: [
          { cohort: 'Jan 2024', message: 'January cohort shows strong initial retention but drops after month 3' },
          { cohort: 'Feb 2024', message: 'February cohort has better than average retention at month 6' },
          { cohort: 'Mar 2024', message: 'March cohort performing within expected range' },
          { cohort: 'Apr 2024', message: 'April cohort showing promising long-term engagement' },
          { cohort: 'May 2024', message: 'May cohort has highest initial retention rate' },
          { cohort: 'Jun 2024', message: 'June cohort still too early for meaningful trend analysis' }
        ],
        recommendations: [
          { cohort: 'Jan 2024', action: 'Re-engage users with personalized email campaign' },
          { cohort: 'Feb 2024', action: 'Target with upsell opportunities for premium features' },
          { cohort: 'Mar 2024', action: 'Send satisfaction survey to understand drop-off reasons' },
          { cohort: 'Apr 2024', action: 'Highlight community features to increase engagement' },
          { cohort: 'May 2024', action: 'Offer referral incentives to capitalize on enthusiasm' },
          { cohort: 'Jun 2024', action: 'Continue monitoring; too early for interventions' }
        ]
      },
      organizer: {
        totalCohorts: 6,
        avgRetention: 38,
        bestCohort: 'Feb 2024',
        periods: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
        cohorts: [
          { name: 'Jan 2024', size: 45, retention: [100, 82, 71, 58, 49, 42] },
          { name: 'Feb 2024', size: 52, retention: [100, 85, 75, 65, 58, 52] },
          { name: 'Mar 2024', size: 48, retention: [100, 79, 67, 54, 48, 41] },
          { name: 'Apr 2024', size: 61, retention: [100, 84, 72, 61, 53, 45] },
          { name: 'May 2024', size: 58, retention: [100, 80, 68, 55, 47, 40] },
          { name: 'Jun 2024', size: 63, retention: [100, 83, 70, 58, 50, 43] }
        ],
        insights: [
          { cohort: 'Jan 2024', message: 'Organizer retention strong; consider advanced features' },
          { cohort: 'Feb 2024', message: 'February cohort most engaged; analyze success factors' },
          { cohort: 'Mar 2024', message: 'March cohort has typical retention pattern' }
        ],
        recommendations: [
          { cohort: 'Jan 2024', action: 'Introduce bulk event creation tools' },
          { cohort: 'Feb 2024', action: 'Feature in success stories section' },
          { cohort: 'Mar 2024', action: 'Provide analytics dashboard training' }
        ]
      },
      event: {
        totalCohorts: 6,
        avgRetention: 45,
        bestCohort: 'Tech Events',
        periods: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
        cohorts: [
          { name: 'Tech Events', size: 234, retention: [100, 72, 61, 52, 46, 41] },
          { name: 'Music Events', size: 312, retention: [100, 68, 55, 44, 38, 32] },
          { name: 'Business Events', size: 189, retention: [100, 65, 52, 41, 35, 29] },
          { name: 'Arts Events', size: 156, retention: [100, 58, 45, 36, 30, 25] },
          { name: 'Sports Events', size: 145, retention: [100, 62, 48, 38, 31, 26] },
          { name: 'Food Events', size: 178, retention: [100, 55, 42, 33, 27, 22] }
        ],
        insights: [
          { cohort: 'Tech Events', message: 'Tech events have highest long-term retention' },
          { cohort: 'Music Events', message: 'Music events popular but lower retention' },
          { cohort: 'Business Events', message: 'Business events attract repeat attendees' }
        ],
        recommendations: [
          { cohort: 'Tech Events', action: 'Create specialized tracks for different skill levels' },
          { cohort: 'Music Events', action: 'Add more networking opportunities' },
          { cohort: 'Business Events', action: 'Introduce early-bird pricing for repeat attendees' }
        ]
      }
    };

    return mockData[cohortType] || mockData.user;
  }

  getMockRecentReviews() {
    return [
      {
        id: 1,
        userName: 'John Smith',
        rating: 5,
        comment: 'Amazing event! The organization was perfect and the speakers were fantastic.',
        date: '2024-02-15',
        sentimentScore: 0.92,
        sentimentLabel: 'positive',
        toxicityScore: 0.02,
        eventName: 'Tech Conference 2024'
      },
      {
        id: 2,
        userName: 'Sarah Johnson',
        rating: 4,
        comment: 'Good event overall, but the parking situation was difficult.',
        date: '2024-02-14',
        sentimentScore: 0.65,
        sentimentLabel: 'positive',
        toxicityScore: 0.01,
        eventName: 'Music Festival'
      },
      {
        id: 3,
        userName: 'Mike Wilson',
        rating: 3,
        comment: 'Average experience. The venue was nice but the food was disappointing.',
        date: '2024-02-13',
        sentimentScore: 0.12,
        sentimentLabel: 'neutral',
        toxicityScore: 0.03,
        eventName: 'Food & Wine Expo'
      },
      {
        id: 4,
        userName: 'Emily Brown',
        rating: 2,
        comment: 'Very disappointed with the service. Would not recommend.',
        date: '2024-02-12',
        sentimentScore: -0.45,
        sentimentLabel: 'negative',
        toxicityScore: 0.15,
        eventName: 'Business Workshop'
      },
      {
        id: 5,
        userName: 'David Lee',
        rating: 5,
        comment: 'Best event I\'ve attended this year! Will definitely come back.',
        date: '2024-02-11',
        sentimentScore: 0.95,
        sentimentLabel: 'positive',
        toxicityScore: 0.01,
        eventName: 'Tech Conference 2024'
      }
    ];
  }
}

const adminAIService = new AdminAIService();
export default adminAIService;  