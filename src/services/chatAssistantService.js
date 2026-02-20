// services/chatAssistantService.js
import api from '../utils/api';

const SESSION_KEY = 'chat_assistant_session_id';

class ChatAssistantService {
  /**
   * Get an existing session ID from localStorage or create a new one.
   * Used to maintain conversation continuity for anonymous users.
   */
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Clear the current session ID (e.g. on logout or "new chat").
   */
  clearSessionId() {
    localStorage.removeItem(SESSION_KEY);
  }

  /**
   * Returns true if the user currently has a valid auth token in storage.
   * Checks both common token keys used across different api.js implementations.
   *
   * FIX: Previously, sendMessage always tried the authenticated endpoint first,
   * even for guest/anonymous users. This caused every anonymous request to fail
   * with "Authorization denied: User not found" before falling back to the
   * anonymous endpoint — wasting a round-trip and potentially masking the real
   * response if the fallback also failed.
   */
  _isAuthenticated() {
    return !!(
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('authToken')
    );
  }

  /**
   * Safely unwrap the response from api.safePost / api.safeGet.
   *
   * FIX: Different builds of api.js return either:
   *   - { data: { success, response, ... } }  (axios-style wrapper)
   *   - { success, response, ... }            (already-unwrapped)
   *
   * We detect which shape we got and always return the inner payload so that
   * callers can reliably read `.response`, `.suggestions`, etc.
   */
  _unwrap(raw) {
    if (!raw) return {};
    // If it looks like an axios response object (has a .data property that
    // itself carries the API payload), peel off the outer layer.
    if (raw.data !== undefined && (raw.data?.success !== undefined || raw.data?.response !== undefined)) {
      return raw.data;
    }
    // Already unwrapped — return as-is.
    return raw;
  }

  /**
   * Check the health of the booking-support AI service.
   */
  async checkHealth() {
    try {
      const raw = await api.safeGet('/ai/booking-support/health');
      return this._unwrap(raw);
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unavailable' };
    }
  }

  /**
   * Send a message to the AI booking-support chat.
   *
   * FIX: Route directly to the correct endpoint instead of always trying the
   * authenticated one first. Anonymous users now go straight to the anonymous
   * endpoint, avoiding the "Authorization denied" error on every message.
   *
   * @param {string} message      - The user's message text.
   * @param {string} language     - Language code (e.g. 'en', 'ne').
   * @param {object} context      - Extra context: { sessionId, agent, mode }.
   */
  async sendMessage(message, language = 'en', context = {}) {
    const payload = {
      message,
      language,
      sessionId: context.sessionId,
      agent: context.agent,
      mode: context.mode,
    };

    if (this._isAuthenticated()) {
      // ── Authenticated path ──────────────────────────────────────────────
      try {
        const raw = await api.safePost('/ai/booking-support/chat', payload);
        return this._unwrap(raw);
      } catch (authError) {
        // Token may be expired or user deleted — fall through to anonymous.
        console.warn(
          'Authenticated chat failed, falling back to anonymous:',
          authError?.message || authError
        );
        // Fall through ↓
      }
    }

    // ── Anonymous path (or auth fallback) ────────────────────────────────
    try {
      const raw = await api.safePost('/ai/booking-support/chat-anonymous', payload);
      return this._unwrap(raw);
    } catch (anonError) {
      console.error('Chat request failed on anonymous endpoint:', anonError);
      throw anonError;
    }
  }

  /**
   * Clear conversation history.
   *
   * Routes to the correct endpoint based on whether the user is authenticated.
   * Passes sessionId so the backend can identify the right conversation in
   * both cases.
   *
   * @param {string|null} sessionId - The current anonymous session ID.
   */
  async clearHistory(sessionId) {
    if (!this._isAuthenticated() && sessionId) {
      // Anonymous path
      return this.clearHistoryAnonymous(sessionId);
    }

    // Authenticated path
    try {
      const raw = await api.safePost('/ai/booking-support/clear-history', {});
      return this._unwrap(raw);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }

  /**
   * Clear conversation history for anonymous sessions.
   *
   * @param {string} sessionId - The session ID to clear.
   */
  async clearHistoryAnonymous(sessionId) {
    try {
      const raw = await api.safePost(
        '/ai/booking-support/clear-history-anonymous',
        { sessionId }
      );
      return this._unwrap(raw);
    } catch (error) {
      console.error('Error clearing anonymous history:', error);
      throw error;
    }
  }
}

const chatAssistantService = new ChatAssistantService();
export default chatAssistantService;