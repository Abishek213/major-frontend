import React, { useState } from 'react';
import { useNegotiation } from '../../../hooks/useOrganizerAI';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { MessageSquare, TrendingUp, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import AIBadge from '../user/AIBadge';
import AILoadingSpinner from '../user/AILoadingSpinner';

const NegotiationAssistant = ({ requestId, requestDetails }) => {
  const { competitors, loading, error, submitOffer, getCompetitorAnalysis } = useNegotiation(requestId);
  const [offerData, setOfferData] = useState({
    proposedPrice: requestDetails?.budget || '',
    proposedDate: '',
    customMessage: ''
  });
  const [showCompetitorAnalysis, setShowCompetitorAnalysis] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOffer = async () => {
    setSubmitting(true);
    try {
      await submitOffer(offerData);
      // Show success message or reset form
      setOfferData({
        proposedPrice: requestDetails?.budget || '',
        proposedDate: '',
        customMessage: ''
      });
    } catch (err) {
      console.error('Failed to submit offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompetitorAnalysis = async () => {
    await getCompetitorAnalysis();
    setShowCompetitorAnalysis(true);
  };

  const getSuccessProbability = () => {
    if (!competitors) return null;
    
    const avgCompetitorPrice = competitors.reduce((sum, c) => sum + c.proposedPrice, 0) / competitors.length;
    const ourPrice = parseInt(offerData.proposedPrice) || 0;
    
    if (ourPrice < avgCompetitorPrice * 0.9) return 'High';
    if (ourPrice < avgCompetitorPrice) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg">Negotiation Assistant</CardTitle>
        </div>
        <AIBadge type="organizer" agent="negotiation" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Request Summary */}
        {requestDetails && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Event Request Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{requestDetails.eventType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(requestDetails.preferredDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Budget: ${requestDetails.budget}</span>
              </div>
            </div>
          </div>
        )}

        {/* Offer Form */}
        <div className="space-y-3">
          <h4 className="font-medium">Create Your Offer</h4>
          
          <div className="space-y-2">
            <Label htmlFor="proposedPrice">Proposed Price ($)</Label>
            <Input
              id="proposedPrice"
              name="proposedPrice"
              type="number"
              value={offerData.proposedPrice}
              onChange={handleInputChange}
              placeholder="Enter your price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposedDate">Proposed Date</Label>
            <Input
              id="proposedDate"
              name="proposedDate"
              type="date"
              value={offerData.proposedDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Message</Label>
            <Textarea
              id="customMessage"
              name="customMessage"
              value={offerData.customMessage}
              onChange={handleInputChange}
              placeholder="Tell the user why they should choose you..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmitOffer}
              disabled={submitting || !offerData.proposedPrice || !offerData.proposedDate}
              className="flex-1"
            >
              {submitting ? <AILoadingSpinner size="sm" /> : 'Submit Offer'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCompetitorAnalysis}
              disabled={loading}
            >
              {loading ? <AILoadingSpinner size="sm" /> : 'Analyze Competition'}
            </Button>
          </div>
        </div>

        {/* Competitor Analysis */}
        {showCompetitorAnalysis && competitors && (
          <div className="mt-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Competitor Analysis
            </h4>

            <div className="space-y-2">
              {competitors.map((competitor, index) => (
                <div key={index} className="p-2 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{competitor.organizerName}</span>
                    <Badge variant={
                      competitor.proposedPrice < offerData.proposedPrice ? 'success' : 'secondary'
                    }>
                      ${competitor.proposedPrice}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Date: {new Date(competitor.proposedDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {offerData.proposedPrice && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Your Success Probability:</p>
                <div className="flex items-center gap-2 mt-1">
                  {getSuccessProbability() === 'High' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">High chance of winning</span>
                    </>
                  )}
                  {getSuccessProbability() === 'Medium' && (
                    <>
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600">Medium chance - consider adjusting price</span>
                    </>
                  )}
                  {getSuccessProbability() === 'Low' && (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">Low chance - price may be too high</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-50 text-red-600 text-sm rounded">
            Error: {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NegotiationAssistant;