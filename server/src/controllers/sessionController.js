import { Event } from '../models/Event.js';

/**
 * GET /api/sessions
 * Retrieve sessions with event counts and latest activity
 */
export async function getSessions(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $group: {
          _id: '$session_id',
          total_events: { $sum: 1 },
          last_activity: { $max: '$timestamp' },
          first_activity: { $min: '$timestamp' },
          page_views: {
            $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] }
          },
          distinct_pages: { $addToSet: '$page_url' }
        }
      },
      {
        $project: {
          _id: 0,
          session_id: '$_id',
          total_events: 1,
          last_activity: 1,
          first_activity: 1,
          page_views: 1,
          clicks: 1,
          page_count: { $size: '$distinct_pages' }
        }
      },
      {
        $sort: { last_activity: -1 }
      }
    ];

    // Get total count of distinct sessions for pagination metadata
    const countResult = await Event.aggregate([
      { $group: { _id: '$session_id' } },
      { $count: 'count' }
    ]);
    const totalSessions = countResult.length > 0 ? countResult[0].count : 0;

    // Apply pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const sessions = await Event.aggregate(pipeline);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        total: totalSessions,
        page,
        limit,
        pages: Math.ceil(totalSessions / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/sessions/:sessionId/events
 * Retrieve chronological event timeline for a specific session
 */
export async function getSessionEvents(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!sessionId || sessionId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'sessionId parameter is required'
        }
      });
    }

    const events = await Event.find({ session_id: sessionId.trim() })
      .sort({ timestamp: 1, _id: 1 })
      .select({
        _id: 1,
        session_id: 1,
        event_type: 1,
        page_url: 1,
        timestamp: 1,
        coordinates: 1,
        viewport: 1
      })
      .lean();

    res.json({
      success: true,
      data: events,
      total: events.length
    });
  } catch (error) {
    next(error);
  }
}
