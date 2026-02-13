import React from 'react';
import { Sparkles, Brain, Star, Zap, Award, CheckCircle, TrendingUp, ThumbsUp, Crown, Shield, Heart, Tag, TrendingDown, Clock } from 'lucide-react';

const AIBadge = ({ 
  score, 
  reason, 
  size = 'md', 
  showScore = true, 
  showReason = true,
  icon = 'sparkles',
  className = '',
  animate = true 
}) => {
  
  // Get badge color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-purple-500 to-indigo-500';
    if (score >= 60) return 'from-amber-500 to-yellow-500';
    return 'from-gray-500 to-slate-500';
  };

  // Get badge icon based on score or selection
  const getIcon = () => {
    if (icon === 'brain') return Brain;
    if (icon === 'star') return Star;
    if (icon === 'zap') return Zap;
    if (icon === 'award') return Award;
    if (icon === 'check') return CheckCircle;
    if (icon === 'trending') return TrendingUp;
    if (icon === 'thumbsup') return ThumbsUp;
    if (icon === 'crown') return Crown;
    if (icon === 'shield') return Shield;
    if (icon === 'heart') return Heart;
    return Sparkles;
  };

  // Get size classes
  const getSizeClasses = () => {
    switch(size) {
      case 'sm':
        return {
          badge: 'px-2 py-0.5 text-xs',
          icon: 'w-3 h-3',
          score: 'text-xs font-bold'
        };
      case 'lg':
        return {
          badge: 'px-4 py-2 text-sm',
          icon: 'w-5 h-5',
          score: 'text-lg font-bold'
        };
      default: // md
        return {
          badge: 'px-3 py-1.5 text-xs',
          icon: 'w-4 h-4',
          score: 'text-base font-bold'
        };
    }
  };

  const Icon = getIcon();
  const sizeClasses = getSizeClasses();
  const scoreColor = score ? getScoreColor(score) : 'from-purple-500 to-indigo-500';
  const animationClass = animate ? 'animate-pulse' : '';

  // If no score and no reason, show simple AI badge
  if (!score && !reason) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${sizeClasses.badge} bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-full shadow-md ${animationClass} ${className}`}>
        <Icon className={sizeClasses.icon} />
        <span>AI</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses.badge} bg-gradient-to-r ${scoreColor} text-white font-medium rounded-full shadow-md ${className}`}>
      <Icon className={sizeClasses.icon} />
      
      {showScore && score && (
        <span className={sizeClasses.score}>
          {score}%
        </span>
      )}
      
      {showReason && reason && (
        <span className="text-white/90 text-xs">
          {reason}
        </span>
      )}
      
      {!showReason && !showScore && score && (
        <span className={sizeClasses.score}>
          {score}% Match
        </span>
      )}
    </div>
  );
};

// Variant with tooltip/popover
export const AIBadgeWithTooltip = ({ score, reason, size = 'md', className = '' }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AIBadge score={score} reason={reason} size={size} showReason={false} />
      </div>
      
      {showTooltip && reason && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            {reason}
          </div>
        </div>
      )}
    </div>
  );
};

// Score-based badge with color coding
export const AIScoreBadge = ({ score, size = 'md', className = '' }) => {
  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Fair Match';
    return 'Consider Alternatives';
  };

  return (
    <AIBadge 
      score={score} 
      reason={getScoreLabel(score)} 
      size={size} 
      className={className} 
    />
  );
};

// Simple AI indicator for small spaces
export const AIIndicator = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-ping opacity-75"></div>
      <div className="relative bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full p-1">
        <Brain className="w-full h-full text-white" />
      </div>
    </div>
  );
};

// Compact badge for cards
export const AICompactBadge = ({ score, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-full ${className}`}>
      <Sparkles className="w-3 h-3 text-purple-600" />
      <span className="text-xs font-medium text-purple-700">{score ? `${score}%` : 'AI'}</span>
    </div>
  );
};

// Category badge for event types
export const AICategoryBadge = ({ category, confidence, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-full ${className}`}>
      <Tag className="w-3 h-3 text-purple-600" />
      <span className="text-xs font-medium text-purple-700">{category}</span>
      {confidence && (
        <span className="text-xs text-gray-500">({confidence}%)</span>
      )}
    </div>
  );
};

// Price prediction badge
export const AIPriceBadge = ({ predicted, original, className = '' }) => {
  const savings = original - predicted;
  const percentage = Math.round((savings / original) * 100);
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-full ${className}`}>
      <TrendingDown className="w-3 h-3 text-emerald-600" />
      <span className="text-xs font-medium text-emerald-700">Save {percentage}%</span>
      <span className="text-xs text-gray-500">(Rs. {savings})</span>
    </div>
  );
};

// Popularity badge
export const AIPopularityBadge = ({ score, className = '' }) => {
  const getPopularityLabel = (score) => {
    if (score >= 80) return '🔥 Very Popular';
    if (score >= 60) return '📈 Trending';
    if (score >= 40) return '👍 Good';
    return '🆕 New';
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full ${className}`}>
      <TrendingUp className="w-3 h-3 text-amber-600" />
      <span className="text-xs font-medium text-amber-700">{getPopularityLabel(score)}</span>
      <span className="text-xs text-gray-500">({score}%)</span>
    </div>
  );
};

// Time-based badge (Early Bird, Last Minute, etc.)
export const AITimingBadge = ({ type, className = '' }) => {
  const config = {
    'early-bird': { icon: Clock, text: 'Early Bird', color: 'from-emerald-500 to-green-500' },
    'last-minute': { icon: Zap, text: 'Last Minute', color: 'from-amber-500 to-yellow-500' },
    'flash-sale': { icon: Zap, text: 'Flash Sale', color: 'from-red-500 to-pink-500' },
    'limited': { icon: Award, text: 'Limited', color: 'from-purple-500 to-indigo-500' }
  };

  const { icon: Icon, text, color } = config[type] || config['early-bird'];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${color} text-white rounded-full ${className}`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
};

export default AIBadge;