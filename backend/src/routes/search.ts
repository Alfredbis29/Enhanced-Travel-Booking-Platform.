import { Router, Request, Response, NextFunction } from 'express';
import { query as dbQuery } from '../db/index.js';
import { safirioService } from '../services/safirio.js';
import { SearchParams, TravelMode } from '../types/index.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Search trips
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const searchParams: SearchParams = {
      origin: req.query.origin as string,
      destination: req.query.destination as string,
      date: req.query.date as string,
      min_price: req.query.min_price ? parseInt(req.query.min_price as string) : undefined,
      max_price: req.query.max_price ? parseInt(req.query.max_price as string) : undefined,
      travel_mode: req.query.mode as TravelMode,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? Math.min(parseInt(req.query.limit as string), 50) : 10,
      sort_by: req.query.sort_by as SearchParams['sort_by'],
      sort_order: req.query.sort_order as SearchParams['sort_order']
    };

    // Clean undefined values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key as keyof SearchParams] === undefined) {
        delete searchParams[key as keyof SearchParams];
      }
    });

    const results = await safirioService.searchTrips(searchParams);

    // Log search for analytics (non-blocking)
    if (req.user) {
      dbQuery(
        `INSERT INTO search_history (user_id, query, parsed_params, results_count) 
         VALUES ($1, $2, $3, $4)`,
        [req.user.userId, JSON.stringify(req.query), JSON.stringify(searchParams), results.total]
      ).catch(err => console.error('Failed to log search:', err));
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

// Get trip by ID
router.get('/trip/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trip = await safirioService.getTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      data: { trip }
    });
  } catch (error) {
    next(error);
  }
});

// Get popular destinations
router.get('/destinations', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const destinations = await safirioService.getPopularDestinations();
    
    res.json({
      success: true,
      data: { destinations }
    });
  } catch (error) {
    next(error);
  }
});

// Get popular origins
router.get('/origins', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const origins = await safirioService.getPopularOrigins();
    
    res.json({
      success: true,
      data: { origins }
    });
  } catch (error) {
    next(error);
  }
});

// Get available travel modes
router.get('/modes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const modes = await safirioService.getTravelModes();
    
    res.json({
      success: true,
      data: { 
        modes,
        mode_info: {
          bus: { name: 'Bus', emoji: '🚌', description: 'Comfortable bus travel across East Africa' },
          flight: { name: 'Flight', emoji: '✈️', description: 'Fast air travel between major cities' },
          train: { name: 'Train', emoji: '🚂', description: 'Scenic rail journeys including SGR' },
          ferry: { name: 'Ferry', emoji: '⛴️', description: 'Lake and coastal ferry services' },
          shuttle: { name: 'Shuttle', emoji: '🚐', description: 'Airport and city shuttle services' }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get featured trips (multi-modal)
router.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const featured_trips = await safirioService.getFeaturedTrips();
    
    res.json({
      success: true,
      data: { featured_trips }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

