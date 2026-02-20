// src/components/ai/organizer/OrganizerDashboardAI.jsx
import React, { useState, useEffect } from "react";
import { useOrganizerAI } from "../../../hooks/useOrganizerAI";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Calendar,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Meh,
  AlertCircle,
} from "lucide-react";
import AIBadge from "../user/AIBadge";
import AILoadingSpinner from "../user/AILoadingSpinner";

// ── Helpers ─────────────────────────────────────────────────────────────────

const fmtCurrency = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v || 0);

const fmtNum = (v) => Number(v || 0).toLocaleString();

const TrendBadge = ({ value }) => {
  if (value == null || value === 0) return null;
  const isUp = value > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-green-600" : "text-red-600"
      }`}
    >
      {isUp ? (
        <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowDown className="w-3 h-3" />
      )}
      {Math.abs(value)}%
    </span>
  );
};

const SentimentBar = ({ label, value, colorClass, icon: Icon }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-xs">
      <span className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${colorClass}`} />
        {label}
      </span>
      <span className="font-semibold">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${colorClass.replace(
          "text-",
          "bg-"
        )}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

const OrganizerDashboardAI = ({ orgId }) => {
  const {
    dashboardMetrics,
    sentimentData,
    loading,
    error,
    fetchDashboardMetrics,
    fetchSentimentAnalysis,
  } = useOrganizerAI(orgId);

  const [timeframe, setTimeframe] = useState("month");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const loadAll = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      fetchDashboardMetrics(timeframe),
      fetchSentimentAnalysis(),
    ]);
    setRefreshing(false);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading && !dashboardMetrics) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <AILoadingSpinner size="lg" />
            <p className="text-sm text-gray-500 mt-3">Loading AI insights...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error && !dashboardMetrics) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700">
            Failed to load AI insights
          </p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
          <button
            onClick={loadAll}
            className="mt-2 text-xs text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const m = dashboardMetrics;
  const s = sentimentData;

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">
            AI Dashboard Insights
          </h2>
          <AIBadge type="organizer" agent="dashboard" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAll}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* ── Key Metrics ── */}
      {m && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-green-100 rounded-xl">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <TrendBadge value={m.revenueTrend} />
              </div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                {fmtCurrency(m.totalRevenue)}
              </p>
              {m.revenueTrend !== 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  vs last {timeframe}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <TrendBadge value={m.bookingTrend} />
              </div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800">
                {fmtNum(m.totalBookings)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {m.totalEvents} events
              </p>
            </CardContent>
          </Card>

          {/* Conversion */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <TrendBadge value={m.conversionTrend} />
              </div>
              <p className="text-sm text-gray-500">Seat Conversion</p>
              <p className="text-2xl font-bold text-gray-800">
                {m.conversionRate ?? 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Seats booked / available
              </p>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-yellow-100 rounded-xl">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-800">
                {m.averageRating > 0
                  ? `${Number(m.averageRating).toFixed(1)}★`
                  : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {m.totalReviews > 0
                  ? `${fmtNum(m.totalReviews)} reviews`
                  : "No reviews yet"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Sentiment Analysis ── */}
      {s && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-base">
              Feedback Sentiment Analysis
            </CardTitle>
            {s.totalAnalyzed > 0 && (
              <span className="ml-auto text-xs text-gray-400">
                {fmtNum(s.totalAnalyzed)} reviews analysed
              </span>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall score */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">
                  Overall Sentiment
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      s.overallSentiment > 0.65
                        ? "bg-green-100 text-green-700"
                        : s.overallSentiment > 0.5
                        ? "bg-emerald-100 text-emerald-700"
                        : s.overallSentiment > 0.35
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.sentimentLabel}
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {Math.round(s.overallSentiment * 100)}%
                  </span>
                </div>
              </div>

              {/* Distribution bars */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">
                  Distribution
                </p>
                <div className="space-y-2.5">
                  <SentimentBar
                    label="Positive"
                    value={s.distribution.positive}
                    colorClass="text-green-500"
                    icon={ThumbsUp}
                  />
                  <SentimentBar
                    label="Neutral"
                    value={s.distribution.neutral}
                    colorClass="text-yellow-500"
                    icon={Meh}
                  />
                  <SentimentBar
                    label="Negative"
                    value={s.distribution.negative}
                    colorClass="text-red-500"
                    icon={ThumbsDown}
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">
                  {s.topKeywords?.length > 0
                    ? "Top Keywords / Issues"
                    : "Keywords"}
                </p>
                {s.topKeywords?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {s.topKeywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    No keyword data available yet.
                  </p>
                )}
              </div>
            </div>

            {/* AI insights list */}
            {s.insights?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  AI-Generated Insights
                </p>
                <ul className="space-y-1.5">
                  {s.insights.map((ins, i) => (
                    <li
                      key={i}
                      className="text-sm flex items-start gap-2 text-gray-600"
                    >
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Event Performance ── */}
      {m?.events?.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <CardTitle className="text-base">Event Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {m.events.map((event, i) => {
                const fillRate = event.attendanceRate ?? 0;
                const badgeColor =
                  fillRate > 80
                    ? "bg-green-100 text-green-700"
                    : fillRate > 50
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700";

                return (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {event.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}
                      >
                        {fillRate}% filled
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-400 text-xs">Revenue</p>
                        <p className="font-semibold text-gray-700">
                          {fmtCurrency(event.revenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Bookings</p>
                        <p className="font-semibold text-gray-700">
                          {fmtNum(event.bookings ?? event.attendees)}/
                          {fmtNum(event.totalSlots)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Rating</p>
                        <p className="font-semibold text-gray-700">
                          {event.rating > 0
                            ? `${Number(event.rating).toFixed(1)}★`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          fillRate > 80
                            ? "bg-green-500"
                            : fillRate > 50
                            ? "bg-yellow-500"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${fillRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── No data state ── */}
      {!m && !loading && (
        <div className="text-center py-12 text-gray-400">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No metrics available yet.</p>
          <p className="text-xs mt-1">
            Data will appear once you have events and bookings.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboardAI;
