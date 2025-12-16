import request from 'supertest';
import express from 'express';
import searchRoutes from '../../routes/search';

const app = express();
app.use(express.json());
app.use('/api/search', searchRoutes);

describe('Search Routes', () => {
  describe('GET /api/search', () => {
    it('should return trips without filters', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.trips).toBeDefined();
      expect(Array.isArray(response.body.data.trips)).toBe(true);
    });

    it('should return trips with origin filter', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ origin: 'Nairobi' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.trips.forEach((trip: { origin: string }) => {
        expect(trip.origin).toBe('Nairobi');
      });
    });

    it('should return trips with destination filter', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ destination: 'Mombasa' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.trips.forEach((trip: { destination: string }) => {
        expect(trip.destination).toBe('Mombasa');
      });
    });

    it('should return trips with origin and destination filters', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ origin: 'Nairobi', destination: 'Mombasa' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.data.page).toBe(1);
      expect(response.body.data.trips.length).toBeLessThanOrEqual(5);
    });

    it('should limit results to max 50', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ limit: 100 })
        .expect(200);

      expect(response.body.data.trips.length).toBeLessThanOrEqual(50);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ min_price: 1000, max_price: 3000 })
        .expect(200);

      response.body.data.trips.forEach((trip: { price: number }) => {
        expect(trip.price).toBeGreaterThanOrEqual(1000);
        expect(trip.price).toBeLessThanOrEqual(3000);
      });
    });

    it('should sort by price ascending', async () => {
      const response = await request(app)
        .get('/api/search')
        .query({ sort_by: 'price', sort_order: 'asc' })
        .expect(200);

      const trips = response.body.data.trips;
      if (trips.length > 1) {
        for (let i = 1; i < trips.length; i++) {
          expect(trips[i].price).toBeGreaterThanOrEqual(trips[i-1].price);
        }
      }
    });

    it('should return pagination metadata', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(200);

      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.page).toBeDefined();
      expect(response.body.data.has_more).toBeDefined();
    });
  });

  describe('GET /api/search/trip/:id', () => {
    it('should return trip by ID', async () => {
      // First get a list of trips
      const listResponse = await request(app)
        .get('/api/search')
        .expect(200);

      if (listResponse.body.data.trips.length > 0) {
        const tripId = listResponse.body.data.trips[0].id;
        
        const response = await request(app)
          .get(`/api/search/trip/${tripId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.trip).toBeDefined();
        expect(response.body.data.trip.id).toBe(tripId);
      }
    });

    it('should return 404 for non-existent trip', async () => {
      const response = await request(app)
        .get('/api/search/trip/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Trip not found');
    });
  });

  describe('GET /api/search/destinations', () => {
    it('should return list of destinations', async () => {
      const response = await request(app)
        .get('/api/search/destinations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.destinations).toBeDefined();
      expect(Array.isArray(response.body.data.destinations)).toBe(true);
      expect(response.body.data.destinations.length).toBeGreaterThan(0);
    });

    it('should include major cities', async () => {
      const response = await request(app)
        .get('/api/search/destinations')
        .expect(200);

      const destinations = response.body.data.destinations;
      expect(destinations.some((d: string) => ['Nairobi', 'Mombasa', 'Kampala', 'Kigali'].includes(d))).toBe(true);
    });
  });

  describe('GET /api/search/origins', () => {
    it('should return list of origins', async () => {
      const response = await request(app)
        .get('/api/search/origins')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.origins).toBeDefined();
      expect(Array.isArray(response.body.data.origins)).toBe(true);
    });
  });

  describe('GET /api/search/modes', () => {
    it('should return available travel modes', async () => {
      const response = await request(app)
        .get('/api/search/modes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.modes).toBeDefined();
      expect(Array.isArray(response.body.data.modes)).toBe(true);
      expect(response.body.data.modes).toContain('bus');
    });

    it('should return mode info', async () => {
      const response = await request(app)
        .get('/api/search/modes')
        .expect(200);

      expect(response.body.data.mode_info).toBeDefined();
      expect(response.body.data.mode_info.bus).toBeDefined();
      expect(response.body.data.mode_info.bus.name).toBe('Bus');
    });
  });

  describe('GET /api/search/featured', () => {
    it('should return featured trips', async () => {
      const response = await request(app)
        .get('/api/search/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.featured_trips).toBeDefined();
      expect(Array.isArray(response.body.data.featured_trips)).toBe(true);
    });
  });
});


