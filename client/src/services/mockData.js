/**
 * High-fidelity realistic dataset used for live preview and instant review
 * when the application is hosted on static frontend edge (Vercel)
 * and the external MongoDB/Express backend is connecting or spinning up.
 */

export const mockStats = {
  total_events: 168,
  total_sessions: 24,
  total_page_views: 78,
  total_clicks: 90,
  unique_pages: 3
};

export const mockPages = [
  { page_url: 'http://localhost:8080/index.html', event_count: 114 },
  { page_url: 'http://localhost:8080/pricing.html', event_count: 42 },
  { page_url: 'http://localhost:8080/features.html', event_count: 12 }
];

const now = Date.now();

export const mockSessions = [
  {
    session_id: 'sess_prod_growth_984',
    event_count: 8,
    page_view_count: 3,
    click_count: 5,
    first_seen: new Date(now - 14 * 60000).toISOString(),
    last_seen: new Date(now - 2 * 60000).toISOString(),
    duration_seconds: 720,
    pages_visited: ['http://localhost:8080/index.html', 'http://localhost:8080/pricing.html']
  },
  {
    session_id: 'sess_hotspot_enterprise_550',
    event_count: 12,
    page_view_count: 2,
    click_count: 10,
    first_seen: new Date(now - 45 * 60000).toISOString(),
    last_seen: new Date(now - 32 * 60000).toISOString(),
    duration_seconds: 780,
    pages_visited: ['http://localhost:8080/index.html']
  },
  {
    session_id: 'sess_researcher_ux_412',
    event_count: 6,
    page_view_count: 2,
    click_count: 4,
    first_seen: new Date(now - 75 * 60000).toISOString(),
    last_seen: new Date(now - 62 * 60000).toISOString(),
    duration_seconds: 780,
    pages_visited: ['http://localhost:8080/index.html', 'http://localhost:8080/features.html']
  },
  {
    session_id: 'sess_mobile_shopper_109',
    event_count: 5,
    page_view_count: 2,
    click_count: 3,
    first_seen: new Date(now - 120 * 60000).toISOString(),
    last_seen: new Date(now - 114 * 60000).toISOString(),
    duration_seconds: 360,
    pages_visited: ['http://localhost:8080/pricing.html']
  },
  {
    session_id: 'sess_evaluator_demo_771',
    event_count: 4,
    page_view_count: 2,
    click_count: 2,
    first_seen: new Date(now - 180 * 60000).toISOString(),
    last_seen: new Date(now - 176 * 60000).toISOString(),
    duration_seconds: 240,
    pages_visited: ['http://localhost:8080/index.html']
  }
];

export const mockSessionEvents = {
  sess_prod_growth_984: [
    {
      _id: 'ev_1',
      session_id: 'sess_prod_growth_984',
      event_type: 'page_view',
      page_url: 'http://localhost:8080/index.html',
      timestamp: new Date(now - 14 * 60000).toISOString(),
      viewport: { width: 1440, height: 900 }
    },
    {
      _id: 'ev_2',
      session_id: 'sess_prod_growth_984',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 520, y: 310 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(now - 13 * 60000).toISOString()
    },
    {
      _id: 'ev_3',
      session_id: 'sess_prod_growth_984',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 740, y: 310 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(now - 11 * 60000).toISOString()
    },
    {
      _id: 'ev_4',
      session_id: 'sess_prod_growth_984',
      event_type: 'page_view',
      page_url: 'http://localhost:8080/pricing.html',
      timestamp: new Date(now - 8 * 60000).toISOString(),
      viewport: { width: 1440, height: 900 }
    },
    {
      _id: 'ev_5',
      session_id: 'sess_prod_growth_984',
      event_type: 'click',
      page_url: 'http://localhost:8080/pricing.html',
      coordinates: { x: 600, y: 550 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(now - 5 * 60000).toISOString()
    },
    {
      _id: 'ev_6',
      session_id: 'sess_prod_growth_984',
      event_type: 'click',
      page_url: 'http://localhost:8080/pricing.html',
      coordinates: { x: 620, y: 560 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(now - 2 * 60000).toISOString()
    }
  ]
};

export const mockHeatmaps = {
  'http://localhost:8080/index.html': {
    page_url: 'http://localhost:8080/index.html',
    total_clicks: 42,
    points: [
      { x: 520, y: 310, count: 18, intensity: 1.0 },
      { x: 525, y: 315, count: 12, intensity: 0.8 },
      { x: 740, y: 310, count: 7, intensity: 0.5 },
      { x: 300, y: 520, count: 6, intensity: 0.4 },
      { x: 640, y: 520, count: 5, intensity: 0.35 },
      { x: 960, y: 520, count: 4, intensity: 0.3 },
      { x: 120, y: 45, count: 3, intensity: 0.25 },
      { x: 890, y: 45, count: 4, intensity: 0.3 }
    ]
  },
  'http://localhost:8080/pricing.html': {
    page_url: 'http://localhost:8080/pricing.html',
    total_clicks: 28,
    points: [
      { x: 600, y: 550, count: 15, intensity: 1.0 },
      { x: 610, y: 555, count: 8, intensity: 0.65 },
      { x: 320, y: 550, count: 5, intensity: 0.4 },
      { x: 880, y: 550, count: 4, intensity: 0.32 },
      { x: 200, y: 480, count: 3, intensity: 0.25 }
    ]
  }
};
