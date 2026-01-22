import express from 'express';
import {
  getSuggestions,
  getPopularSearches,
  getTrendingSearches,
  getRecentSearches,
  clearSuggestionsCache
} from '../controllers/suggestionsController.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional user identification)
router.get('/', optionalAuth, getSuggestions);
router.get('/popular', getPopularSearches);
router.get('/trending', getTrendingSearches);

// Protected routes (require authentication)
router.get('/recent', authenticate, getRecentSearches);

// Admin routes
router.delete('/cache', authenticate, authorize('admin'), clearSuggestionsCache);

export default router;
