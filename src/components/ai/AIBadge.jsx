import React from 'react';
import { 
  Sparkles, 
  Brain, 
  Star, 
  Zap, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  ThumbsUp, 
  Crown, 
  Shield, 
  Heart, 
  Tag, 
  TrendingDown, 
  Clock,
  Bot,
  AlertTriangle,
  BarChart3,
  MessageCircle,
  Calendar,
  DollarSign,
  Users,
  Target,
  Activity,
  Gauge,
  Rocket,
  Lightbulb,
  Shield as ShieldIcon,
  AlertCircle,
  Fingerprint,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ThumbsDown,
  Minus,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const AIBadge = ({ 
  score, 
  reason, 
  size = 'md', 
  showScore = true, 
  showReason = true,
  icon = 'sparkles',
  type = 'default', // 'organizer', 'admin', 'fraud', 'analytics', 'sentiment', 'planning', 'negotiation', 'dashboard'
  agent = null,
  className = '',
  animate = true,
  confidence = null,
  variant = 'default' // 'default', 'outline', 'ghost'
}) => {
  
  // Get badge color based on score or type
  const getScoreColor = (score) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-purple-500 to-indigo-500';
    if (score >= 60) return 'from-amber-500 to-yellow-500';
    return 'from-gray-500 to-slate-500';
  };

  // Get color based on agent type
  const getAgentColor = (agent) => {
    const colors = {
      // Admin agents
      'fraud': 'from-red-500 to-rose-500',
      'analytics': 'from-blue-500 to-cyan-500',
      'sentiment': 'from-purple-500 to-pink-500',
      
      // Organizer agents
      'planning': 'from-emerald-500 to-green-500',
      'negotiation': 'from-amber-500 to-orange-500',
      'dashboard': 'from-indigo-500 to-violet-500',
      
      // User agents
      'recommendations': 'from-pink-500 to-rose-500',
      'assistant': 'from-cyan-500 to-teal-500',
      
      // Default
      'all': 'from-purple-500 to-indigo-500'
    };
    return colors[agent] || 'from-purple-500 to-indigo-500';
  };

  // Get badge icon based on agent type
  const getAgentIcon = (agent) => {
    const icons = {
      // Admin agents
      'fraud': Shield,
      'analytics': BarChart3,
      'sentiment': MessageCircle,
      
      // Organizer agents
      'planning': Calendar,
      'negotiation': DollarSign,
      'dashboard': Activity,
      
      // User agents
      'recommendations': Star,
      'assistant': Bot,
      
      // Default
      'all': Brain
    };
    return icons[agent] || Sparkles;
  };

  // Get badge icon based on selection or agent
  const getIcon = () => {
    if (agent) return getAgentIcon(agent);
    
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
    if (icon === 'alert') return AlertTriangle;
    if (icon === 'bot') return Bot;
    if (icon === 'gauge') return Gauge;
    if (icon === 'rocket') return Rocket;
    if (icon === 'lightbulb') return Lightbulb;
    
    return Sparkles;
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch(variant) {
      case 'outline':
        return 'bg-transparent border-2 border-current';
      case 'ghost':
        return 'bg-transparent hover:bg-opacity-10';
      default:
        return '';
    }
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
  const bgColor = agent ? getAgentColor(agent) : (score ? getScoreColor(score) : 'from-purple-500 to-indigo-500');
  const animationClass = animate ? 'animate-pulse' : '';
  const variantClass = getVariantStyles();

  // Get agent label
  const getAgentLabel = () => {
    if (!agent) return 'AI';
    
    const labels = {
      'fraud': 'Fraud Agent',
      'analytics': 'Analytics Agent',
      'sentiment': 'Sentiment Agent',
      'planning': 'Planning Agent',
      'negotiation': 'Negotiation Agent',
      'dashboard': 'Dashboard Agent',
      'recommendations': 'Recommendations',
      'assistant': 'Assistant',
      'all': 'AI'
    };
    return labels[agent] || 'AI';
  };

  // If no score and no reason, show simple AI badge with agent type
  if (!score && !reason) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${sizeClasses.badge} bg-gradient-to-r ${bgColor} text-white font-medium rounded-full shadow-md ${animationClass} ${variantClass} ${className}`}>
        <Icon className={sizeClasses.icon} />
        <span>{getAgentLabel()}</span>
        {confidence && (
          <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
            {confidence}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses.badge} bg-gradient-to-r ${bgColor} text-white font-medium rounded-full shadow-md ${variantClass} ${className}`}>
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

      {confidence && !score && (
        <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
          {confidence}%
        </span>
      )}
    </div>
  );
};

// Variant with tooltip/popover
export const AIBadgeWithTooltip = ({ score, reason, size = 'md', agent = null, className = '' }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <AIBadge score={score} reason={reason} size={size} agent={agent} showReason={false} />
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
export const AIScoreBadge = ({ score, size = 'md', agent = null, className = '' }) => {
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
      agent={agent}
      className={className} 
    />
  );
};

// Simple AI indicator for small spaces
export const AIIndicator = ({ size = 'sm', agent = null, className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getAgentBg = () => {
    const colors = {
      'fraud': 'from-red-500 to-rose-500',
      'analytics': 'from-blue-500 to-cyan-500',
      'sentiment': 'from-purple-500 to-pink-500',
      'planning': 'from-emerald-500 to-green-500',
      'negotiation': 'from-amber-500 to-orange-500',
      'dashboard': 'from-indigo-500 to-violet-500',
    };
    return colors[agent] || 'from-purple-500 to-indigo-500';
  };

  const getAgentIcon = () => {
    const icons = {
      'fraud': Shield,
      'analytics': BarChart3,
      'sentiment': MessageCircle,
      'planning': Calendar,
      'negotiation': DollarSign,
      'dashboard': Activity,
    };
    const Icon = icons[agent] || Brain;
    return <Icon className="w-full h-full text-white" />;
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${getAgentBg()} rounded-full animate-ping opacity-75`}></div>
      <div className={`relative bg-gradient-to-r ${getAgentBg()} rounded-full p-1`}>
        {getAgentIcon()}
      </div>
    </div>
  );
};

// Compact badge for cards
export const AICompactBadge = ({ score, agent = null, className = '' }) => {
  const getAgentBg = () => {
    const colors = {
      'fraud': 'from-red-100 to-rose-100 border-red-200 text-red-700',
      'analytics': 'from-blue-100 to-cyan-100 border-blue-200 text-blue-700',
      'sentiment': 'from-purple-100 to-pink-100 border-purple-200 text-purple-700',
      'planning': 'from-emerald-100 to-green-100 border-emerald-200 text-emerald-700',
      'negotiation': 'from-amber-100 to-orange-100 border-amber-200 text-amber-700',
      'dashboard': 'from-indigo-100 to-violet-100 border-indigo-200 text-indigo-700',
    };
    return colors[agent] || 'from-purple-100 to-indigo-100 border-purple-200 text-purple-700';
  };

  const getAgentIcon = () => {
    const icons = {
      'fraud': Shield,
      'analytics': BarChart3,
      'sentiment': MessageCircle,
      'planning': Calendar,
      'negotiation': DollarSign,
      'dashboard': Activity,
    };
    const Icon = icons[agent] || Sparkles;
    return <Icon className={`w-3 h-3 ${agent ? `text-${agent}-600` : 'text-purple-600'}`} />;
  };

  const bgClasses = getAgentBg().split(' ');

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r ${bgClasses[0]} ${bgClasses[1]} border ${bgClasses[2]} rounded-full ${className}`}>
      {getAgentIcon()}
      <span className={`text-xs font-medium ${bgClasses[3]}`}>
        {score ? `${score}%` : agent ? agent.charAt(0).toUpperCase() + agent.slice(1) : 'AI'}
      </span>
    </div>
  );
};

// Category badge for event types
export const AICategoryBadge = ({ category, confidence, agent = null, className = '' }) => {
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
export const AIPriceBadge = ({ predicted, original, agent = 'planning', className = '' }) => {
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
export const AIPopularityBadge = ({ score, agent = 'analytics', className = '' }) => {
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
export const AITimingBadge = ({ type, agent = 'planning', className = '' }) => {
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

// Fraud Risk Badge
export const AIRiskBadge = ({ score, size = 'md', className = '' }) => {
  const getRiskLevel = (score) => {
    if (score >= 0.8) return { label: 'High Risk', color: 'from-red-500 to-rose-500', icon: AlertTriangle };
    if (score >= 0.5) return { label: 'Medium Risk', color: 'from-amber-500 to-yellow-500', icon: AlertCircle };
    if (score >= 0.3) return { label: 'Low Risk', color: 'from-blue-500 to-cyan-500', icon: Shield };
    return { label: 'Safe', color: 'from-emerald-500 to-green-500', icon: CheckCircle };
  };

  const { label, color, icon: Icon } = getRiskLevel(score);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r ${color} text-white rounded-full text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
      <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">{Math.round(score * 100)}%</span>
    </div>
  );
};

// Sentiment Badge
export const AISentimentBadge = ({ score, size = 'md', className = '' }) => {
  const getSentiment = (score) => {
    if (score > 0.5) return { label: 'Positive', color: 'from-emerald-500 to-green-500', icon: ThumbsUp };
    if (score > -0.5) return { label: 'Neutral', color: 'from-gray-500 to-slate-500', icon: Minus };
    return { label: 'Negative', color: 'from-red-500 to-rose-500', icon: ThumbsDown };
  };

  const { label, color, icon: Icon } = getSentiment(score);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r ${color} text-white rounded-full text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
      <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">{Math.round(score * 100)}%</span>
    </div>
  );
};

// Agent Type Badge
export const AIAgentBadge = ({ agent, confidence = null, size = 'md', className = '' }) => {
  const agentConfig = {
    'fraud': { label: 'Fraud Detection', icon: Shield, color: 'from-red-500 to-rose-500' },
    'analytics': { label: 'Analytics', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
    'sentiment': { label: 'Sentiment', icon: MessageCircle, color: 'from-purple-500 to-pink-500' },
    'planning': { label: 'Event Planning', icon: Calendar, color: 'from-emerald-500 to-green-500' },
    'negotiation': { label: 'Negotiation', icon: DollarSign, color: 'from-amber-500 to-orange-500' },
    'dashboard': { label: 'Dashboard', icon: Activity, color: 'from-indigo-500 to-violet-500' },
    'recommendations': { label: 'Recommendations', icon: Star, color: 'from-pink-500 to-rose-500' },
    'assistant': { label: 'Assistant', icon: Bot, color: 'from-cyan-500 to-teal-500' }
  };

  const config = agentConfig[agent] || agentConfig['dashboard'];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r ${config.color} text-white rounded-full text-xs font-medium shadow-sm ${className}`}>
      <config.icon className="w-3 h-3" />
      <span>{config.label}</span>
      {confidence && (
        <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">{confidence}%</span>
      )}
    </div>
  );
};

export default AIBadge;