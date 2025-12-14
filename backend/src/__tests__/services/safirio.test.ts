import { safirioService } from '../../services/safirio';

describe('SafirioService', () => {
  describe('searchTrips', () => {
    it('should search trips by origin and destination', async () => {
      const results = await safirioService.searchTrips({
        origin: 'Nairobi',
        destination: 'Mombasa'
      });

      expect(results).toBeDefined();
      expect(results.trips).toBeDefined();
      expect(Array.isArray(results.trips)).toBe(true);
    });

    it('should search trips with pagination', async () => {
      const results = await safirioService.searchTrips({
        origin: 'Nairobi',
        page: 1,
        limit: 5
      });

      expect(results.page).toBe(1);
      expect(results.trips.length).toBeLessThanOrEqual(5);
    });

    it('should search trips by price range', async () => {
      const results = await safirioService.searchTrips({
        origin: 'Nairobi',
        min_price: 1000,
        max_price: 2000
      });

      results.trips.forEach(trip => {
        expect(trip.price).toBeGreaterThanOrEqual(1000);
        expect(trip.price).toBeLessThanOrEqual(2000);
      });
    });

    it('should sort trips by price ascending', async () => {
      const results = await safirioService.searchTrips({
        origin: 'Nairobi',
        sort_by: 'price',
        sort_order: 'asc'
      });

      if (results.trips.length > 1) {
        for (let i = 1; i < results.trips.length; i++) {
          expect(results.trips[i].price).toBeGreaterThanOrEqual(results.trips[i-1].price);
        }
      }
    });

    it('should sort trips by price descending', async () => {
      const results = await safirioService.searchTrips({
        origin: 'Nairobi',
        sort_by: 'price',
        sort_order: 'desc'
      });

      if (results.trips.length > 1) {
        for (let i = 1; i < results.trips.length; i++) {
          expect(results.trips[i].price).toBeLessThanOrEqual(results.trips[i-1].price);
        }
      }
    });

    it('should return correct pagination info', async () => {
      const results = await safirioService.searchTrips({
        page: 1,
        limit: 5
      });

      expect(results.page).toBe(1);
      expect(results.limit).toBe(5);
      expect(results.total).toBeGreaterThanOrEqual(0);
      expect(typeof results.has_more).toBe('boolean');
    });

    it('should handle empty search results', async () => {
      const results = await safirioService.searchTrips({
        origin: 'NonExistentCity',
        destination: 'AnotherNonExistentCity'
      });

      expect(results.trips).toEqual([]);
      expect(results.total).toBe(0);
    });
  });

  describe('getTripById', () => {
    it('should return trip by valid ID', async () => {
      // First get a list of trips to get a valid ID
      const searchResults = await safirioService.searchTrips({});
      
      if (searchResults.trips.length > 0) {
        const tripId = searchResults.trips[0].id;
        const trip = await safirioService.getTripById(tripId);
        
        expect(trip).toBeDefined();
        expect(trip?.id).toBe(tripId);
        expect(trip?.origin).toBeDefined();
        expect(trip?.destination).toBeDefined();
        expect(trip?.price).toBeDefined();
      }
    });

    it('should return null for invalid ID', async () => {
      const trip = await safirioService.getTripById('non-existent-id');
      expect(trip).toBeNull();
    });
  });

  describe('getPopularDestinations', () => {
    it('should return list of popular destinations', async () => {
      const destinations = await safirioService.getPopularDestinations();
      
      expect(destinations).toBeDefined();
      expect(Array.isArray(destinations)).toBe(true);
      expect(destinations.length).toBeGreaterThan(0);
    });

    it('should include major East African cities', async () => {
      const destinations = await safirioService.getPopularDestinations();
      
      // Check for at least some major cities
      const majorCities = ['Nairobi', 'Mombasa', 'Kampala', 'Kigali'];
      const hasAtLeastOneMajorCity = majorCities.some(city => 
        destinations.includes(city)
      );
      
      expect(hasAtLeastOneMajorCity).toBe(true);
    });
  });

  describe('getPopularOrigins', () => {
    it('should return list of popular origins', async () => {
      const origins = await safirioService.getPopularOrigins();
      
      expect(origins).toBeDefined();
      expect(Array.isArray(origins)).toBe(true);
      expect(origins.length).toBeGreaterThan(0);
    });
  });

  describe('getFeaturedTrips', () => {
    it('should return featured trips', async () => {
      const featuredTrips = await safirioService.getFeaturedTrips();
      
      expect(featuredTrips).toBeDefined();
      expect(Array.isArray(featuredTrips)).toBe(true);
    });

    it('should return trips with required fields', async () => {
      const featuredTrips = await safirioService.getFeaturedTrips();
      
      featuredTrips.forEach(trip => {
        expect(trip.id).toBeDefined();
        expect(trip.origin).toBeDefined();
        expect(trip.destination).toBeDefined();
        expect(trip.price).toBeDefined();
        expect(trip.provider_name).toBeDefined();
      });
    });
  });

  describe('getTravelModes', () => {
    it('should return available travel modes', async () => {
      const modes = await safirioService.getTravelModes();
      
      expect(modes).toBeDefined();
      expect(Array.isArray(modes)).toBe(true);
      expect(modes).toContain('bus');
    });
  });

  describe('Trip data validation', () => {
    it('should have valid trip structure', async () => {
      const results = await safirioService.searchTrips({ limit: 10 });
      
      results.trips.forEach(trip => {
        expect(typeof trip.id).toBe('string');
        expect(typeof trip.provider).toBe('string');
        expect(typeof trip.provider_name).toBe('string');
        expect(typeof trip.origin).toBe('string');
        expect(typeof trip.destination).toBe('string');
        expect(typeof trip.departure_time).toBe('string');
        expect(typeof trip.price).toBe('number');
        expect(trip.price).toBeGreaterThan(0);
        expect(typeof trip.available_seats).toBe('number');
        expect(trip.available_seats).toBeGreaterThanOrEqual(0);
        expect(typeof trip.total_seats).toBe('number');
        expect(trip.total_seats).toBeGreaterThan(0);
        expect(typeof trip.currency).toBe('string');
      });
    });

    it('should have valid currency codes', async () => {
      const results = await safirioService.searchTrips({ limit: 20 });
      const validCurrencies = ['KES', 'UGX', 'RWF', 'CDF', 'USD', 'TZS'];
      
      results.trips.forEach(trip => {
        expect(validCurrencies).toContain(trip.currency);
      });
    });
  });

  describe('Cross-border routes', () => {
    it('should include Nairobi to Kampala route', async () => {
      const results = await safirioService.searchTrips({
        origin: 'Nairobi',
        destination: 'Kampala'
      });

      expect(results.trips.length).toBeGreaterThan(0);
    });

    it('should include Nairobi to Kigali route', async () => {
      const results = await safirioService.searchTrips({
        origin: 'Nairobi',
        destination: 'Kigali'
      });

      expect(results.trips.length).toBeGreaterThan(0);
    });

    it('should include Kigali to Goma route', async () => {
      const results = await safirioService.searchTrips({
        origin: 'Kigali',
        destination: 'Goma'
      });

      expect(results.trips.length).toBeGreaterThan(0);
    });
  });
});

