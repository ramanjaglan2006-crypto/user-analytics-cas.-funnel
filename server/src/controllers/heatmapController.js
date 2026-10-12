import { Event } from '../models/Event.js';

/**
 * GET /api/heatmap?url=...
 * Retrieve click events and coordinates for a given page URL
 */
export async function getHeatmapData(req, res, next) {
  try {
    const rawUrl = req.query.url;

    if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Query parameter "url" is required'
        }
      });
    }

    // Decode URL if it was percent-encoded
    const targetUrl = decodeURIComponent(rawUrl.trim());

    // Query exclusively click events for this page URL
    const clickEvents = await Event.find({
      page_url: targetUrl,
      event_type: 'click',
      'coordinates.x': { $exists: true, $ne: null },
      'coordinates.y': { $exists: true, $ne: null }
    })
      .sort({ timestamp: -1 })
      .select({
        _id: 1,
        session_id: 1,
        timestamp: 1,
        coordinates: 1,
        viewport: 1
      })
      .lean();

    const formattedClicks = clickEvents.map((event) => ({
      event_id: event._id,
      session_id: event.session_id,
      timestamp: event.timestamp,
      x: event.coordinates.x,
      y: event.coordinates.y,
      viewport: event.viewport || null
    }));

    res.json({
      success: true,
      data: {
        page_url: targetUrl,
        total_clicks: formattedClicks.length,
        clicks: formattedClicks
      }
    });
  } catch (error) {
    next(error);
  }
}
