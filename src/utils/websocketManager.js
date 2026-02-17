class WebSocketManager {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.token = null;
    this.isConnecting = false;
    this.reconnectTimer = null;
    this.heartbeatInterval = null;
    this.lastHeartbeat = null;
  }

  connect(token) {
    // Don't try to connect without a token
    if (!token) {
      console.warn('WebSocket connection skipped: No token provided');
      return;
    }

    // Clear any pending reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Don't create multiple connection attempts
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }

    // Don't reconnect if already connected or connecting
    if (this.socket?.readyState === WebSocket.OPEN || 
        this.socket?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.token = token;
    this.isConnecting = true;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:4001';
    console.log('Connecting to WebSocket...');
    
    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Subscribe to default channels
        this.subscribeToNotifications();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        
        // Clean up socket reference
        if (this.socket) {
          this.socket.onopen = null;
          this.socket.onmessage = null;
          this.socket.onclose = null;
          this.socket.onerror = null;
          this.socket = null;
        }
        
        // Attempt to reconnect if not a normal closure and we have a token
        if (event.code !== 1000 && event.code !== 1005 && this.token) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Don't set isConnecting to false here - let onclose handle it
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
    }
  }

  handleMessage(data) {
    const handlers = this.messageHandlers.get(data.type) || [];
    
    if (handlers.length === 0) {
      // Silent ignore for common subscription messages
      const silentTypes = [
        'unread_count_subscription',
        'ping',
        'pong',
        'heartbeat',
        'heartbeat_ack',
        'subscription_confirmed',
        'subscription_acknowledged',
        'subscription_success',
        'connected',
        'welcome'
      ];
      
      if (!silentTypes.includes(data.type)) {
        console.debug(`No handlers registered for message type: ${data.type}`);
      }
      
      // Handle heartbeat response
      if (data.type === 'pong' || data.type === 'heartbeat_ack') {
        this.lastHeartbeat = Date.now();
      }
      
      return;
    }

    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in handler for ${data.type}:`, error);
      }
    });
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.lastHeartbeat = Date.now();
    
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', timestamp: Date.now() });
        
        // Check if we haven't received a response in 45 seconds
        if (this.lastHeartbeat && Date.now() - this.lastHeartbeat > 45000) {
          console.log('No heartbeat response, reconnecting...');
          this.reconnect();
        }
      } else {
        this.stopHeartbeat();
      }
    }, 30000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  reconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Reconnecting');
    }
    this.attemptReconnect();
  }

  subscribeToNotifications() {
    this.send({
      type: 'subscribe',
      channel: 'notifications'
    });
  }

  subscribeToUnreadCount() {
    this.send({
      type: 'subscribe',
      channel: 'unread_count'
    });
  }

  subscribeToChannel(channel) {
    this.send({
      type: 'subscribe',
      channel: channel
    });
  }

  unsubscribeFromChannel(channel) {
    this.send({
      type: 'unsubscribe',
      channel: channel
    });
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.debug('WebSocket not connected, message not sent:', data.type);
      return false;
    }
  }

  sendWithAck(data, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const messageId = Date.now() + Math.random().toString(36).substr(2, 9);
      const messageWithId = { ...data, id: messageId };

      const timeoutId = setTimeout(() => {
        this.off('ack', ackHandler);
        reject(new Error('Acknowledgement timeout'));
      }, timeout);

      const ackHandler = (ackData) => {
        if (ackData.id === messageId) {
          clearTimeout(timeoutId);
          this.off('ack', ackHandler);
          resolve(ackData);
        }
      };

      this.on('ack', ackHandler);
      this.send(messageWithId);
    });
  }

  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    const handlers = this.messageHandlers.get(messageType);
    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
  }

  off(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) return;
    
    const handlers = this.messageHandlers.get(messageType);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    // Clean up empty handler arrays
    if (handlers.length === 0) {
      this.messageHandlers.delete(messageType);
    }
  }

  removeAllHandlers(messageType) {
    if (messageType) {
      this.messageHandlers.delete(messageType);
    } else {
      this.messageHandlers.clear();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.token = null; // Clear token to stop further reconnection attempts
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.token && this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(this.token);
      }
      this.reconnectTimer = null;
    }, delay);
  }

  disconnect() {
    console.log('Disconnecting WebSocket...');
    
    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.socket) {
      // Remove all event listeners before closing
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      if (this.socket.readyState === WebSocket.OPEN || 
          this.socket.readyState === WebSocket.CONNECTING) {
        try {
          this.socket.close(1000, 'Normal closure');
        } catch (error) {
          console.error('Error closing WebSocket:', error);
        }
      }
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.messageHandlers.clear();
    this.token = null;
    this.reconnectAttempts = 0;
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.socket) return 'disconnected';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  getStats() {
    return {
      connected: this.isConnected(),
      state: this.getConnectionState(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      isConnecting: this.isConnecting,
      hasToken: !!this.token,
      handlersCount: this.messageHandlers.size,
      lastHeartbeat: this.lastHeartbeat
    };
  }
}

// Create singleton instance
const websocketManager = new WebSocketManager();

// Prevent multiple instances in development with HMR
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    websocketManager.disconnect();
  });
}

export default websocketManager;