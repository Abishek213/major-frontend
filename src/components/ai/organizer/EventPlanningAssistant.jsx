// src/components/ai/organizer/EventPlanningAssistant.jsx
import React, { useState } from "react";
import { useEventPlanning } from "../../../hooks/useOrganizerAI";
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Tag,
  Users,
  ChevronRight,
  Bot,
  Wand2,
  AlertCircle,
} from "lucide-react";
import AIBadge from "../user/AIBadge";
import AILoadingSpinner from "../user/AILoadingSpinner";

/**
 * EventPlanningAssistant
 *
 * Props:
 *   onApplySuggestion(type, value) — called when user applies a suggestion
 *   categories                     — real category list from CreateEvent
 *                                    [{ _id, categoryName, subCategories }]
 *   initialData                    — optional pre-fill from parent form state
 */
const EventPlanningAssistant = ({
  onApplySuggestion,
  categories = [],
  initialData = {},
}) => {
  const { suggestions, loading, error, getSuggestions } = useEventPlanning();

  const [formData, setFormData] = useState({
    category: initialData.category || "",
    location: initialData.location || "",
    eventDate: initialData.event_date || "",
    description: initialData.description || "",
  });

  const [activeTab, setActiveTab] = useState("price");
  const [hasRequested, setHasRequested] = useState(false);

  const canFetch =
    formData.category && formData.location && formData.description;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGetSuggestions = async () => {
    if (!canFetch) return;
    setHasRequested(true);
    await getSuggestions(formData);
  };

  const apply = (type, value) => {
    onApplySuggestion?.(type, value);
  };

  // Flatten categories for the select (same logic as CreateEvent)
  const flattenCategories = (cats, level = 0) => {
    const result = [];
    cats.forEach((cat) => {
      if (!cat.isActive) return;
      const prefix = level > 0 ? "  ".repeat(level) + "– " : "";
      result.push({ value: cat._id, label: prefix + cat.categoryName });
      if (cat.subCategories?.length) {
        result.push(...flattenCategories(cat.subCategories, level + 1));
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const tabs = [
    { id: "price", label: "Price", icon: TrendingUp },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "slots", label: "Capacity", icon: Users },
    { id: "date", label: "Best Date", icon: Calendar },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">
              AI Event Planning Assistant
            </h3>
            <AIBadge
              type="organizer"
              agent="planning"
              size="sm"
              animate={false}
            />
          </div>
          <p className="text-xs text-gray-500">
            Get AI-powered suggestions for pricing, tags, capacity & timing
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category — uses REAL categories from backend */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
          >
            <option value="">Select category</option>
            {flatCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Location
          </label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City or venue"
            className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
          />
        </div>

        {/* Event Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Event Date
          </label>
          <input
            name="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
          />
        </div>

        {/* Description (short) */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Description <span className="text-gray-400">(for tag AI)</span>
          </label>
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief event description"
            className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleGetSuggestions}
        disabled={loading || !canFetch}
        className="w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200
          bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
          text-white shadow-md hover:shadow-lg hover:scale-[1.02]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <AILoadingSpinner size="sm" label="Analysing your event…" />
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            {hasRequested ? "Refresh AI Suggestions" : "Get AI Suggestions"}
          </>
        )}
      </button>

      {/* Validation hint */}
      {!canFetch && (
        <p className="text-xs text-purple-500 text-center">
          Fill in category, location & description to unlock AI suggestions
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error} — falling back to smart estimates</span>
        </div>
      )}

      {/* Results */}
      {suggestions && !loading && (
        <div className="bg-white rounded-xl border border-purple-100 overflow-hidden shadow-sm">
          {/* Tab bar */}
          <div className="flex border-b border-purple-50">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors
                  ${
                    activeTab === id
                      ? "border-b-2 border-purple-500 text-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Price tab */}
            {activeTab === "price" && suggestions.price && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">AI suggested price</p>
                  <span className="text-2xl font-bold text-purple-600">
                    Rs. {suggestions.price?.suggestedPrice ?? suggestions.price}
                  </span>
                </div>
                {suggestions.price?.priceRange && (
                  <p className="text-xs text-gray-400">
                    Market range: Rs. {suggestions.price.priceRange.min} – Rs.{" "}
                    {suggestions.price.priceRange.max}
                  </p>
                )}
                <button
                  onClick={() =>
                    apply(
                      "price",
                      suggestions.price?.suggestedPrice ?? suggestions.price
                    )
                  }
                  className="w-full py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  Apply to form <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tags tab */}
            {activeTab === "tags" && suggestions.tags && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Click tags to add them to your event
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    suggestions.tags?.suggestedTags ??
                    suggestions.tags ??
                    []
                  ).map((tag, i) => {
                    const name = typeof tag === "string" ? tag : tag.name;
                    return (
                      <button
                        key={i}
                        onClick={() => apply("tag", name)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-full text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Slots tab */}
            {activeTab === "slots" && suggestions.slots && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Recommended capacity</p>
                  <span className="text-2xl font-bold text-orange-500">
                    {suggestions.slots?.suggestedSlots ?? suggestions.slots}
                  </span>
                </div>
                {suggestions.slots?.reasoning && (
                  <p className="text-xs text-gray-400">
                    {suggestions.slots.reasoning}
                  </p>
                )}
                <button
                  onClick={() =>
                    apply(
                      "slots",
                      suggestions.slots?.suggestedSlots ?? suggestions.slots
                    )
                  }
                  className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  Apply to form <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Date tab */}
            {activeTab === "date" && suggestions.date && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Best day:{" "}
                  <span className="font-semibold text-gray-700">
                    {suggestions.date?.suggestedDayOfWeek ??
                      suggestions.date?.bestDayOfWeek ??
                      "Weekend"}
                  </span>
                </p>
                <div className="space-y-2">
                  {(suggestions.date?.suggestedDates ?? [])
                    .slice(0, 3)
                    .map((d, i) => {
                      const dateStr = typeof d === "string" ? d : d.date;
                      const conf = typeof d === "object" ? d.confidence : null;
                      return (
                        <button
                          key={i}
                          onClick={() => apply("date", dateStr)}
                          className="w-full flex items-center justify-between p-2.5 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-lg text-sm transition-colors"
                        >
                          <span className="font-medium text-gray-700">
                            {new Date(dateStr).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {conf && (
                            <span className="text-xs text-blue-600 font-medium">
                              {conf}% match
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPlanningAssistant;
