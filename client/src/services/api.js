const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Custom API request helper with normalized error messaging
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`Unable to connect to analytics server at ${API_BASE_URL}. Ensure the backend is running.`);
    }
    throw err;
  }
}

export const api = {
  /**
   * Health status of API and MongoDB
   */
  async getHealth() {
    return request('/health');
  },

  /**
   * High-level overview metrics
   */
  async getStats() {
    return request('/stats');
  },

  /**
   * List all user sessions with activity aggregates
   */
  async getSessions(page = 1, limit = 50) {
    return request(`/sessions?page=${page}&limit=${limit}`);
  },

  /**
   * Get ordered chronological event timeline for a session
   */
  async getSessionEvents(sessionId) {
    return request(`/sessions/${encodeURIComponent(sessionId)}/events`);
  },

  /**
   * List all distinct tracked pages
   */
  async getTrackedPages() {
    return request('/pages');
  },

  /**
   * Get click coordinates for heatmap visualization
   */
  async getHeatmap(pageUrl) {
    return request(`/heatmap?url=${encodeURIComponent(pageUrl)}`);
  },

  /**
   * Ingest a custom tracking event
   */
  async createEvent(eventPayload) {
    return request('/events', {
      method: 'POST',
      body: JSON.stringify(eventPayload),
    });
  },

  async trackEvent(eventPayload) {
    return this.createEvent(eventPayload);
  },

  getBaseUrl() {
    return API_BASE_URL;
  }
};
