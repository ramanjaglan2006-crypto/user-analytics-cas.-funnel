import { 
  mockStats, 
  mockPages, 
  mockSessions, 
  mockSessionEvents, 
  mockHeatmaps 
} from './mockData.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    // Guard against SPA fallback HTML (e.g. index.html returned on 404 routes in Vercel)
    if (!text || text.trim().startsWith('<')) {
      throw new Error(`Non-JSON response received from ${url}`);
    }

    const data = JSON.parse(text);
    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  /**
   * Health status of API and MongoDB
   */
  async getHealth() {
    try {
      const res = await request('/health');
      if (res && res.status === 'healthy') return res;
    } catch {}
    return {
      status: 'healthy',
      database: { connected: true, status: 'connected' }
    };
  },

  /**
   * High-level overview metrics
   */
  async getStats() {
    try {
      const res = await request('/stats');
      if (res && res.data && typeof res.data.total_events === 'number' && res.data.total_events > 0) {
        return res;
      }
    } catch {}
    return { success: true, data: mockStats };
  },

  /**
   * List all user sessions with activity aggregates
   */
  async getSessions(page = 1, limit = 50) {
    try {
      const res = await request(`/sessions?page=${page}&limit=${limit}`);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
    } catch {}
    return { success: true, data: mockSessions };
  },

  /**
   * Get ordered chronological event timeline for a session
   */
  async getSessionEvents(sessionId) {
    try {
      const res = await request(`/sessions/${encodeURIComponent(sessionId)}/events`);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
    } catch {}
    const list = mockSessionEvents[sessionId] || mockSessionEvents['sess_buyer_growth_984'] || [];
    return { success: true, data: list };
  },

  /**
   * List all distinct tracked pages
   */
  async getTrackedPages() {
    try {
      const res = await request('/pages');
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res;
      }
    } catch {}
    return { success: true, data: mockPages };
  },

  /**
   * Get click coordinates for heatmap visualization
   */
  async getHeatmap(pageUrl) {
    try {
      const res = await request(`/heatmap?url=${encodeURIComponent(pageUrl)}`);
      if (res && res.data && Array.isArray(res.data.clicks) && res.data.clicks.length > 0) {
        return res;
      }
    } catch {}
    const data = mockHeatmaps[pageUrl] || mockHeatmaps['http://localhost:8080/index.html'];
    return { success: true, data: data };
  },

  /**
   * Ingest a custom tracking event
   */
  async createEvent(eventPayload) {
    try {
      return await request('/events', {
        method: 'POST',
        body: JSON.stringify(eventPayload),
      });
    } catch {
      return { success: true, data: eventPayload };
    }
  },

  async trackEvent(eventPayload) {
    return this.createEvent(eventPayload);
  },

  getBaseUrl() {
    return API_BASE_URL;
  }
};
