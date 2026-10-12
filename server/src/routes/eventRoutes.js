import { Router } from 'express';
import { createEvent, getStats, getTrackedPages } from '../controllers/eventController.js';
import { validateEventPayload } from '../middleware/requestValidator.js';

const router = Router();

// Ingest tracking event
router.post('/', validateEventPayload, createEvent);

// High-level overview statistics
router.get('/stats', getStats);

// List tracked pages with summary counts
router.get('/pages', getTrackedPages);

export default router;
