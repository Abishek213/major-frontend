import React, { useState, useEffect } from 'react';
import { useEventPlanning } from '../../../hooks/useOrganizerAI';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "../../ui"; // This will work if you have index.js
import { Button } from "../../ui";
import { Input } from "../../ui";
import { Label } from "../../ui";
import { Select } from "../../ui";
import { Textarea } from "../../ui";
import { Badge } from "../../ui";
import { Sparkles, TrendingUp, MapPin, Calendar, Tag, Users } from 'lucide-react';
import AIBadge from '../AIBadge';
import AILoadingSpinner from '../AILoadingSpinner';

const EventPlanningAssistant = ({ onApplySuggestion }) => {
  const { suggestions, loading, error, getSuggestions } = useEventPlanning();
  const [eventData, setEventData] = useState({
    category: '',
    location: '',
    eventDate: '',
    description: '',
    currentPrice: '',
    currentSlots: ''
  });
  const [activeTab, setActiveTab] = useState('price');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetSuggestions = async () => {
    if (eventData.category && eventData.location && eventData.description) {
      await getSuggestions(eventData);
    }
  };

  const applySuggestion = (type, value) => {
    if (onApplySuggestion) {
      onApplySuggestion(type, value);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <CardTitle className="text-lg">AI Event Planning Assistant</CardTitle>
        <AIBadge type="organizer" agent="planning" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Event Category</Label>
              <Select
                id="category"
                name="category"
                value={eventData.category}
                onChange={handleInputChange}
              >
                <option value="">Select category</option>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="concert">Concert</option>
                <option value="sports">Sports</option>
                <option value="networking">Networking</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="City, Venue"
                value={eventData.location}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="date"
                value={eventData.eventDate}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Your Price ($)</Label>
              <Input
                id="currentPrice"
                name="currentPrice"
                type="number"
                placeholder="Optional"
                value={eventData.currentPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your event..."
              value={eventData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGetSuggestions}
            disabled={loading || !eventData.category || !eventData.location || !eventData.description}
            className="w-full"
          >
            {loading ? <AILoadingSpinner size="sm" /> : 'Get AI Suggestions'}
          </Button>
        </div>

        {/* Suggestions Display */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {suggestions && !loading && (
          <div className="mt-4 space-y-3">
            {/* Tab Navigation */}
            <div className="flex border-b">
              {['price', 'tags', 'slots', 'date'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[150px]">
              {activeTab === 'price' && suggestions.price && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <h4 className="font-medium">Price Optimization</h4>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Suggested Price:</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${suggestions.price.suggestedPrice}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Based on similar events in {eventData.location}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => applySuggestion('price', suggestions.price.suggestedPrice)}
                    >
                      Apply Price
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'tags' && suggestions.tags && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <h4 className="font-medium">Recommended Tags</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-purple-100"
                        onClick={() => applySuggestion('tag', tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'slots' && suggestions.slots && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <h4 className="font-medium">Capacity Suggestion</h4>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Recommended slots:</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {suggestions.slots.suggestedSlots}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Based on venue capacity in {eventData.location}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => applySuggestion('slots', suggestions.slots.suggestedSlots)}
                    >
                      Apply Capacity
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'date' && suggestions.date && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <h4 className="font-medium">Best Dates</h4>
                  </div>
                  <div className="space-y-2">
                    {suggestions.date.map((date, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span>{new Date(date.date).toLocaleDateString()}</span>
                        <Badge variant="success">{date.confidence}% match</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventPlanningAssistant;