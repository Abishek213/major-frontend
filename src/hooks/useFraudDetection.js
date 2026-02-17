import { useState, useEffect, useCallback } from 'react';
import fraudDetectionService from '../services/fraudDetectionService';
import { detectBookingAnomalies, calculateUserRiskScore, validatePayment } from '../utils/fraudHelpers';

export const useFraudDetection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('low');
  const [anomalies, setAnomalies] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [userRiskProfiles, setUserRiskProfiles] = useState({});

  /**
   * Analyze a single booking for fraud
   */
  const analyzeBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      // First do client-side analysis
      const clientAnalysis = await analyzeBookingLocally(bookingData);
      
      // Then get server-side analysis
      const serverAnalysis = await fraudDetectionService.checkBooking(bookingData);
      
      const combinedAnalysis = {
        ...clientAnalysis,
        ...serverAnalysis,
        timestamp: new Date().toISOString()
      };

      // Update state based on analysis
      setRiskScore(combinedAnalysis.riskScore);
      setRiskLevel(getRiskLevelFromScore(combinedAnalysis.riskScore));
      setAnomalies(combinedAnalysis.anomalies || []);

      // If high risk, create alert
      if (combinedAnalysis.riskScore > 0.7) {
        const newAlert = {
          id: `alert_${Date.now()}`,
          bookingId: bookingData.bookingId,
          riskScore: combinedAnalysis.riskScore,
          anomalies: combinedAnalysis.anomalies,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        setFraudAlerts(prev => [newAlert, ...prev]);
      }

      return combinedAnalysis;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Local client-side fraud analysis
   */
  const analyzeBookingLocally = async (bookingData) => {
    const anomalies = [];
    let riskScore = 0;

    // Check for suspicious patterns in current booking
    if (bookingData.amount > 5000) {
      anomalies.push('High-value transaction');
      riskScore += 0.2;
    }

    if (bookingData.quantity > 10) {
      anomalies.push('Bulk purchase detected');
      riskScore += 0.15;
    }

    // Check against transaction history
    if (transactionHistory.length > 0) {
      const userHistory = transactionHistory.filter(
        t => t.userId === bookingData.userId
      );

      if (userHistory.length > 0) {
        const userRisk = calculateUserRiskScore(userHistory);
        riskScore += userRisk * 0.3;

        // Check for rapid successive bookings
        const lastBooking = userHistory[0];
        if (lastBooking) {
          const timeSinceLast = Date.now() - new Date(lastBooking.timestamp).getTime();
          if (timeSinceLast < 5 * 60 * 1000) { // 5 minutes
            anomalies.push('Rapid successive booking detected');
            riskScore += 0.25;
          }
        }
      }
    }

    // Payment validation
    if (bookingData.payment) {
      const paymentValidation = validatePayment(bookingData.payment);
      if (!paymentValidation.valid) {
        anomalies.push(...paymentValidation.issues);
        riskScore += paymentValidation.riskScore;
      }
    }

    // IP and location checks
    if (bookingData.ipAddress && bookingData.location) {
      // Check for VPN/proxy (simplified)
      if (isSuspiciousIP(bookingData.ipAddress)) {
        anomalies.push('Suspicious IP address detected');
        riskScore += 0.2;
      }

      // Check location mismatch
      if (bookingData.ipLocation && bookingData.billingAddress) {
        if (bookingData.ipLocation.country !== bookingData.billingAddress.country) {
          anomalies.push('IP location differs from billing address');
          riskScore += 0.3;
        }
      }
    }

    return {
      riskScore: Math.min(riskScore, 1),
      anomalies,
      clientAnalysis: true
    };
  };

  /**
   * Monitor transactions in real-time
   */
  const startMonitoring = useCallback((callback) => {
    setMonitoringActive(true);
    
    const wsCleanup = fraudDetectionService.startMonitoring((data) => {
      // Process real-time fraud alerts
      if (data.type === 'fraud_alert') {
        setFraudAlerts(prev => [data.alert, ...prev]);
        if (callback) callback(data.alert);
      }
      
      // Update transaction history
      if (data.type === 'new_transaction') {
        setTransactionHistory(prev => [data.transaction, ...prev]);
      }
    });

    return wsCleanup;
  }, []);

  /**
   * Stop real-time monitoring
   */
  const stopMonitoring = useCallback(() => {
    setMonitoringActive(false);
  }, []);

  /**
   * Get user risk profile
   */
  const getUserRiskProfile = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // Check cache first
      if (userRiskProfiles[userId]) {
        return userRiskProfiles[userId];
      }

      const profile = await fraudDetectionService.getUserRiskProfile(userId);
      
      // Calculate additional risk factors
      const userTransactions = transactionHistory.filter(t => t.userId === userId);
      const userRiskScore = calculateUserRiskScore(userTransactions);
      
      const enhancedProfile = {
        ...profile,
        calculatedRiskScore: userRiskScore,
        riskLevel: getRiskLevelFromScore(userRiskScore),
        transactionCount: userTransactions.length,
        lastAnalyzed: new Date().toISOString()
      };

      // Cache the profile
      setUserRiskProfiles(prev => ({
        ...prev,
        [userId]: enhancedProfile
      }));

      return enhancedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactionHistory, userRiskProfiles]);

  /**
   * Validate payment transaction
   */
  const validateTransaction = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      // Client-side validation
      const clientValidation = validatePayment(paymentData);
      
      if (!clientValidation.valid) {
        return {
          valid: false,
          issues: clientValidation.issues,
          riskScore: clientValidation.riskScore
        };
      }

      // Server-side validation
      const serverValidation = await fraudDetectionService.validatePayment(paymentData);
      
      // Check transaction velocity
      const recentTransactions = transactionHistory.filter(t => 
        t.userId === paymentData.userId && 
        Date.now() - new Date(t.timestamp).getTime() < 3600000 // Last hour
      );

      if (recentTransactions.length > 5) {
        return {
          valid: false,
          issues: ['Transaction velocity exceeded'],
          riskScore: 0.8
        };
      }

      return {
        valid: serverValidation.valid,
        issues: serverValidation.issues || [],
        riskScore: serverValidation.riskScore || 0
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactionHistory]);

  /**
   * Get transaction patterns for analysis
   */
  const getTransactionPatterns = useCallback(async (userId, timeframe = '7d') => {
    setLoading(true);
    setError(null);
    try {
      const patterns = await fraudDetectionService.getTransactionPatterns(userId);
      
      // Enhance with local data
      const userTransactions = transactionHistory.filter(t => t.userId === userId);
      
      const enhancedPatterns = {
        ...patterns,
        localTransactions: userTransactions.length,
        averageAmount: calculateAverageAmount(userTransactions),
        peakHours: findPeakHours(userTransactions),
        commonLocations: findCommonLocations(userTransactions)
      };

      return enhancedPatterns;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactionHistory]);

  /**
   * Resolve a fraud alert
   */
  const resolveAlert = useCallback((alertId, resolution, notes = '') => {
    setFraudAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'resolved',
              resolution,
              notes,
              resolvedAt: new Date().toISOString()
            }
          : alert
      )
    );
  }, []);

  /**
   * Clear all fraud alerts
   */
  const clearAlerts = useCallback(() => {
    setFraudAlerts([]);
  }, []);

  /**
   * Update transaction history
   */
  const addTransaction = useCallback((transaction) => {
    setTransactionHistory(prev => [transaction, ...prev].slice(0, 100)); // Keep last 100
  }, []);

  /**
   * Get risk statistics
   */
  const getRiskStatistics = useCallback(() => {
    const totalTransactions = transactionHistory.length;
    const highRiskTransactions = transactionHistory.filter(t => t.riskScore > 0.7).length;
    const suspiciousTransactions = fraudAlerts.length;

    return {
      totalTransactions,
      highRiskTransactions,
      suspiciousTransactions,
      riskPercentage: totalTransactions > 0 
        ? (highRiskTransactions / totalTransactions) * 100 
        : 0,
      averageRiskScore: calculateAverageRiskScore(transactionHistory),
      alertsByLevel: {
        high: fraudAlerts.filter(a => a.riskScore > 0.8).length,
        medium: fraudAlerts.filter(a => a.riskScore > 0.5 && a.riskScore <= 0.8).length,
        low: fraudAlerts.filter(a => a.riskScore <= 0.5).length
      }
    };
  }, [transactionHistory, fraudAlerts]);

  /**
   * Helper function to get risk level from score
   */
  const getRiskLevelFromScore = (score) => {
    if (score > 0.8) return 'critical';
    if (score > 0.6) return 'high';
    if (score > 0.4) return 'medium';
    if (score > 0.2) return 'low';
    return 'minimal';
  };

  /**
   * Helper function to check suspicious IP
   */
  const isSuspiciousIP = (ip) => {
    // This would typically check against a database of known VPN/proxy IPs
    // Simplified version
    const suspiciousRanges = [
      '10.', '192.168.', '172.16.' // Private IPs
    ];
    return suspiciousRanges.some(range => ip.startsWith(range));
  };

  /**
   * Helper function to calculate average amount
   */
  const calculateAverageAmount = (transactions) => {
    if (transactions.length === 0) return 0;
    const sum = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    return sum / transactions.length;
  };

  /**
   * Helper function to find peak transaction hours
   */
  const findPeakHours = (transactions) => {
    const hours = transactions.map(t => new Date(t.timestamp).getHours());
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
  };

  /**
   * Helper function to find common locations
   */
  const findCommonLocations = (transactions) => {
    const locations = transactions.map(t => t.location).filter(Boolean);
    const locationCounts = locations.reduce((acc, loc) => {
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([location, count]) => ({ location, count }));
  };

  /**
   * Helper function to calculate average risk score
   */
  const calculateAverageRiskScore = (transactions) => {
    if (transactions.length === 0) return 0;
    const sum = transactions.reduce((acc, t) => acc + (t.riskScore || 0), 0);
    return sum / transactions.length;
  };

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringActive) {
        stopMonitoring();
      }
    };
  }, [monitoringActive, stopMonitoring]);

  return {
    // State
    loading,
    error,
    riskScore,
    riskLevel,
    anomalies,
    fraudAlerts,
    monitoringActive,
    transactionHistory,
    userRiskProfiles,

    // Core functions
    analyzeBooking,
    startMonitoring,
    stopMonitoring,
    getUserRiskProfile,
    validateTransaction,
    getTransactionPatterns,
    resolveAlert,
    clearAlerts,
    addTransaction,
    getRiskStatistics,

    // Utility functions
    getRiskLevelFromScore
  };
};

/**
 * Hook for real-time fraud monitoring specifically
 */
export const useFraudMonitoring = () => {
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  const startMonitoring = useCallback((onAlert) => {
    setConnected(true);
    
    const ws = new WebSocket(process.env.REACT_APP_WS_URL + '/fraud-live');
    
    ws.onopen = () => {
      console.log('Connected to fraud monitoring');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveAlerts(prev => [data, ...prev].slice(0, 50)); // Keep last 50
      if (onAlert) onAlert(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => ws.close();
  }, []);

  const clearLiveAlerts = useCallback(() => {
    setLiveAlerts([]);
  }, []);

  return {
    liveAlerts,
    connected,
    startMonitoring,
    clearLiveAlerts
  };
};

/**
 * Hook for batch fraud analysis
 */
export const useBatchFraudAnalysis = () => {
  const [batchResults, setBatchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const analyzeBatch = useCallback(async (transactions, onProgress) => {
    setLoading(true);
    setProgress(0);
    const results = [];

    for (let i = 0; i < transactions.length; i++) {
      try {
        const result = await fraudDetectionService.checkBooking(transactions[i]);
        results.push({
          ...result,
          transactionId: transactions[i].id,
          index: i
        });

        const newProgress = ((i + 1) / transactions.length) * 100;
        setProgress(newProgress);
        if (onProgress) onProgress(newProgress);
      } catch (error) {
        results.push({
          transactionId: transactions[i].id,
          error: error.message,
          index: i
        });
      }
    }

    setBatchResults(results);
    setLoading(false);
    return results;
  }, []);

  const getHighRiskTransactions = useCallback(() => {
    return batchResults.filter(r => r.riskScore > 0.7);
  }, [batchResults]);

  const getSuspiciousPatterns = useCallback(() => {
    return batchResults
      .filter(r => r.anomalies && r.anomalies.length > 0)
      .map(r => ({
        transactionId: r.transactionId,
        anomalies: r.anomalies,
        riskScore: r.riskScore
      }));
  }, [batchResults]);

  return {
    batchResults,
    loading,
    progress,
    analyzeBatch,
    getHighRiskTransactions,
    getSuspiciousPatterns
  };
};

export default useFraudDetection;