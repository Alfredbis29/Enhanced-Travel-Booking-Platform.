import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { aiService } from '../services/openai.js';
import { safirioService } from '../services/safirio.js';
import { query } from '../db/index.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// AI-powered search recommendations
router.post('/recommendations', optionalAuth, [
  body('query').trim().notEmpty().withMessage('Search query is required'),
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { query: userQuery } = req.body;

    // Parse natural language query using AI
    const aiResult = await aiService.parseNaturalLanguageQuery(userQuery);

    // Search trips with parsed parameters
    const searchResults = await safirioService.searchTrips(aiResult.parsed_params);

    // Log search for analytics
    if (req.user) {
      query(
        `INSERT INTO search_history (user_id, query, parsed_params, results_count) 
         VALUES ($1, $2, $3, $4)`,
        [req.user.userId, userQuery, JSON.stringify(aiResult.parsed_params), searchResults.total]
      ).catch(err => console.error('Failed to log AI search:', err));
    }

    res.json({
      success: true,
      data: {
        ai_interpretation: {
          original_query: aiResult.original_query,
          parsed_params: aiResult.parsed_params,
          explanation: aiResult.explanation,
          suggestions: aiResult.suggestions
        },
        search_results: searchResults
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get AI-powered trip suggestions based on user history
router.get('/suggestions', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let preferences: Record<string, unknown> = {};

    // If user is authenticated, analyze their search history
    if (req.user) {
      const historyResult = await query(
        `SELECT parsed_params FROM search_history 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [req.user.userId]
      );

      if (historyResult.rows.length > 0) {
        // Analyze frequent destinations and preferences
        const destinations: Record<string, number> = {};
        const origins: Record<string, number> = {};

        interface SearchHistoryRow {
          parsed_params: { destination?: string; origin?: string };
        }

        historyResult.rows.forEach((row) => {
          const historyRow = row as SearchHistoryRow;
          const params = historyRow.parsed_params;
          if (params.destination) {
            destinations[params.destination] = (destinations[params.destination] || 0) + 1;
          }
          if (params.origin) {
            origins[params.origin] = (origins[params.origin] || 0) + 1;
          }
        });

        preferences = {
          frequent_destinations: Object.entries(destinations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([dest]) => dest),
          frequent_origins: Object.entries(origins)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([origin]) => origin)
        };
      }
    }

    const suggestions = await aiService.generateTripSuggestions(preferences);

    // Get featured trips with multiple travel modes (bus, flight, train, ferry, shuttle)
    const featuredTrips = await safirioService.getFeaturedTrips();

    res.json({
      success: true,
      data: {
        text_suggestions: suggestions,
        featured_trips: featuredTrips,
        popular_destinations: await safirioService.getPopularDestinations()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Chat-style conversation endpoint (for future enhancement)
router.post('/chat', optionalAuth, [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('context').optional().isArray()
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { message } = req.body;

    // Use the recommendation engine for now
    const aiResult = await aiService.parseNaturalLanguageQuery(message);

    // Check if this seems like a search query
    const hasSearchParams = Object.keys(aiResult.parsed_params).length > 0;

    if (hasSearchParams) {
      const searchResults = await safirioService.searchTrips(aiResult.parsed_params);
      
      res.json({
        success: true,
        data: {
          type: 'search_results',
          message: aiResult.explanation,
          parsed_params: aiResult.parsed_params,
          results: searchResults,
          suggestions: aiResult.suggestions
        }
      });
    } else {
      // General response
      res.json({
        success: true,
        data: {
          type: 'general',
          message: "I can help you find buses and trips across Kenya. Try asking something like 'Find me a bus to Mombasa tomorrow' or 'What's the cheapest trip to Kisumu?'",
          suggestions: [
            "Search for buses to Mombasa",
            "Find cheap trips to Kisumu",
            "Show me VIP buses to Eldoret",
            "What buses leave tomorrow?"
          ]
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

