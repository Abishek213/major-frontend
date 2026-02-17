/**
 * Fraud Detection Helper Functions
 */

/**
 * Calculate risk level from score
 * @param {number} score - Risk score (0-1)
 * @returns {Object} Risk level information
 */
export const getRiskLevel = (score) => {
  if (score > 0.8) {
    return { level: 'High', color: 'red', severity: 3 };
  }
  if (score > 0.5) {
    return { level: 'Medium', color: 'yellow', severity: 2 };
  }
  if (score > 0.3) {
    return { level: 'Low', color: 'green', severity: 1 };
  }
  return { level: 'Minimal', color: 'blue', severity: 0 };
};

/**
 * Detect anomalies in booking patterns
 * @param {Object} booking - Booking data
 * @param {Array} history - User booking history
 * @returns {Array} Detected anomalies
 */
export const detectBookingAnomalies = (booking, history) => {
  const anomalies = [];

  // Check for rapid successive bookings
  if (history && history.length > 0) {
    const lastBooking = new Date(history[0].createdAt);
    const currentBooking = new Date(booking.createdAt);
    const hoursDiff = (currentBooking - lastBooking) / (1000 * 60 * 60);
    
    if (hoursDiff < 1) {
      anomalies.push('Rapid successive bookings detected');
    }
  }

  // Check for unusual amount
  if (booking.amount > 1000) {
    anomalies.push('High-value transaction');
  }

  // Check for location mismatch
  if (booking.ipLocation && booking.billingAddress) {
    if (booking.ipLocation.country !== booking.billingAddress.country) {
      anomalies.push('IP location differs from billing address');
    }
  }

  // Check for multiple payment methods
  if (history) {
    const paymentMethods = new Set(history.map(h => h.paymentMethod));
    if (paymentMethods.size > 3) {
      anomalies.push('Multiple payment methods used');
    }
  }

  return anomalies;
};

/**
 * Calculate user risk score based on history
 * @param {Array} history - User transaction history
 * @returns {number} Risk score (0-1)
 */
export const calculateUserRiskScore = (history) => {
  if (!history || history.length === 0) return 0;

  let riskFactors = 0;
  let totalFactors = 0;

  // Failed payment attempts
  const failedAttempts = history.filter(h => h.status === 'failed').length;
  if (failedAttempts > 3) {
    riskFactors += 0.3;
    totalFactors++;
  }

  // Chargebacks
  const chargebacks = history.filter(h => h.chargeback).length;
  if (chargebacks > 0) {
    riskFactors += 0.4;
    totalFactors++;
  }

  // Account age
  const accountAge = history[0]?.createdAt ? 
    (Date.now() - new Date(history[0].createdAt)) / (1000 * 60 * 60 * 24) : 0;
  if (accountAge < 7) {
    riskFactors += 0.2;
    totalFactors++;
  }

  // Transaction frequency
  const transactionsPerDay = history.length / Math.max(accountAge, 1);
  if (transactionsPerDay > 5) {
    riskFactors += 0.3;
    totalFactors++;
  }

  return totalFactors > 0 ? riskFactors / totalFactors : 0;
};

/**
 * Validate payment details for fraud
 * @param {Object} payment - Payment details
 * @returns {Object} Validation result
 */
export const validatePayment = (payment) => {
  const issues = [];

  // Check CVV format
  if (payment.cvv && !/^\d{3,4}$/.test(payment.cvv)) {
    issues.push('Invalid CVV format');
  }

  // Check card number (Luhn algorithm)
  if (payment.cardNumber && !isValidLuhn(payment.cardNumber.replace(/\s/g, ''))) {
    issues.push('Invalid card number');
  }

  // Check expiry date
  if (payment.expiryDate) {
    const [month, year] = payment.expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiry < new Date()) {
      issues.push('Card expired');
    }
  }

  // Check amount limits
  if (payment.amount > 10000) {
    issues.push('Amount exceeds limit');
  }

  return {
    valid: issues.length === 0,
    issues,
    riskScore: issues.length * 0.2
  };
};

/**
 * Luhn algorithm for card number validation
 * @param {string} cardNumber - Card number
 * @returns {boolean} Whether card number is valid
 */
const isValidLuhn = (cardNumber) => {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Check for velocity anomalies
 * @param {Array} transactions - Recent transactions
 * @param {Object} thresholds - Velocity thresholds
 * @returns {Array} Velocity alerts
 */
export const checkVelocity = (transactions, thresholds = {
  perMinute: 5,
  perHour: 20,
  perDay: 50
}) => {
  const alerts = [];
  const now = Date.now();

  const lastMinute = transactions.filter(t => 
    now - new Date(t.timestamp).getTime() < 60000
  ).length;
  
  if (lastMinute > thresholds.perMinute) {
    alerts.push(`High transaction velocity: ${lastMinute} in last minute`);
  }

  const lastHour = transactions.filter(t => 
    now - new Date(t.timestamp).getTime() < 3600000
  ).length;
  
  if (lastHour > thresholds.perHour) {
    alerts.push(`High transaction velocity: ${lastHour} in last hour`);
  }

  const lastDay = transactions.filter(t => 
    now - new Date(t.timestamp).getTime() < 86400000
  ).length;
  
  if (lastDay > thresholds.perDay) {
    alerts.push(`High transaction velocity: ${lastDay} in last day`);
  }

  return alerts;
};

/**
 * Format fraud alert for display
 * @param {Object} alert - Raw fraud alert
 * @returns {Object} Formatted alert
 */
export const formatFraudAlert = (alert) => {
  const risk = getRiskLevel(alert.riskScore);
  
  return {
    ...alert,
    riskLevel: risk.level,
    riskColor: risk.color,
    formattedTime: new Date(alert.timestamp).toLocaleString(),
    timeAgo: getTimeAgo(alert.timestamp),
    severity: risk.severity,
    icon: risk.severity >= 3 ? '🚨' : risk.severity >= 2 ? '⚠️' : 'ℹ️'
  };
};

/**
 * Get time ago string
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Time ago string
 */
const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
};