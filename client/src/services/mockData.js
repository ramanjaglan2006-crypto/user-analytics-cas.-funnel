const baseTime = Date.now() - 3600000;

export const mockStats = {
  total_events: 18,
  total_sessions: 4,
  total_page_views: 6,
  total_clicks: 12,
  unique_pages: 2
};

export const mockPages = [
  {
    page_url: 'http://localhost:8080/index.html',
    total_events: 14,
    clicks: 10,
    page_views: 4,
    last_activity: new Date(baseTime + 650000).toISOString(),
    unique_sessions_count: 3
  },
  {
    page_url: 'http://localhost:8080/pricing.html',
    total_events: 4,
    clicks: 2,
    page_views: 2,
    last_activity: new Date(baseTime + 920000).toISOString(),
    unique_sessions_count: 2
  }
];

export const mockSessions = [
  {
    session_id: 'sess_buyer_growth_984',
    total_events: 5,
    page_views: 2,
    clicks: 3,
    first_activity: new Date(baseTime + 10000).toISOString(),
    last_activity: new Date(baseTime + 120000).toISOString(),
    page_count: 2
  },
  {
    session_id: 'sess_hotspot_user_550',
    total_events: 7,
    page_views: 1,
    clicks: 6,
    first_activity: new Date(baseTime + 600000).toISOString(),
    last_activity: new Date(baseTime + 640000).toISOString(),
    page_count: 1
  },
  {
    session_id: 'sess_researcher_412',
    total_events: 4,
    page_views: 1,
    clicks: 3,
    first_activity: new Date(baseTime + 300000).toISOString(),
    last_activity: new Date(baseTime + 410000).toISOString(),
    page_count: 1
  },
  {
    session_id: 'sess_mobile_vis_109',
    total_events: 2,
    page_views: 1,
    clicks: 1,
    first_activity: new Date(baseTime + 900000).toISOString(),
    last_activity: new Date(baseTime + 920000).toISOString(),
    page_count: 1
  }
];

export const mockSessionEvents = {
  sess_buyer_growth_984: [
    {
      _id: 'ev_101',
      session_id: 'sess_buyer_growth_984',
      event_type: 'page_view',
      page_url: 'http://localhost:8080/index.html',
      timestamp: new Date(baseTime + 10000).toISOString(),
      viewport: { width: 1440, height: 900 }
    },
    {
      _id: 'ev_102',
      session_id: 'sess_buyer_growth_984',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 520, y: 310 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 35000).toISOString()
    },
    {
      _id: 'ev_103',
      session_id: 'sess_buyer_growth_984',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 740, y: 310 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 75000).toISOString()
    },
    {
      _id: 'ev_104',
      session_id: 'sess_buyer_growth_984',
      event_type: 'page_view',
      page_url: 'http://localhost:8080/pricing.html',
      timestamp: new Date(baseTime + 80000).toISOString(),
      viewport: { width: 1440, height: 900 }
    },
    {
      _id: 'ev_105',
      session_id: 'sess_buyer_growth_984',
      event_type: 'click',
      page_url: 'http://localhost:8080/pricing.html',
      coordinates: { x: 600, y: 550 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 120000).toISOString()
    }
  ],
  sess_hotspot_user_550: [
    {
      _id: 'ev_201',
      session_id: 'sess_hotspot_user_550',
      event_type: 'page_view',
      page_url: 'http://localhost:8080/index.html',
      timestamp: new Date(baseTime + 600000).toISOString(),
      viewport: { width: 1440, height: 900 }
    },
    {
      _id: 'ev_202',
      session_id: 'sess_hotspot_user_550',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 520, y: 310 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 610000).toISOString()
    },
    {
      _id: 'ev_203',
      session_id: 'sess_hotspot_user_550',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 535, y: 312 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 615000).toISOString()
    },
    {
      _id: 'ev_204',
      session_id: 'sess_hotspot_user_550',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 512, y: 308 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 620000).toISOString()
    },
    {
      _id: 'ev_205',
      session_id: 'sess_hotspot_user_550',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 528, y: 318 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 625000).toISOString()
    },
    {
      _id: 'ev_206',
      session_id: 'sess_hotspot_user_550',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 519, y: 315 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 630000).toISOString()
    },
    {
      _id: 'ev_207',
      session_id: 'sess_hotspot_user_550',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 524, y: 311 },
      viewport: { width: 1440, height: 900 },
      timestamp: new Date(baseTime + 635000).toISOString()
    }
  ],
  sess_researcher_412: [
    {
      _id: 'ev_301',
      session_id: 'sess_researcher_412',
      event_type: 'page_view',
      page_url: 'http://localhost:8080/index.html',
      timestamp: new Date(baseTime + 300000).toISOString(),
      viewport: { width: 1280, height: 800 }
    },
    {
      _id: 'ev_302',
      session_id: 'sess_researcher_412',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 300, y: 520 },
      viewport: { width: 1280, height: 800 },
      timestamp: new Date(baseTime + 330000).toISOString()
    },
    {
      _id: 'ev_303',
      session_id: 'sess_researcher_412',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 640, y: 520 },
      viewport: { width: 1280, height: 800 },
      timestamp: new Date(baseTime + 370000).toISOString()
    },
    {
      _id: 'ev_304',
      session_id: 'sess_researcher_412',
      event_type: 'click',
      page_url: 'http://localhost:8080/index.html',
      coordinates: { x: 960, y: 520 },
      viewport: { width: 1280, height: 800 },
      timestamp: new Date(baseTime + 410000).toISOString()
    }
  ],
  sess_mobile_vis_109: [
    {
      _id: 'ev_401',
      session_id: 'sess_mobile_vis_109',
      event_type: 'page_view',
      page_url: 'http://localhost:8080/pricing.html',
      timestamp: new Date(baseTime + 900000).toISOString(),
      viewport: { width: 390, height: 844 }
    },
    {
      _id: 'ev_402',
      session_id: 'sess_mobile_vis_109',
      event_type: 'click',
      page_url: 'http://localhost:8080/pricing.html',
      coordinates: { x: 200, y: 480 },
      viewport: { width: 390, height: 844 },
      timestamp: new Date(baseTime + 920000).toISOString()
    }
  ]
};

export const mockHeatmaps = {
  'http://localhost:8080/index.html': {
    page_url: 'http://localhost:8080/index.html',
    total_clicks: 10,
    clicks: [
      { event_id: 'ev_102', session_id: 'sess_buyer_growth_984', timestamp: new Date(baseTime + 35000).toISOString(), x: 520, y: 310, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_103', session_id: 'sess_buyer_growth_984', timestamp: new Date(baseTime + 75000).toISOString(), x: 740, y: 310, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_202', session_id: 'sess_hotspot_user_550', timestamp: new Date(baseTime + 610000).toISOString(), x: 520, y: 310, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_203', session_id: 'sess_hotspot_user_550', timestamp: new Date(baseTime + 615000).toISOString(), x: 535, y: 312, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_204', session_id: 'sess_hotspot_user_550', timestamp: new Date(baseTime + 620000).toISOString(), x: 512, y: 308, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_205', session_id: 'sess_hotspot_user_550', timestamp: new Date(baseTime + 625000).toISOString(), x: 528, y: 318, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_206', session_id: 'sess_hotspot_user_550', timestamp: new Date(baseTime + 630000).toISOString(), x: 519, y: 315, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_207', session_id: 'sess_hotspot_user_550', timestamp: new Date(baseTime + 635000).toISOString(), x: 524, y: 311, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_302', session_id: 'sess_researcher_412', timestamp: new Date(baseTime + 330000).toISOString(), x: 300, y: 520, viewport: { width: 1280, height: 800 } },
      { event_id: 'ev_303', session_id: 'sess_researcher_412', timestamp: new Date(baseTime + 370000).toISOString(), x: 640, y: 520, viewport: { width: 1280, height: 800 } },
      { event_id: 'ev_304', session_id: 'sess_researcher_412', timestamp: new Date(baseTime + 410000).toISOString(), x: 960, y: 520, viewport: { width: 1280, height: 800 } }
    ]
  },
  'http://localhost:8080/pricing.html': {
    page_url: 'http://localhost:8080/pricing.html',
    total_clicks: 2,
    clicks: [
      { event_id: 'ev_105', session_id: 'sess_buyer_growth_984', timestamp: new Date(baseTime + 120000).toISOString(), x: 600, y: 550, viewport: { width: 1440, height: 900 } },
      { event_id: 'ev_402', session_id: 'sess_mobile_vis_109', timestamp: new Date(baseTime + 920000).toISOString(), x: 200, y: 480, viewport: { width: 390, height: 844 } }
    ]
  }
};
