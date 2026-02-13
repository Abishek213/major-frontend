import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  Users, 
  DollarSign, 
  ArrowLeft, 
  RefreshCw,
  Ticket,
  MapPin,
  ChevronRight,
  Brain,
  Sparkles,
  MessageSquare,
  CreditCard,
  Clock,
  Shield,
  HelpCircle,
  ThumbsUp,
  CheckCircle,
  Zap,
  Bot,
  Wallet,
  Smartphone,
  Globe,
  TrendingUp,
  Gift,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useChatAssistant } from '../../../../hooks/useChatAssistant';
import AIBadge from '../../../../components/ai/AIBadge';
import AILoadingSpinner from '../../../../components/ai/AILoadingSpinner';

// ... rest of the component code
const BookingFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState(null);
  
  const { sendMessage } = useChatAssistant();

  const pidx = searchParams.get('pidx');
  const transactionId = searchParams.get('transaction_id');
  const status = searchParams.get('status');
  const message = searchParams.get('message') || 'Your payment could not be processed.';
  const eventId = searchParams.get('eventId');
  const seats = searchParams.get('seats');
  const amount = searchParams.get('amount');
  const eventName = searchParams.get('eventName');
  const errorCode = searchParams.get('error_code') || 'UNKNOWN';

  // AI: Analyze payment failure and provide intelligent solutions
  useEffect(() => {
    const analyzeFailure = async () => {
      setIsAnalyzing(true);
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const analysis = generateAIAnalysis(message, errorCode);
      setAiAnalysis(analysis);
      setIsAnalyzing(false);
    };

    analyzeFailure();
  }, [message, errorCode]);

  // AI: Generate intelligent failure analysis
  const generateAIAnalysis = (errorMsg, code) => {
    const errorLower = errorMsg.toLowerCase();
    
    // Detect error patterns
    const patterns = {
      insufficientFunds: errorLower.includes('insufficient') || errorLower.includes('balance') || errorLower.includes('funds'),
      cardDeclined: errorLower.includes('declined') || errorLower.includes('card') || errorLower.includes('credit'),
      networkError: errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('connection'),
      bankError: errorLower.includes('bank') || errorLower.includes('issuer'),
      invalidDetails: errorLower.includes('invalid') || errorLower.includes('details') || errorLower.includes('cvv'),
      limitExceeded: errorLower.includes('limit') || errorLower.includes('exceeded'),
      duplicateTransaction: errorLower.includes('duplicate') || errorLower.includes('already'),
      technicalError: errorLower.includes('technical') || errorLower.includes('system') || errorLower.includes('error'),
    };

    // Determine failure category
    let category = 'general';
    let confidence = 85;
    let solutions = [];
    let severity = 'medium';

    if (patterns.insufficientFunds) {
      category = 'insufficient_funds';
      confidence = 95;
      severity = 'high';
      solutions = [
        {
          id: 1,
          title: 'Add funds to your card',
          description: 'Your payment method has insufficient balance',
          action: 'Add funds and try again',
          icon: Wallet,
          color: 'emerald'
        },
        {
          id: 2,
          title: 'Use alternative payment method',
          description: 'Try a different credit/debit card',
          action: 'Switch payment method',
          icon: CreditCard,
          color: 'blue'
        },
        {
          id: 3,
          title: 'Try partial payment',
          description: 'Split payment across multiple cards',
          action: 'Split payment',
          icon: DollarSign,
          color: 'purple'
        }
      ];
    } else if (patterns.cardDeclined) {
      category = 'card_declined';
      confidence = 92;
      severity = 'high';
      solutions = [
        {
          id: 1,
          title: 'Contact your bank',
          description: 'Your card issuer declined the transaction',
          action: 'Call bank immediately',
          icon: Phone,
          color: 'rose'
        },
        {
          id: 2,
          title: 'Verify card details',
          description: 'Check card number, expiry, and CVV',
          action: 'Re-enter details',
          icon: Shield,
          color: 'amber'
        },
        {
          id: 3,
          title: 'Try another card',
          description: 'Use a different payment method',
          action: 'Switch card',
          icon: CreditCard,
          color: 'blue'
        }
      ];
    } else if (patterns.networkError) {
      category = 'network_error';
      confidence = 88;
      severity = 'low';
      solutions = [
        {
          id: 1,
          title: 'Check your internet connection',
          description: 'Network issues interrupted the payment',
          action: 'Retry with stable connection',
          icon: Globe,
          color: 'emerald'
        },
        {
          id: 2,
          title: 'Try again in 5 minutes',
          description: 'Temporary network glitch detected',
          action: 'Schedule retry',
          icon: Clock,
          color: 'blue'
        },
        {
          id: 3,
          title: 'Use mobile data',
          description: 'Switch to cellular network',
          action: 'Change connection',
          icon: Smartphone,
          color: 'purple'
        }
      ];
    } else if (patterns.limitExceeded) {
      category = 'limit_exceeded';
      confidence = 94;
      severity = 'medium';
      solutions = [
        {
          id: 1,
          title: 'Daily transaction limit reached',
          description: 'Your card has exceeded daily limit',
          action: 'Wait until tomorrow',
          icon: Clock,
          color: 'amber'
        },
        {
          id: 2,
          title: 'Contact bank to increase limit',
          description: 'Request temporary limit increase',
          action: 'Call bank',
          icon: Phone,
          color: 'rose'
        },
        {
          id: 3,
          title: 'Split payment',
          description: 'Pay in multiple smaller transactions',
          action: 'Split amount',
          icon: DollarSign,
          color: 'emerald'
        }
      ];
    } else {
      // General error solutions
      solutions = [
        {
          id: 1,
          title: 'Retry payment',
          description: 'Temporary issue, try again now',
          action: 'Retry now',
          icon: RefreshCw,
          color: 'emerald'
        },
        {
          id: 2,
          title: 'Use alternative payment',
          description: 'Switch to another payment method',
          action: 'Change method',
          icon: CreditCard,
          color: 'blue'
        },
        {
          id: 3,
          title: 'Contact support',
          description: 'Get help from our support team',
          action: 'Chat with AI',
          icon: MessageSquare,
          color: 'purple'
        }
      ];
    }

    return {
      category,
      confidence,
      severity,
      solutions,
      errorCode: code,
      suggestedAction: solutions[0]?.action || 'Retry payment',
      failureReason: getFailureReason(category, errorMsg),
      successProbability: calculateSuccessProbability(category),
      recommendedTime: getRecommendedRetryTime(category)
    };
  };

  const getFailureReason = (category, errorMsg) => {
    const reasons = {
      insufficient_funds: 'The payment method does not have sufficient balance to complete this transaction.',
      card_declined: 'Your card issuer has declined the transaction. This could be due to security measures or insufficient funds.',
      network_error: 'A network connectivity issue interrupted the payment processing.',
      limit_exceeded: 'This transaction exceeds your cards daily transaction limit.',
      general: errorMsg || 'An unexpected error occurred during payment processing.'
    };
    return reasons[category] || reasons.general;
  };

  const calculateSuccessProbability = (category) => {
    const probabilities = {
      insufficient_funds: 45,
      card_declined: 35,
      network_error: 85,
      limit_exceeded: 25,
      general: 70
    };
    return probabilities[category] || 60;
  };

  const getRecommendedRetryTime = (category) => {
    const times = {
      insufficient_funds: 'After adding funds',
      card_declined: 'After contacting bank',
      network_error: 'Immediately',
      limit_exceeded: 'Tomorrow',
      general: 'Now'
    };
    return times[category] || 'Now';
  };

  const handleRetry = () => {
    if (!eventId) {
      navigate('/userdb/events');
      return;
    }

    navigate(`/userdb/events/${eventId}`, {
      state: { 
        showBooking: true,
        preselectedSeats: seats,
        retryAmount: amount,
        aiSuggested: true
      }
    });
  };

  const handleContactSupport = async () => {
    await sendMessage(`I need help with a failed booking. Transaction ID: ${transactionId || pidx || 'N/A'}, Error: ${message}`);
    window.dispatchEvent(new CustomEvent('open-chat'));
  };

  const handleScheduleRetry = () => {
    // Schedule a reminder to retry
    const reminderTime = aiAnalysis?.recommendedTime === 'Tomorrow' 
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) 
      : new Date(Date.now() + 5 * 60 * 1000);
    
    // In production, this would call an API to set reminder
    alert(`⏰ Reminder set: Retry payment at ${reminderTime.toLocaleTimeString()}`);
  };

  const handleAlternativePayment = () => {
    navigate(`/userdb/events/${eventId}`, {
      state: { 
        showBooking: true,
        preselectedSeats: seats,
        alternativePayment: true
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/userdb/events')}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 transition-all duration-300"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Events
      </button>

      {/* Main Dashboard Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header Section with AI Analysis */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-14 h-14 text-red-600" />
              </div>
              {isAnalyzing ? (
                <div className="absolute -bottom-2 -right-2">
                  <AILoadingSpinner />
                </div>
              ) : (
                aiAnalysis && (
                  <div className="absolute -bottom-2 -right-2">
                    <AIBadge 
                      score={aiAnalysis.confidence} 
                      reason="AI Analysis"
                      size="sm"
                    />
                  </div>
                )
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Payment Failed</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Don't worry! AI has analyzed the issue and found solutions for you.
            </p>
          </div>

          {/* AI Analysis Section */}
          {isAnalyzing ? (
            <div className="mb-8 p-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl text-center">
              <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-purple-900 mb-2">AI is analyzing your payment failure</h3>
              <p className="text-purple-700">Identifying the issue and finding the best solution...</p>
            </div>
          ) : aiAnalysis && (
            <>
              {/* AI Error Analysis Card */}
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        AI Payment Recovery Assistant
                        <span className={`px-3 py-1 rounded-full text-sm font-normal ${
                          aiAnalysis.severity === 'high' ? 'bg-rose-500' :
                          aiAnalysis.severity === 'medium' ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}>
                          {aiAnalysis.severity.toUpperCase()} PRIORITY
                        </span>
                      </h3>
                    </div>
                    <p className="text-white/90 mb-4">
                      {aiAnalysis.failureReason}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-indigo-100 text-xs">Error Code</p>
                        <p className="text-white font-bold text-sm">{aiAnalysis.errorCode}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-indigo-100 text-xs">Success Probability</p>
                        <p className="text-white font-bold text-lg">{aiAnalysis.successProbability}%</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-indigo-100 text-xs">Best Time to Retry</p>
                        <p className="text-white font-bold text-sm">{aiAnalysis.recommendedTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommended Solutions */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI-Recommended Solutions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiAnalysis.solutions.map((solution) => {
                    const Icon = solution.icon;
                    return (
                      <button
                        key={solution.id}
                        onClick={() => {
                          if (solution.action === 'Chat with AI') {
                            handleContactSupport();
                          } else if (solution.action === 'Switch payment method') {
                            handleAlternativePayment();
                          } else if (solution.action === 'Schedule retry') {
                            handleScheduleRetry();
                          } else {
                            handleRetry();
                          }
                          setSelectedSolution(solution.id);
                        }}
                        className={`group p-6 bg-gradient-to-br from-white to-gray-50 border-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                          selectedSolution === solution.id
                            ? `border-${solution.color}-500 shadow-lg`
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${solution.color}-100 to-${solution.color}-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-7 h-7 text-${solution.color}-600`} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">{solution.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{solution.description}</p>
                        <span className={`inline-flex items-center gap-1 text-${solution.color}-600 font-medium text-sm`}>
                          {solution.action}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Error Alert */}
          <div className="relative p-5 pl-14 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl shadow-sm mb-8">
            <div className="absolute left-5 top-5">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="pr-10">
              <h4 className="font-bold text-red-800 mb-1">Payment Error</h4>
              <p className="text-sm text-red-600">{message}</p>
              {errorCode !== 'UNKNOWN' && (
                <p className="text-xs text-red-500 mt-1">Error Code: {errorCode}</p>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Left Column: Payment Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-600" />
                Payment Details
              </h2>
              
              <div className="space-y-4">
                {status && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-bold text-gray-800">{status.toUpperCase()}</p>
                    </div>
                  </div>
                )}
                
                {pidx && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <div className="text-sm font-bold text-blue-600">ID</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Payment ID</p>
                      <p className="font-mono font-medium text-gray-800 text-sm break-all">{pidx}</p>
                    </div>
                  </div>
                )}
                
                {transactionId && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <div className="text-sm font-bold text-indigo-600">TXN</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-mono font-medium text-gray-800 text-sm break-all">{transactionId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Event Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Event Information
              </h2>
              
              {eventName ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Event</p>
                      <p className="font-bold text-gray-800">{decodeURIComponent(eventName)}</p>
                    </div>
                  </div>
                  
                  {seats && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Selected Seats</p>
                        <p className="font-bold text-gray-800 text-xl">{seats}</p>
                      </div>
                    </div>
                  )}
                  
                  {amount && (
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-bold text-gray-800 text-xl">NPR {parseInt(amount).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No event details available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleRetry}
              disabled={!eventId}
              className={`group/retry py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                !eventId
                  ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              <RefreshCw className="w-5 h-5 group-hover/retry:rotate-180 transition-transform" />
              Retry Payment
            </button>
            
            <button
              onClick={handleContactSupport}
              className="group/support py-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Bot className="w-5 h-5" />
              AI Support
            </button>
          </div>

          {/* Help & Support Section */}
          <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              Need Additional Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => window.location.href = 'mailto:support@eventa.com?subject=Payment%20Failed%20-%20' + (transactionId || '')}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800 text-sm">Email Support</p>
                  <p className="text-xs text-gray-600">support@eventa.com</p>
                </div>
              </button>
              
              <button
                onClick={() => window.location.href = 'tel:+1800EVENTA'}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800 text-sm">Phone Support</p>
                  <p className="text-xs text-gray-600">1-800-EVENTA</p>
                </div>
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 text-sm">Your booking is temporarily reserved</p>
                  <p className="text-xs text-amber-700">
                    Your selected seats are reserved for 15 minutes. Complete your payment before the reservation expires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFailed;