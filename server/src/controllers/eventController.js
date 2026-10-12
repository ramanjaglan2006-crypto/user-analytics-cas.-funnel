import { Event } from '../models/Event.js';

/**
 * POST /api/events
 * Ingest and persist a tracking event
 */
export async function createEvent(req, res, next) {
  try {
    const eventData = req.validatedEvent;
    const event = await Event.create(eventData);

    return res.status(201).json({
      success: true,
      data: {
        event_id: event._id,
        session_id: event.session_id,
        event_type: event.event_type,
        page_url: event.page_url,
        timestamp: event.timestamp,
        coordinates: event.coordinates,
        viewport: event.viewport
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/stats
 * Overview analytics metrics derived strictly from actual database events
 */
export async function getStats(req, res, next) {
  try {
    const [totalEvents, totalClicks, totalPageViews, distinctSessions, distinctPages] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ event_type: 'click' }),
      Event.countDocuments({ event_type: 'page_view' }),
      Event.distinct('session_id'),
      Event.distinct('page_url')
    ]);

    res.json({
      success: true,
      data: {
        total_events: totalEvents,
        total_sessions: distinctSessions.length,
        total_clicks: totalClicks,
        total_page_views: totalPageViews,
        total_pages: distinctPages.length
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/pages
 * Retrieve distinct tracked pages with event breakdowns
 */
export async function getTrackedPages(req, res, next) {
  try {
    const pages = await Event.aggregate([
      {
        $group: {
          _id: '$page_url',
          total_events: { $sum: 1 },
          clicks: {
            $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] }
          },
          page_views: {
            $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] }
          },
          last_activity: { $max: '$timestamp' },
          unique_sessions: { $addToSet: '$session_id' }
        }
      },
      {
        $project: {
          _id: 0,
          page_url: '$_id',
          total_events: 1,
          clicks: 1,
          page_views: 1,
          last_activity: 1,
          unique_sessions_count: { $size: '$unique_sessions' }
        }
      },
      {
        $sort: { total_events: -1, last_activity: -1 }
      }
    ]);

    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    next(error);
  }
}
