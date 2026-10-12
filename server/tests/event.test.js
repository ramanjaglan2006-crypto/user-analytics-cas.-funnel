import { describe, it, expect } from 'vitest';
import { Event } from '../src/models/Event.js';
import './setup.js';

describe('Event Model Validation Tests', () => {
  it('should successfully save a valid page_view event without coordinates', async () => {
    const validPageView = new Event({
      session_id: 'test_session_1',
      event_type: 'page_view',
      page_url: 'http://localhost:5173/home',
      timestamp: new Date()
    });

    const saved = await validPageView.save();
    expect(saved._id).toBeDefined();
    expect(saved.session_id).toBe('test_session_1');
    expect(saved.event_type).toBe('page_view');
    expect(saved.coordinates).toBeUndefined();
  });

  it('should successfully save a valid click event with coordinates', async () => {
    const validClick = new Event({
      session_id: 'test_session_1',
      event_type: 'click',
      page_url: 'http://localhost:5173/home',
      timestamp: new Date(),
      coordinates: {
        x: 420,
        y: 180
      }
    });

    const saved = await validClick.save();
    expect(saved._id).toBeDefined();
    expect(saved.coordinates.x).toBe(420);
    expect(saved.coordinates.y).toBe(180);
  });

  it('should fail validation when session_id is missing or empty', async () => {
    const missingSession = new Event({
      event_type: 'page_view',
      page_url: 'http://localhost:5173/'
    });

    await expect(missingSession.save()).rejects.toThrow();
  });

  it('should fail validation when event_type is not page_view or click', async () => {
    const invalidType = new Event({
      session_id: 'test_session_1',
      event_type: 'scroll',
      page_url: 'http://localhost:5173/'
    });

    await expect(invalidType.save()).rejects.toThrow();
  });

  it('should fail validation when click event has missing coordinates', async () => {
    const missingCoords = new Event({
      session_id: 'test_session_1',
      event_type: 'click',
      page_url: 'http://localhost:5173/'
    });

    await expect(missingCoords.save()).rejects.toThrow(/Click events must include valid x and y coordinates/);
  });

  it('should fail validation when click event has negative coordinates', async () => {
    const negativeCoords = new Event({
      session_id: 'test_session_1',
      event_type: 'click',
      page_url: 'http://localhost:5173/',
      coordinates: {
        x: -10,
        y: 20
      }
    });

    await expect(negativeCoords.save()).rejects.toThrow();
  });

  it('should fail validation when click event has non-numeric coordinates', async () => {
    const nonNumericCoords = new Event({
      session_id: 'test_session_1',
      event_type: 'click',
      page_url: 'http://localhost:5173/',
      coordinates: {
        x: NaN,
        y: 20
      }
    });

    await expect(nonNumericCoords.save()).rejects.toThrow();
  });
});
