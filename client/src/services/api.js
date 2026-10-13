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

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`Unable to connect to analytics server at ${API_BASE_URL}`);
    }
    throw err;
  }
}

export const api = {
  /**
   * Health status of API and MongoDB
   */
  async getHealth() {
    try {
      return await request('/health');
    } catch {
      return {
        status: 'demo-mode',
        isMock: true,
        database: { connected: true, status: 'interactive-preview' }
      };
    }
  },

  /**
   * High-level overview metrics
   */
  async getStats() {
    try {
      return await request('/stats');
    } catch {
      return { data: mockStats, isMock: true };
    }
  },

  /**
   * List all user sessions with activity aggregates
   */
  async getSessions(page = 1, limit = 50) {
    try {
      return await request(`/sessions?page=${page}&limit=${limit}`);
    } catch {
      return { data: mockSessions, isMock: true };
    }
  },

  /**
   * Get ordered chronological event timeline for a session
   */
  async getSessionEvents(sessionId) {
    try {
      return await request(`/sessions/${encodeURIComponent(sessionId)}/events`);
    } catch {
      const events = mockSessionEvents[sessionId] || mockSessionEvents['sess_prod_growth_984'] || [];
      return { data: events, isMock: true };
    }
  },

  /**
   * List all distinct tracked pages
   */
  async getTrackedPages() {
    try {
      return await request('/pages');
    } catch {
      return { data: mockPages, isMock: true };
    }
  },

  /**
   * Get click coordinates for heatmap visualization
   */
  async getHeatmap(pageUrl) {
    try {
      return await request(`/heatmap?url=${encodeURIComponent(pageUrl)}`);
    } catch {
      const heatmap = mockHeatmaps[pageUrl] || mockHeatmaps['http://localhost:8080/index.html'];
      return { data: heatmap, isMock: true };
    }
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
      // In demo mode, accept and simulate ingestion
      if (eventPayload.event_type === 'click' && eventPayload.coordinates) {
        const page = eventPayload.page_url || 'http://localhost:8080/index.html';
        if (mockHeatmaps[page]) {
          mockHeatmaps[page].points.push({
            x: eventPayload.coordinates.x,
            y: eventPayload.coordinates.y,
            count: 1,
            intensity: 0.5
          });
          mockHeatmaps[page].total_clicks += 1;
        }
      }
      mockStats.total_events += 1;
      return { success: true, isMock: true, data: eventPayload };
    }
  },

  async trackEvent(eventPayload) {
    return this.createEvent(eventPayload);
  },

  getBaseUrl() {
    return API_BASE_URL;
  }
};
