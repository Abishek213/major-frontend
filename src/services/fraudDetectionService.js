import api from '../utils/api';

class FraudDetectionService {
  async checkBooking(bookingData) {
    try {
      const response = await api.post('/ai/fraud/check-booking', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error checking booking:', error);
      throw error;
    }
  }

  async getUserRiskProfile(userId) {
    try {
      const response = await api.get(`/ai/fraud/user-risk/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user risk profile:', error);
      throw error;
    }
  }

  async getTransactionPatterns(userId) {
    try {
      const response = await api.get(`/ai/fraud/transaction-patterns/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting transaction patterns:', error);
      throw error;
    }
  }

  async validatePayment(paymentData) {
    try {
      const response = await api.post('/ai/fraud/validate-payment', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error validating payment:', error);
      throw error;
    }
  }

  // Real-time monitoring
  startMonitoring(callback) {
    // This would typically use WebSocket for real-time updates
    const ws = new WebSocket(process.env.REACT_APP_WS_URL + '/fraud-monitoring');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }
}

export default new FraudDetectionService();