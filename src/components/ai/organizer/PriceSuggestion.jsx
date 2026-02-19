// src/components/ai/organizer/PriceSuggestion.jsx
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { TrendingUp, DollarSign, Info, Zap, CheckCircle } from "lucide-react";
import AIBadge from "../AIBadge";
import AILoadingSpinner from "../AILoadingSpinner";
import organizerAIService from "../../../services/organizerAIService";

// Only call backend when category is a real MongoDB ObjectId
const isObjectId = (val) =>
  typeof val === "string" && /^[a-f\d]{24}$/i.test(val);

const PriceSuggestion = ({ category, location, onApplyPrice }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 0,
    suggested: 0,
  });
  const [manualPrice, setManualPrice] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Guard: only fire when we have a valid ObjectId AND meaningful location
    if (!isObjectId(category) || !location || location.length < 2) return;

    // Debounce: wait 800ms after the last prop change before firing
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPriceSuggestion();
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [category, location]);

  const fetchPriceSuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizerAIService.getPriceSuggestion({
        category,
        location,
      });
      setSuggestion(data);
      setPriceRange({
        min: data.priceRange.min,
        max: data.priceRange.max,
        suggested: data.suggestedPrice,
      });
      setSelectedPrice(data.suggestedPrice);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (value) => setSelectedPrice(value);

  const handleApply = () => {
    if (onApplyPrice && selectedPrice) onApplyPrice(selectedPrice);
  };

  const getDemandLevel = () => {
    if (!suggestion) return null;
    if (suggestion.demandScore > 0.7) return { level: "High", color: "green" };
    if (suggestion.demandScore > 0.4)
      return { level: "Medium", color: "yellow" };
    return { level: "Low", color: "red" };
  };

  const demand = getDemandLevel();

  // Don't render anything until we have a valid ObjectId category
  if (!isObjectId(category)) return null;

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-48">
          <AILoadingSpinner size="md" label="Analysing market prices…" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <CardTitle className="text-lg">AI Price Suggestion</CardTitle>
          {suggestion?.source === "mock" && (
            <span className="text-xs text-gray-400">(estimated)</span>
          )}
        </div>
        <AIBadge type="organizer" agent="planning" size="sm" animate={false} />
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            Error: {error}
          </div>
        )}

        {suggestion && (
          <>
            {/* Market Overview */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Market Analysis
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Avg. Market Price</p>
                  <p className="font-semibold">
                    Rs. {suggestion.marketAverage}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Demand Level</p>
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full bg-${demand?.color}-500`}
                    />
                    <span className="font-semibold">
                      {demand?.level} Demand
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Recommended Price Range</Label>
                <span className="text-sm font-medium">
                  Rs. {priceRange.min} – Rs. {priceRange.max}
                </span>
              </div>

              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={Math.max(
                  1,
                  Math.round((priceRange.max - priceRange.min) / 50)
                )}
                value={[selectedPrice ?? priceRange.suggested]}
                onValueChange={(value) => handlePriceChange(value[0])}
                className="w-full"
              />

              <div className="flex items-center justify-between mt-2">
                <div className="text-sm">
                  <span className="text-gray-500">Suggested: </span>
                  <span className="font-bold text-green-600">
                    Rs. {priceRange.suggested}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Your selection: </span>
                  <span className="font-bold text-blue-600">
                    Rs. {selectedPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Input */}
            <div className="space-y-2">
              <Label htmlFor="manualPrice">Or enter manually</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    id="manualPrice"
                    type="number"
                    placeholder="Enter price"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (manualPrice) setSelectedPrice(parseInt(manualPrice));
                  }}
                >
                  Set
                </Button>
              </div>
            </div>

            {/* Success Probability */}
            {selectedPrice && (
              <div
                className={`p-3 rounded-lg ${
                  selectedPrice <= priceRange.max &&
                  selectedPrice >= priceRange.min
                    ? "bg-green-50"
                    : "bg-yellow-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedPrice <= priceRange.max &&
                  selectedPrice >= priceRange.min ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700">
                        Price within optimal range — good chance of bookings
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-700">
                        Price outside optimal range — may affect booking rate
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <Button
              type="button"
              onClick={handleApply}
              disabled={!selectedPrice}
              className="w-full"
            >
              Apply Rs. {selectedPrice} to form
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceSuggestion;
