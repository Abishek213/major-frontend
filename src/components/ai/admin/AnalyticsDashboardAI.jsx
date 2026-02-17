import React, { useState, useEffect } from 'react';
import { useAdminAI } from '../../../hooks/useAdminAI';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  PieChart,
  Activity
} from 'lucide-react';
import AIBadge from '../AIBadge';
import AILoadingSpinner from '../AILoadingSpinner';
import TrendVisualization from './TrendVisualization';
import CohortAnalysisView from './CohortAnalysisView';

const AnalyticsDashboardAI = () => {
  const { 
    platformAnalytics, 
    loading, 
    error, 
    fetchPlatformAnalytics,
    fetchTrendData
  } = useAdminAI();

  const [timeframe, setTimeframe] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPlatformAnalytics(timeframe),
      fetchTrendData('all', timeframe)
    ]);
    setRefreshing(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !platformAnalytics) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
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
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">AI Analytics Dashboard</h2>
          <AIBadge type="admin" agent="analytics" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {['overview', 'trends', 'cohorts', 'revenue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && platformAnalytics && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{formatNumber(platformAnalytics.totalUsers)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">
                    {platformAnalytics.userGrowth}% vs last {timeframe}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Events</p>
                    <p className="text-2xl font-bold">{formatNumber(platformAnalytics.totalEvents)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">
                    {platformAnalytics.eventGrowth}% vs last {timeframe}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold">{formatNumber(platformAnalytics.totalBookings)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">
                    {platformAnalytics.bookingGrowth}% vs last {timeframe}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(platformAnalytics.totalRevenue)}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">
                    {platformAnalytics.revenueGrowth}% vs last {timeframe}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {platformAnalytics.categoryDistribution?.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category.name}</span>
                        <span className="font-medium">{category.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {platformAnalytics.locationDistribution?.slice(0, 5).map((location, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{location.city}</span>
                        <span className="font-medium">{location.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {platformAnalytics.insights?.map((insight, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-500 mb-1" />
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <TrendVisualization timeframe={timeframe} />
      )}

      {/* Cohorts Tab */}
      {activeTab === 'cohorts' && (
        <CohortAnalysisView timeframe={timeframe} />
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && platformAnalytics && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">By Category</h4>
                  <div className="space-y-2">
                    {platformAnalytics.revenueByCategory?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-medium">{formatCurrency(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">By Payment Method</h4>
                  <div className="space-y-2">
                    {platformAnalytics.revenueByPaymentMethod?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.method}</span>
                        <span className="font-medium">{formatCurrency(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          Error loading analytics: {error}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboardAI;