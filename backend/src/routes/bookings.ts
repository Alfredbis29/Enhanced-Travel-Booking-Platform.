import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/index.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { safirioService } from '../services/safirio.js';
import { sendBookingConfirmationEmail } from '../services/email.js';

const router = Router();

// Booking type for database queries
interface DbBooking {
  id: string;
  user_id: string;
  trip_id: string;
  trip_provider: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string | null;
  price: number;
  currency: string;
  seats: number;
  status: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string | null;
  booking_reference: string;
  created_at: string;
  updated_at: string;
}

// All booking routes require authentication
router.use(authenticate);

// Create a new booking
router.post('/', [
  body('trip_id').notEmpty().withMessage('Trip ID is required'),
  body('seats').isInt({ min: 1, max: 10 }).withMessage('Number of seats must be between 1 and 10'),
  body('passenger_name').trim().notEmpty().withMessage('Passenger name is required'),
  body('passenger_phone').trim().notEmpty().withMessage('Passenger phone is required'),
  body('passenger_email').optional().isEmail().withMessage('Valid email required')
], async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { trip_id, seats, passenger_name, passenger_phone, passenger_email } = req.body;

    // Get trip details
    const trip = await safirioService.getTripById(trip_id);
    if (!trip) {
      throw new AppError('Trip not found', 404);
    }

    // Check seat availability
    if (trip.available_seats < seats) {
      throw new AppError(`Only ${trip.available_seats} seats available`, 400);
    }

    // Generate booking reference
    const bookingReference = `TRV-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Calculate total price
    const totalPrice = trip.price * seats;

    // Create booking
    const result = await query(
      `INSERT INTO bookings (
        user_id, trip_id, trip_provider, origin, destination,
        departure_time, arrival_time, price, currency, seats,
        status, passenger_name, passenger_phone, passenger_email, booking_reference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        req.user!.userId,
        trip_id,
        trip.provider,
        trip.origin,
        trip.destination,
        trip.departure_time,
        trip.arrival_time || null,
        totalPrice,
        trip.currency,
        seats,
        'pending',
        passenger_name,
        passenger_phone,
        passenger_email || null,
        bookingReference
      ]
    );

    const booking = result.rows[0] as DbBooking;

    // Send booking confirmation email (async, don't block response)
    if (passenger_email) {
      sendBookingConfirmationEmail({
        bookingReference,
        passengerName: passenger_name,
        passengerEmail: passenger_email,
        origin: trip.origin,
        destination: trip.destination,
        departureTime: trip.departure_time,
        arrivalTime: trip.arrival_time,
        seats,
        price: totalPrice,
        currency: trip.currency,
        travelMode: trip.travel_mode,
        providerName: trip.provider_name
      }).catch(err => {
        console.error('Failed to send booking confirmation email:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: {
          ...booking,
          trip_details: {
            provider_name: trip.provider_name,
            bus_type: trip.bus_type,
            amenities: trip.amenities,
            image_url: trip.image_url
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all bookings for current user
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    const params: unknown[] = [req.user!.userId];

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM bookings ${whereClause}`,
      params
    );
    const countRow = countResult.rows[0] as { count: string };
    const total = parseInt(countRow.count);

    // Get bookings
    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM bookings ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      success: true,
      data: {
        bookings: result.rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          has_more: offset + result.rows.length < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific booking
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Booking not found', 404);
    }

    const booking = result.rows[0] as DbBooking;

    // Get trip details
    const trip = await safirioService.getTripById(booking.trip_id);

    res.json({
      success: true,
      data: {
        booking: {
          ...booking,
          trip_details: trip ? {
            provider_name: trip.provider_name,
            bus_type: trip.bus_type,
            amenities: trip.amenities,
            image_url: trip.image_url,
            rating: trip.rating
          } : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Confirm booking (simulated payment)
router.post('/:id/confirm', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `UPDATE bookings 
       SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING *`,
      [req.params.id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Booking not found or already processed', 404);
    }

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: { booking: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.post('/:id/cancel', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `UPDATE bookings 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'confirmed')
       RETURNING *`,
      [req.params.id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Booking not found or cannot be cancelled', 404);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Get booking by reference (public lookup)
router.get('/reference/:ref', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT id, booking_reference, origin, destination, departure_time, 
              arrival_time, price, currency, seats, status, passenger_name,
              created_at, trip_provider
       FROM bookings WHERE booking_reference = $1 AND user_id = $2`,
      [req.params.ref.toUpperCase(), req.user!.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Booking not found', 404);
    }

    res.json({
      success: true,
      data: { booking: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Delete booking permanently
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // First check if the booking exists and belongs to the user
    const checkResult = await query(
      'SELECT id, status FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    if (checkResult.rows.length === 0) {
      throw new AppError('Booking not found', 404);
    }

    const booking = checkResult.rows[0] as { id: string; status: string };

    // Only allow deletion of cancelled or completed bookings
    if (booking.status === 'pending' || booking.status === 'confirmed') {
      throw new AppError('Cannot delete active bookings. Please cancel the booking first.', 400);
    }

    // Delete the booking
    await query(
      'DELETE FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

