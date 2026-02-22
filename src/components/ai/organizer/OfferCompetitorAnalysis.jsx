import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import AIBadge from '../user/AIBadge';
import AILoadingSpinner from '../user/AILoadingSpinner';
import organizerAIService from '../../../services/organizerAIService';

const OfferCompetitorAnalysis = ({ requestId, currentOffer }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState(null);

  useEffect(() => {
    if (requestId) {
      fetchAnalysis();
    }
  }, [requestId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getCompetitorAnalysis(requestId);
      setAnalysis(data.analysis);
      setCompetitors(data.competitors || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWinProbabilityColor = (probability) => {
    if (probability >= 70) return 'text-green-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankBadge = (index) => {
    switch(index) {
      case 0: return <Award className="w-4 h-4 text-yellow-500" />;
      case 1: return <Award className="w-4 h-4 text-gray-400" />;
      case 2: return <Award className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-48">
          <AILoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <CardTitle className="text-lg">Competitor Analysis</CardTitle>
        </div>
        <AIBadge type="organizer" agent="negotiation" />
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {analysis && (
          <>
            {/* Success Probability */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Win Probability</span>
                <span className={`text-2xl font-bold ${getWinProbabilityColor(analysis.winProbability)}`}>
                  {analysis.winProbability}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    analysis.winProbability >= 70 ? 'bg-green-500' :
                    analysis.winProbability >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${analysis.winProbability}%` }}
                />
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Insights</h4>
              <div className="space-y-2">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="flex items-start gap-2">
                      {insight.type === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      {insight.type === 'positive' && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      {insight.type === 'negative' && (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{insight.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Offers */}
            {competitors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Competitor Offers ({competitors.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getRankBadge(index)}
                          <span className="font-medium">{competitor.organizerName}</span>
                        </div>
                        <Badge variant={index === 0 ? 'success' : 'secondary'}>
                          ${competitor.proposedPrice}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{new Date(competitor.proposedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-gray-400" />
                          <span>{competitor.experience} events</span>
                        </div>
                      </div>

                      {competitor.strengths && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Strengths:</span> {competitor.strengths.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {analysis.recommendation && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">AI Recommendation</h4>
                <p className="text-sm text-gray-700">{analysis.recommendation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  // Adjust price based on analysis
                  if (analysis.suggestedPrice) {
                    // Handle price adjustment
                  }
                }}
              >
                Adjust Price
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  // Refresh analysis
                  fetchAnalysis();
                }}
              >
                Refresh
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OfferCompetitorAnalysis;