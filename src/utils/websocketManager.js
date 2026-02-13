class WebSocketManager {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.token = null;
    this.isConnecting = false;
  }

  connect(token) {
    // Don't try to connect without a token
    if (!token) {
      console.warn('WebSocket connection skipped: No token provided');
      return;
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
        this.socket = null;
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && event.code !== 1005) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
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
        'subscription_confirmed',
        'subscription_acknowledged'
      ];
      
      if (!silentTypes.includes(data.type)) {
        console.debug(`No handlers registered for message type: ${data.type}`);
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

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.debug('WebSocket not connected, message not sent:', data.type);
    }
  }

  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType).push(handler);
  }

  off(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) return;
    
    const handlers = this.messageHandlers.get(messageType);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms... (Attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  disconnect() {
    console.log('Disconnecting WebSocket...');
    if (this.socket) {
      // Remove all event listeners before closing
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close(1000, 'Normal closure');
      }
      this.socket = null;
    }
    this.isConnecting = false;
    this.messageHandlers.clear();
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketManager();