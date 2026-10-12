/**
 * Validation middleware for incoming event ingestion
 */
export function validateEventPayload(req, res, next) {
  const { session_id, event_type, page_url, timestamp, coordinates, viewport } = req.body;

  // 1. session_id validation
  if (!session_id || typeof session_id !== 'string' || session_id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid session_id: Must be a non-empty string',
        field: 'session_id'
      }
    });
  }

  // 2. event_type validation
  if (!event_type || !['page_view', 'click'].includes(event_type)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid event_type: Must be either "page_view" or "click"',
        field: 'event_type'
      }
    });
  }

  // 3. page_url validation
  if (!page_url || typeof page_url !== 'string' || page_url.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid page_url: Must be a non-empty string',
        field: 'page_url'
      }
    });
  }

  // Basic URL format or relative path check
  try {
    // If it's a full URL, new URL() succeeds; if relative, ensure it starts with / or http
    if (!page_url.startsWith('/') && !page_url.startsWith('http://') && !page_url.startsWith('https://')) {
      new URL(page_url);
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid page_url format',
        field: 'page_url'
      }
    });
  }

  // 4. timestamp validation (if provided)
  let parsedTimestamp = new Date();
  if (timestamp !== undefined && timestamp !== null) {
    parsedTimestamp = new Date(timestamp);
    if (isNaN(parsedTimestamp.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid timestamp: Must be a valid date or ISO string',
          field: 'timestamp'
        }
      });
    }
  }

  // 5. click event coordinates validation
  if (event_type === 'click') {
    if (!coordinates || typeof coordinates !== 'object') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Click events require a coordinates object with x and y values',
          field: 'coordinates'
        }
      });
    }

    const { x, y } = coordinates;
    if (typeof x !== 'number' || !Number.isFinite(x) || x < 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Coordinate x must be a non-negative finite number',
          field: 'coordinates.x'
        }
      });
    }

    if (typeof y !== 'number' || !Number.isFinite(y) || y < 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Coordinate y must be a non-negative finite number',
          field: 'coordinates.y'
        }
      });
    }
  }

  // 6. Viewport validation if provided
  if (viewport) {
    if (viewport.width !== undefined && (typeof viewport.width !== 'number' || viewport.width < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Viewport width must be a non-negative number',
          field: 'viewport.width'
        }
      });
    }
    if (viewport.height !== undefined && (typeof viewport.height !== 'number' || viewport.height < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Viewport height must be a non-negative number',
          field: 'viewport.height'
        }
      });
    }
  }

  req.validatedEvent = {
    session_id: session_id.trim(),
    event_type,
    page_url: page_url.trim(),
    timestamp: parsedTimestamp,
    coordinates: event_type === 'click' ? { x: Math.round(coordinates.x), y: Math.round(coordinates.y) } : undefined,
    viewport: viewport ? { width: Math.round(viewport.width), height: Math.round(viewport.height) } : undefined
  };

  next();
}
