import React, { useState, useEffect } from 'react';
import { useOrganizerAI } from '../../../hooks/useOrganizerAI';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  RefreshCw,
  PieChart,
  BarChart3,
  MessageCircle
} from 'lucide-react';
import AIBadge from '../AIBadge';
import AILoadingSpinner from '../AILoadingSpinner';

const OrganizerDashboardAI = ({ orgId }) => {
  const { 
    dashboardMetrics, 
    sentimentData,
    loading, 
    error, 
    fetchDashboardMetrics,
    fetchSentimentAnalysis 
  } = useOrganizerAI(orgId);
  
  const [timeframe, setTimeframe] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardMetrics(timeframe),
      fetchSentimentAnalysis()
    ]);
    setRefreshing(false);
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !dashboardMetrics) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <AILoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">AI Dashboard Insights</h2>
          <AIBadge type="organizer" agent="dashboard" />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {dashboardMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardMetrics.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                {getTrendIcon(dashboardMetrics.revenueTrend)}
                <span className={dashboardMetrics.revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(dashboardMetrics.revenueTrend)}% vs last {timeframe}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.totalBookings}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                {getTrendIcon(dashboardMetrics.bookingTrend)}
                <span className={dashboardMetrics.bookingTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(dashboardMetrics.bookingTrend)}% vs last {timeframe}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.conversionRate}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                {getTrendIcon(dashboardMetrics.conversionTrend)}
                <span className={dashboardMetrics.conversionTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(dashboardMetrics.conversionTrend)}% vs last {timeframe}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Rating</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.averageRating.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex mt-2 text-xs text-gray-500">
                Based on {dashboardMetrics.totalReviews} reviews
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sentiment Analysis Section */}
      {sentimentData && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <CardTitle>Feedback Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Overall Sentiment</p>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium
                    ${sentimentData.overallSentiment > 0.5 ? 'bg-green-100 text-green-700' : 
                      sentimentData.overallSentiment > 0 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {sentimentData.sentimentLabel}
                  </div>
                  <span className="text-lg font-bold">
                    {(sentimentData.overallSentiment * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Sentiment Distribution</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Positive</span>
                    <span className="font-medium">{sentimentData.distribution.positive}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${sentimentData.distribution.positive}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span>Neutral</span>
                    <span className="font-medium">{sentimentData.distribution.neutral}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-yellow-500 h-1.5 rounded-full" 
                      style={{ width: `${sentimentData.distribution.neutral}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span>Negative</span>
                    <span className="font-medium">{sentimentData.distribution.negative}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full" 
                      style={{ width: `${sentimentData.distribution.negative}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Top Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {sentimentData.topKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Actionable Insights */}
            {sentimentData.insights && sentimentData.insights.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">AI-Generated Insights:</p>
                <ul className="space-y-1">
                  {sentimentData.insights.map((insight, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Performance */}
      {dashboardMetrics?.events && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <CardTitle>Event Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardMetrics.events.map((event, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{event.name}</h4>
                    <Badge variant={
                      event.attendanceRate > 80 ? 'success' : 
                      event.attendanceRate > 50 ? 'warning' : 
                      'destructive'
                    }>
                      {event.attendanceRate}% filled
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-medium">{formatCurrency(event.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bookings</p>
                      <p className="font-medium">{event.bookings}/{event.totalSlots}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rating</p>
                      <p className="font-medium">{event.rating.toFixed(1)} ⭐</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-500 h-1.5 rounded-full" 
                      style={{ width: `${event.attendanceRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Error loading dashboard: {error}
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboardAI;