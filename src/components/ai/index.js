// src/components/ai/index.js

// Main AI Components
export { default as RecommendationSection } from './RecommendationSection';
export { default as ChatAssistant } from './ChatAssistant';
export { default as FAQViewer } from './FAQViewer';
export { default as EventRequestAssistant } from './EventRequestAssistant';
export { default as AIBadge } from './AIBadge';
export { default as AILoadingSpinner } from './AILoadingSpinner';

// Organizer AI Components
export { default as EventPlanningAssistant } from './organizer/EventPlanningAssistant';
export { default as NegotiationAssistant } from './organizer/NegotiationAssistant';
export { default as OrganizerDashboardAI } from './organizer/OrganizerDashboardAI';
export { default as PriceSuggestion } from './organizer/PriceSuggestion';
export { default as TagRecommender } from './organizer/TagRecommender';
export { default as OfferCompetitorAnalysis } from './organizer/OfferCompetitorAnalysis';

// Admin AI Components
export { default as FraudDetectionPanel } from './admin/FraudDetectionPanel';
export { default as FraudAlertModal } from './admin/FraudAlertModal';
export { default as AnalyticsDashboardAI } from './admin/AnalyticsDashboardAI';
export { default as TrendVisualization } from './admin/TrendVisualization';
export { default as SentimentAnalysisPanel } from './admin/SentimentAnalysisPanel';
export { default as ToxicityModeration } from './admin/ToxicityModeration';
export { default as CohortAnalysisView } from './admin/CohortAnalysisView';