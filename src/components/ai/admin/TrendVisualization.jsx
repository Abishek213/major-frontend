import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  TrendingUp, 
  Calendar,
  BarChart2,
  LineChart,
  PieChart
} from 'lucide-react';
import adminAIService from '../../../services/adminAIService';
import AILoadingSpinner from '../AILoadingSpinner';

// Note: In a real app, you'd use a charting library like recharts or chart.js
// This is a simplified version with placeholder charts

const TrendVisualization = ({ timeframe }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [selectedMetric, setSelectedMetric] = useState('bookings');

  useEffect(() => {
    fetchTrends();
  }, [timeframe, selectedMetric]);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAIService.getTrendData(selectedMetric, timeframe);
      setTrendData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { id: 'bookings', name: 'Bookings', icon: BarChart2 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'revenue', name: 'Revenue', icon: TrendingUp },
    { id: 'events', name: 'Events', icon: Calendar }
  ];

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <AILoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Trend Analysis
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            {metrics.map(metric => (
              <option key={metric.id} value={metric.id}>
                {metric.name}
              </option>
            ))}
          </select>

          {/* Chart Type Selector */}
          <div className="flex border rounded">
            <Button
              variant={chartType === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
              className="px-2"
            >
              <LineChart className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="px-2"
            >
              <BarChart2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm mb-4">
            Error: {error}
          </div>
        )}

        {trendData && (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold">{trendData.total}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Average</p>
                <p className="text-lg font-bold">{trendData.average}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Growth</p>
                <p className={`text-lg font-bold ${trendData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trendData.growth > 0 ? '+' : ''}{trendData.growth}%
                </p>
              </div>
            </div>

            {/* Placeholder Chart */}
            <div className="h-64 bg-gray-50 rounded-lg relative overflow-hidden">
              {/* This is a simplified chart representation */}
              <div className="absolute inset-0 flex items-end justify-around p-4">
                {trendData.dataPoints?.map((point, index) => (
                  <div key={index} className="flex flex-col items-center w-12">
                    <div 
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ height: `${(point.value / trendData.maxValue) * 150}px` }}
                    />
                    <span className="text-xs mt-2 text-gray-600">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend Insights */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Key Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {trendData.insights?.map((insight, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Periods */}
            {trendData.peakPeriods && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Peak Periods</h4>
                <div className="flex flex-wrap gap-2">
                  {trendData.peakPeriods.map((period, index) => (
                    <Badge key={index} variant="secondary">
                      {period}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendVisualization;