import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Event } from '../src/models/Event.js';
import './setup.js';

describe('User Analytics API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database.connected).toBe(true);
    });
  });

  describe('POST /api/events', () => {
    it('should successfully ingest a page_view event', async () => {
      const payload = {
        session_id: 'session_abc123',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/products',
        timestamp: new Date().toISOString()
      };

      const res = await request(app)
        .post('/api/events')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event_id).toBeDefined();
      expect(res.body.data.session_id).toBe(payload.session_id);
      expect(res.body.data.event_type).toBe('page_view');

      // Verify event is saved in database
      const count = await Event.countDocuments({ session_id: 'session_abc123' });
      expect(count).toBe(1);
    });

    it('should successfully ingest a click event with coordinates', async () => {
      const payload = {
        session_id: 'session_abc123',
        event_type: 'click',
        page_url: 'http://localhost:5173/products',
        timestamp: new Date().toISOString(),
        coordinates: {
          x: 250,
          y: 340
        },
        viewport: {
          width: 1280,
          height: 800
        }
      };

      const res = await request(app)
        .post('/api/events')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coordinates).toEqual({ x: 250, y: 340 });
    });

    it('should reject an event with missing session_id (400)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          event_type: 'page_view',
          page_url: 'http://localhost:5173/'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('session_id');
    });

    it('should reject a click event with missing coordinates (400)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          session_id: 'sess_1',
          event_type: 'click',
          page_url: 'http://localhost:5173/'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('coordinates');
    });

    it('should reject a click event with negative coordinates (400)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          session_id: 'sess_1',
          event_type: 'click',
          page_url: 'http://localhost:5173/',
          coordinates: { x: -5, y: 10 }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/sessions', () => {
    it('should return aggregated sessions ordered by last_activity', async () => {
      const t1 = new Date('2026-10-12T10:00:00Z');
      const t2 = new Date('2026-10-12T11:00:00Z');
      const t3 = new Date('2026-10-12T12:00:00Z');

      // Session 1: 2 events, last activity at 11:00
      await Event.create({
        session_id: 'session_older',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/',
        timestamp: t1
      });
      await Event.create({
        session_id: 'session_older',
        event_type: 'click',
        page_url: 'http://localhost:5173/',
        timestamp: t2,
        coordinates: { x: 10, y: 20 }
      });

      // Session 2: 1 event, last activity at 12:00
      await Event.create({
        session_id: 'session_newer',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/pricing',
        timestamp: t3
      });

      const res = await request(app).get('/api/sessions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);

      // Verify order: newest session first
      expect(res.body.data[0].session_id).toBe('session_newer');
      expect(res.body.data[0].total_events).toBe(1);

      expect(res.body.data[1].session_id).toBe('session_older');
      expect(res.body.data[1].total_events).toBe(2);
      expect(res.body.data[1].clicks).toBe(1);
      expect(res.body.data[1].page_views).toBe(1);
    });

    it('should return empty list gracefully when no events exist', async () => {
      const res = await request(app).get('/api/sessions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/sessions/:sessionId/events', () => {
    it('should retrieve events for a session in chronological order', async () => {
      const t1 = new Date('2026-10-12T10:00:00Z');
      const t2 = new Date('2026-10-12T10:05:00Z');
      const t3 = new Date('2026-10-12T10:10:00Z');

      await Event.create({
        session_id: 'user_journey_sess',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/home',
        timestamp: t1
      });
      await Event.create({
        session_id: 'user_journey_sess',
        event_type: 'click',
        page_url: 'http://localhost:5173/home',
        timestamp: t3,
        coordinates: { x: 100, y: 150 }
      });
      await Event.create({
        session_id: 'user_journey_sess',
        event_type: 'click',
        page_url: 'http://localhost:5173/home',
        timestamp: t2,
        coordinates: { x: 50, y: 80 }
      });

      const res = await request(app).get('/api/sessions/user_journey_sess/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);

      // Verify chronological sorting (t1 -> t2 -> t3)
      expect(res.body.data[0].event_type).toBe('page_view');
      expect(res.body.data[1].coordinates.x).toBe(50);
      expect(res.body.data[2].coordinates.x).toBe(100);
    });

    it('should return empty array for non-existent session', async () => {
      const res = await request(app).get('/api/sessions/non_existent/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/heatmap?url=...', () => {
    it('should retrieve only click events for the specified page URL', async () => {
      const pageTarget = 'http://localhost:5173/demo';

      // Page view on target page (should be excluded)
      await Event.create({
        session_id: 's1',
        event_type: 'page_view',
        page_url: pageTarget,
        timestamp: new Date()
      });

      // Clicks on target page (should be included)
      await Event.create({
        session_id: 's1',
        event_type: 'click',
        page_url: pageTarget,
        timestamp: new Date(),
        coordinates: { x: 120, y: 220 }
      });
      await Event.create({
        session_id: 's2',
        event_type: 'click',
        page_url: pageTarget,
        timestamp: new Date(),
        coordinates: { x: 300, y: 400 }
      });

      // Click on a different page (should be excluded)
      await Event.create({
        session_id: 's1',
        event_type: 'click',
        page_url: 'http://localhost:5173/other',
        timestamp: new Date(),
        coordinates: { x: 999, y: 999 }
      });

      const res = await request(app).get(`/api/heatmap?url=${encodeURIComponent(pageTarget)}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.page_url).toBe(pageTarget);
      expect(res.body.data.total_clicks).toBe(2);
      expect(res.body.data.clicks.length).toBe(2);
      expect(res.body.data.clicks[0].x).toBeDefined();
      expect(res.body.data.clicks[0].y).toBeDefined();
    });

    it('should return 400 when url query parameter is missing', async () => {
      const res = await request(app).get('/api/heatmap');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/pages and GET /api/stats', () => {
    it('should return distinct pages and overview stats', async () => {
      await Event.create({
        session_id: 'sess_1',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/page1',
        timestamp: new Date()
      });
      await Event.create({
        session_id: 'sess_1',
        event_type: 'click',
        page_url: 'http://localhost:5173/page1',
        timestamp: new Date(),
        coordinates: { x: 50, y: 50 }
      });
      await Event.create({
        session_id: 'sess_2',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/page2',
        timestamp: new Date()
      });

      const statsRes = await request(app).get('/api/stats');
      expect(statsRes.status).toBe(200);
      expect(statsRes.body.data.total_events).toBe(3);
      expect(statsRes.body.data.total_sessions).toBe(2);
      expect(statsRes.body.data.total_clicks).toBe(1);
      expect(statsRes.body.data.total_page_views).toBe(2);

      const pagesRes = await request(app).get('/api/pages');
      expect(pagesRes.status).toBe(200);
      expect(pagesRes.body.data.length).toBe(2);
    });
  });
});
