
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Tag, Sparkles, Plus, X, TrendingUp } from 'lucide-react';
import AIBadge from '../AIBadge';
import AILoadingSpinner from '../AILoadingSpinner';
import organizerAIService from '../../../services/organizerAIService';

const TagRecommender = ({ description, category, onTagsSelected }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedTags, setRecommendedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    if (description && category) {
      fetchRecommendations();
    }
  }, [description, category]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getTagRecommendations(description, category);
      setRecommendedTags(data.tags || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      const newSelected = [...selectedTags, tag];
      setSelectedTags(newSelected);
      onTagsSelected?.(newSelected);
    }
  };

  const handleTagRemove = (tag) => {
    const newSelected = selectedTags.filter(t => t !== tag);
    setSelectedTags(newSelected);
    onTagsSelected?.(newSelected);
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      const newSelected = [...selectedTags, customTag.trim()];
      setSelectedTags(newSelected);
      onTagsSelected?.(newSelected);
      setCustomTag('');
    }
  };

  const getTagPopularity = (tag) => {
    const found = recommendedTags.find(t => t.name === tag);
    return found ? found.popularity : 50;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-32">
          <AILoadingSpinner size="sm" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg">AI Tag Recommender</CardTitle>
        </div>
        <AIBadge type="organizer" agent="planning" />
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Tags</h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => handleTagRemove(tag)}
                >
                  {tag}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Tags */}
        {recommendedTags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI Recommended Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendedTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                  className={`cursor-pointer hover:bg-purple-100 flex items-center gap-1 ${
                    selectedTags.includes(tag.name) ? 'bg-purple-500' : ''
                  }`}
                  onClick={() => handleTagSelect(tag.name)}
                >
                  {tag.name}
                  {tag.popularity > 70 && (
                    <TrendingUp className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Tag Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom tag..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddCustomTag}
            disabled={!customTag.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Popularity Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>High popularity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TagRecommender;