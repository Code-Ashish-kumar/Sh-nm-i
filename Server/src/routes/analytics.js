import express from 'express';
// Make sure this matches the exact name of your analytics controller file
import { getDashboardAnalytics, getDailyTimeline, getCurrentStreak } from '../controllers/Analytics.js'; 
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Apply auth middleware to protect all analytics endpoints
router.use(auth);

// GET /api/analytics/dashboard
router.get('/dashboard', getDashboardAnalytics);
router.get('/timeline', getDailyTimeline);
router.get('/current_streak', getCurrentStreak);

export { router as analyticsRouter };