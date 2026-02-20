// ─── Browser Logger ───────────────────────────────────────────────────────────
const LOG_PREFIX = "[WS]";

const style = {
  tag: "color:#7c3aed;font-weight:bold",
  info: "color:#2563eb;font-weight:bold",
  success: "color:#16a34a;font-weight:bold",
  warn: "color:#d97706;font-weight:bold",
  error: "color:#dc2626;font-weight:bold",
  meta: "color:#6b7280;font-size:0.85em",
  reset: "color:inherit;font-weight:normal",
};

const ts = () => new Date().toLocaleTimeString("en-US", { hour12: false });

const logger = {
  info(tag, msg, meta = "") {
    console.log(
      `%c${LOG_PREFIX}%c ${ts()} %c${tag.padEnd(16)}%c ${msg}  %c${meta}`,
      style.tag,
      style.reset,
      style.info,
      style.reset,
      style.meta
    );
  },
  success(tag, msg, meta = "") {
    console.log(
      `%c${LOG_PREFIX}%c ${ts()} %c${tag.padEnd(16)}%c ${msg}  %c${meta}`,
      style.tag,
      style.reset,
      style.success,
      style.reset,
      style.meta
    );
  },
  warn(tag, msg, meta = "") {
    console.warn(
      `%c${LOG_PREFIX}%c ${ts()} %c${tag.padEnd(16)}%c ${msg}  %c${meta}`,
      style.tag,
      style.reset,
      style.warn,
      style.reset,
      style.meta
    );
  },
  error(tag, msg, meta = "") {
    console.error(
      `%c${LOG_PREFIX}%c ${ts()} %c${tag.padEnd(16)}%c ${msg}  %c${meta}`,
      style.tag,
      style.reset,
      style.error,
      style.reset,
      style.meta
    );
  },
  divider(label) {
    console.log(
      `%c${LOG_PREFIX}%c ─────────── ${label} ───────────`,
      style.tag,
      style.meta
    );
  },
  table(data) {
    console.table(data);
  },
};

// ─── Close code descriptions ──────────────────────────────────────────────────
const CLOSE_REASONS = {
  1000: "Normal closure",
  1001: "Server going away / shutting down",
  1005: "No status received",
  1006: "Abnormal closure — no close frame (network drop?)",
  1011: "Internal server error",
  4001: "Auth required — no token sent",
  4002: "Connection error on server",
  4003: "Token expired — please log in again",
  4004: "Invalid token or bad user ID",
  4005: "User or role not found",
};

const closeReason = (code) =>
  CLOSE_REASONS[code]
    ? `${CLOSE_REASONS[code]} (${code})`
    : `Unknown close code (${code})`;

// ─── Error types for better handling ──────────────────────────────────────────
const ERROR_TYPES = {
  AUTH_FAILED: 'auth_failed',
  TOKEN_EXPIRED: 'token_expired',
  RATE_LIMIT: 'rate_limit',
  INVALID_MESSAGE: 'invalid_message',
  SERVER_ERROR: 'server_error',
  NOTIFICATION_FAILED: 'notification_failed',
  SUBSCRIPTION_FAILED: 'subscription_failed',
  CONNECTION_LOST: 'connection_lost'
};

// ─── WebSocketManager ─────────────────────────────────────────────────────────
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
    this.onConnectedCallback = null;
    this._connectedAt = null;
    this.errorCount = 0;
    this.lastErrorTime = null;
    
    // Setup default error handler on construction
    this.setupDefaultErrorHandler();
  }

  // ── Default error handler setup ─────────────────────────────────────────────
  setupDefaultErrorHandler() {
    // Remove any existing error handlers to avoid duplicates
    if (this.messageHandlers.has('error')) {
      this.messageHandlers.delete('error');
    }

    // Add default error handler
    this.on('error', (data) => {
      const payload = data.payload || {};
      const errorCode = payload.code || 'UNKNOWN';
      const errorMessage = payload.message || 'WebSocket error occurred';
      const correlationId = data.correlationId || '—';
      
      // Track error metrics
      this.errorCount++;
      this.lastErrorTime = new Date();

      // Handle different error types
      switch(errorCode) {
        case ERROR_TYPES.AUTH_FAILED:
        case ERROR_TYPES.TOKEN_EXPIRED:
          logger.error(
            'WS ERROR', 
            `🔐 Authentication failed: ${errorMessage}`, 
            `code=${errorCode} correlationId=${correlationId}`
          );
          // Dispatch auth failure event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ws:auth:failed', { 
              detail: { 
                code: errorCode, 
                message: errorMessage,
                timestamp: new Date().toISOString()
              } 
            }));
          }
          // Attempt to reconnect with new token if available
          this.handleAuthFailure();
          break;
          
        case ERROR_TYPES.RATE_LIMIT:
          logger.warn(
            'WS ERROR', 
            '⏱️ Rate limit reached', 
            `code=${errorCode} correlationId=${correlationId}`
          );
          // Implement exponential backoff for rate limiting
          this.handleRateLimit();
          break;
          
        case ERROR_TYPES.INVALID_MESSAGE:
          logger.warn(
            'WS ERROR', 
            '📨 Invalid message format', 
            `code=${errorCode} correlationId=${correlationId}`
          );
          break;
          
        case ERROR_TYPES.SERVER_ERROR:
          logger.error(
            'WS ERROR', 
            '🔧 Server error occurred', 
            `code=${errorCode} correlationId=${correlationId}`
          );
          break;
          
        case ERROR_TYPES.NOTIFICATION_FAILED:
        case ERROR_TYPES.SUBSCRIPTION_FAILED:
          logger.warn(
            'WS ERROR', 
            `📢 ${errorCode.replace('_', ' ')}`, 
            `channel=${payload.channel || 'unknown'} correlationId=${correlationId}`
          );
          // Retry subscription after delay
          setTimeout(() => {
            if (payload.channel && this.isConnected()) {
              logger.info('RETRY', `Resubscribing to ${payload.channel}`);
              this.send({ type: 'subscribe', channel: payload.channel });
            }
          }, 5000);
          break;
          
        default:
          // For unknown errors, log at debug level after first occurrence
          if (this.errorCount <= 3) {
            console.debug(
              `${LOG_PREFIX} WS ERROR (unhandled type)`, 
              `code=${errorCode}`, 
              `message=${errorMessage}`
            );
          } else {
            // Suppress after 3 errors to avoid console spam
            console.debug(`${LOG_PREFIX} WS ERROR suppressed (${this.errorCount} total)`);
          }
      }

      // Also dispatch a general error event for app-wide handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ws:error', { 
          detail: { 
            code: errorCode, 
            message: errorMessage,
            correlationId,
            count: this.errorCount
          } 
        }));
      }
    });

    logger.info('SETUP', 'Default error handler registered');
  }

  // ── Handle authentication failure ───────────────────────────────────────────
  handleAuthFailure() {
    // Check if token exists and might be expired
    const token = localStorage.getItem('token');
    
    if (!token) {
      logger.warn('AUTH', 'No token available for reconnection');
      return;
    }

    // Attempt to reconnect after delay
    setTimeout(() => {
      if (!this.isConnected() && token) {
        logger.info('AUTH', 'Attempting reconnection with new token');
        this.connect(token, this.onConnectedCallback);
      }
    }, 3000);
  }

  // ── Handle rate limiting ────────────────────────────────────────────────────
  handleRateLimit() {
    // Implement exponential backoff
    const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      logger.info('RATE LIMIT', `Backing off for ${backoffTime}ms`);
      
      setTimeout(() => {
        if (this.isConnected()) {
          // Resume normal operations
          this.reconnectAttempts = 0;
        }
      }, backoffTime);
    }
  }

  // ── connect ──────────────────────────────────────────────────────────────────
  connect(token, onConnected = null) {
    if (!token) {
      logger.warn("CONNECT", "Skipped — no token provided");
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.isConnecting) {
      console.debug(
        `${LOG_PREFIX} CONNECT already in progress — skipped (StrictMode double-invoke)`
      );
      return;
    }

    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      console.debug(`${LOG_PREFIX} CONNECT already open — skipped`);
      if (onConnected && this.socket?.readyState === WebSocket.OPEN) {
        onConnected();
      }
      return;
    }

    this.token = token;
    this.isConnecting = true;
    if (onConnected) this.onConnectedCallback = onConnected;

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:4001";

    logger.divider("Connecting");
    logger.info("CONNECT", "Opening WebSocket…", `url=${wsUrl}`);

    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);
    } catch (error) {
      logger.error(
        "CONNECT",
        "WebSocket constructor threw",
        `err=${error.message}`
      );
      this.isConnecting = false;
      return;
    }

    // ── onopen ────────────────────────────────────────────────────────────────
    this.socket.onopen = () => {
      this._connectedAt = Date.now();
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.errorCount = 0; // Reset error count on successful connection

      logger.divider("Connected ✓");
      logger.success("CONNECTED", "🟢 WebSocket is OPEN", `url=${wsUrl}`);
      logger.table(this.getStats());

      if (this.onConnectedCallback) {
        logger.info("CONNECT", "Sending subscriptions…");
        this.onConnectedCallback();
      }
    };

    // ── onmessage ─────────────────────────────────────────────────────────────
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Log all incoming messages except heartbeats/pings
        if (data.type !== 'ping' && data.type !== 'pong') {
          logger.info(
            "MSG ↓ IN",
            `Received: ${data.type}`,
            `correlationId=${data.payload?.correlationId || "—"}`
          );
        }
        
        this.handleMessage(data);
      } catch (error) {
        logger.error(
          "MSG ↓ IN",
          "Failed to parse message",
          `err=${error.message}`
        );
      }
    };

    // ── onclose ───────────────────────────────────────────────────────────────
    this.socket.onclose = (event) => {
      const uptime = this._connectedAt
        ? `${((Date.now() - this._connectedAt) / 1000).toFixed(1)}s`
        : "—";

      logger.divider("Disconnected ✗");

      if (event.code === 1000 || event.code === 1005) {
        logger.info(
          "CLOSED",
          "🔴 Closed normally",
          `code=${event.code}  reason="${closeReason(
            event.code
          )}"  uptime=${uptime}`
        );
      } else {
        logger.warn(
          "CLOSED",
          "🔴 Closed unexpectedly",
          `code=${event.code}  reason="${closeReason(
            event.code
          )}"  uptime=${uptime}`
        );
      }

      this.isConnecting = false;
      this._connectedAt = null;

      if (this.socket) {
        this.socket.onopen = null;
        this.socket.onmessage = null;
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket = null;
      }

      if (event.code !== 1000 && event.code !== 1005 && this.token) {
        this.attemptReconnect();
      } else {
        logger.info("CLOSED", "No reconnect — clean closure or no token");
      }
    };

    // ── onerror ───────────────────────────────────────────────────────────────
    this.socket.onerror = (error) => {
      logger.error(
        "SOCKET ERR",
        "WebSocket error fired",
        `readyState=${this.socket?.readyState ?? "?"} — check Network tab`
      );
      
      // Dispatch error event for connection errors
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ws:connection:error', { 
          detail: { 
            error: error.message || 'Unknown connection error',
            timestamp: new Date().toISOString()
          } 
        }));
      }
    };
  }

  // ── handleMessage ─────────────────────────────────────────────────────────────
  handleMessage(data) {
    const handlers = this.messageHandlers.get(data.type) || [];

    if (handlers.length === 0) {
      const silentTypes = [
        "subscription_confirmed",
        "subscription_acknowledged",
        "subscription_success",
        "connected",
        "welcome",
        "ping",
        "pong"
      ];
      
      if (!silentTypes.includes(data.type)) {
        // For error messages, we already have a handler, so this shouldn't happen
        // But just in case, log at debug level
        if (data.type !== 'error') {
          console.debug(
            `${LOG_PREFIX} No handlers for: ${data.type}`, 
            `register with websocketManager.on(...)`
          );
        }
      }
      return;
    }

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        logger.error(
          "MSG HANDLE",
          `Handler threw for: ${data.type}`,
          `err=${error.message}`
        );
      }
    });
  }

  // ── send helpers ──────────────────────────────────────────────────────────────
  subscribeToNotifications() {
    logger.info("SUB", "Subscribing to channel: notifications");
    this.send({ type: "subscribe", channel: "notifications" });
  }

  subscribeToUnreadCount() {
    logger.info("SUB", "Subscribing to channel: unread_count");
    this.send({ type: "subscribe", channel: "unread_count" });
  }

  subscribeToChannel(channel) {
    logger.info("SUB", `Subscribing to channel: ${channel}`);
    this.send({ type: "subscribe", channel });
  }

  unsubscribeFromChannel(channel) {
    logger.info("UNSUB", `Unsubscribing from channel: ${channel}`);
    this.send({ type: "unsubscribe", channel });
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
        
        // Don't log heartbeat messages
        if (data.type !== 'ping' && data.type !== 'pong') {
          logger.info(
            "MSG ↑ OUT",
            `Sent: ${data.type}`,
            data.channel ? `channel=${data.channel}` : ""
          );
        }
        return true;
      } catch (error) {
        logger.error(
          "MSG ↑ OUT",
          `Failed to send: ${data.type}`,
          `err=${error.message}`
        );
        return false;
      }
    } else {
      logger.warn(
        "MSG ↑ OUT",
        `Cannot send — socket not open`,
        `type=${data.type}  state=${this.getConnectionState()}`
      );
      return false;
    }
  }

  sendWithAck(data, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        logger.error("SEND ACK", "Cannot send — not connected");
        reject(new Error("WebSocket not connected"));
        return;
      }

      const messageId = Date.now() + Math.random().toString(36).substr(2, 9);
      const messageWithId = { ...data, id: messageId };

      const timeoutId = setTimeout(() => {
        this.off("ack", ackHandler);
        logger.warn(
          "SEND ACK",
          `Ack timeout for: ${data.type}`,
          `id=${messageId}`
        );
        reject(new Error("Acknowledgement timeout"));
      }, timeout);

      const ackHandler = (ackData) => {
        if (ackData.id === messageId) {
          clearTimeout(timeoutId);
          this.off("ack", ackHandler);
          logger.success(
            "SEND ACK",
            `Ack received for: ${data.type}`,
            `id=${messageId}`
          );
          resolve(ackData);
        }
      };

      this.on("ack", ackHandler);
      this.send(messageWithId);
    });
  }

  // ── handler registry ──────────────────────────────────────────────────────────
  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    const handlers = this.messageHandlers.get(messageType);
    if (!handlers.includes(handler)) {
      handlers.push(handler);
      console.debug(
        `${LOG_PREFIX} HANDLER REG  ${messageType}  total=${handlers.length}`
      );
    }
  }

  off(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) return;
    const handlers = this.messageHandlers.get(messageType);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      console.debug(
        `${LOG_PREFIX} HANDLER DEL  ${messageType}  remaining=${handlers.length}`
      );
    }
    if (handlers.length === 0) {
      this.messageHandlers.delete(messageType);
    }
  }

  removeAllHandlers(messageType) {
    if (messageType) {
      this.messageHandlers.delete(messageType);
      logger.warn("HANDLER DEL", `All handlers cleared for: ${messageType}`);
    } else {
      this.messageHandlers.clear();
      logger.warn("HANDLER DEL", "All message handlers cleared");
    }
  }

  // ── reconnect ─────────────────────────────────────────────────────────────────
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(
        "RECONNECT",
        `❌ Max attempts (${this.maxReconnectAttempts}) reached — giving up`,
        "Refresh the page to reconnect"
      );
      
      // Dispatch connection lost event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ws:connection:lost', { 
          detail: { 
            attempts: this.reconnectAttempts,
            timestamp: new Date().toISOString()
          } 
        }));
      }
      
      this.token = null;
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    logger.warn(
      "RECONNECT",
      `⏳ Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms…`
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.token && this.reconnectAttempts <= this.maxReconnectAttempts) {
        logger.info(
          "RECONNECT",
          "Retrying…",
          `attempt=${this.reconnectAttempts}`
        );
        this.connect(this.token, this.onConnectedCallback);
      }
      this.reconnectTimer = null;
    }, delay);
  }

  // ── disconnect ────────────────────────────────────────────────────────────────
  disconnect() {
    logger.divider("Disconnecting");
    logger.info("DISCONNECT", "Manual disconnect requested");

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
      logger.info("DISCONNECT", "Reconnect timer cancelled");
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;

      if (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      ) {
        try {
          this.socket.close(1000, "Normal closure");
          logger.info("DISCONNECT", "Socket closed cleanly");
        } catch (error) {
          logger.error(
            "DISCONNECT",
            "Error closing socket",
            `err=${error.message}`
          );
        }
      }
      this.socket = null;
    }

    this.isConnecting = false;
    this.messageHandlers.clear();
    this.onConnectedCallback = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this._connectedAt = null;
    this.errorCount = 0;

    logger.info(
      "DISCONNECT",
      "🔴 WebSocket fully disconnected and state reset"
    );
  }

  // ── state helpers ─────────────────────────────────────────────────────────────
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.socket) return "disconnected";
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "closed";
      default:
        return "unknown";
    }
  }

  getStats() {
    return {
      state: this.getConnectionState(),
      connected: this.isConnected(),
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      hasToken: !!this.token,
      registeredHandlers: this.messageHandlers.size,
      errorCount: this.errorCount,
      uptimeSeconds: this._connectedAt
        ? ((Date.now() - this._connectedAt) / 1000).toFixed(1)
        : null,
    };
  }

  // Call from browser console anytime: __wsManager.debug()
  debug() {
    logger.divider("Debug Snapshot");
    logger.table(this.getStats());
    const handlers = {};
    this.messageHandlers.forEach((arr, key) => {
      handlers[key] = arr.length;
    });
    if (Object.keys(handlers).length) {
      console.log("%c[WS] Registered handlers:", style.tag, handlers);
    }
  }

  // Get error statistics
  getErrorStats() {
    return {
      totalErrors: this.errorCount,
      lastErrorTime: this.lastErrorTime,
      isConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
const websocketManager = new WebSocketManager();

// Expose to browser console: __wsManager.debug()
if (typeof window !== "undefined") {
  window.__wsManager = websocketManager;
  
  // Also expose error types for debugging
  window.__WS_ERRORS = ERROR_TYPES;
}

// ─── Vite HMR — close socket only, preserve token & callbacks ─────────────────
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.debug(
      `${LOG_PREFIX} HMR reload — closing socket without full disconnect`
    );
    if (websocketManager.socket) {
      websocketManager.socket.onopen = null;
      websocketManager.socket.onmessage = null;
      websocketManager.socket.onclose = null;
      websocketManager.socket.onerror = null;
      try {
        websocketManager.socket.close(1000, "HMR reload");
      } catch (_) {}
      websocketManager.socket = null;
    }
    if (websocketManager.reconnectTimer) {
      clearTimeout(websocketManager.reconnectTimer);
      websocketManager.reconnectTimer = null;
    }
    websocketManager.isConnecting = false;
  });
}

export default websocketManager;