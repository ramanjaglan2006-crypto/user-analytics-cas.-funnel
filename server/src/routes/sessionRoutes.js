import { Router } from 'express';
import { getSessions, getSessionEvents } from '../controllers/sessionController.js';

const router = Router();

// Retrieve all sessions with aggregated activity
router.get('/', getSessions);

// Retrieve ordered timeline of events for a specific session
router.get('/:sessionId/events', getSessionEvents);

export default router;
