import { Router } from 'express';
import { getHeatmapData } from '../controllers/heatmapController.js';

const router = Router();

// Retrieve click coordinate data for a page URL
router.get('/', getHeatmapData);

export default router;
