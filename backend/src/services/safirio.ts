import { Trip, SearchParams, SearchResponse } from '../types/index.js';

// Mock data for development - in production, this would call the actual Safirio API
const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip-001',
    provider: 'easy-coach',
    provider_name: 'Easy Coach',
    origin: 'Nairobi',
    destination: 'Mombasa',
    departure_time: '2024-12-15T06:00:00Z',
    arrival_time: '2024-12-15T14:00:00Z',
    duration_minutes: 480,
    price: 1500,
    currency: 'KES',
    available_seats: 24,
    total_seats: 45,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
  },
  {
    id: 'trip-002',
    provider: 'modern-coast',
    provider_name: 'Modern Coast',
    origin: 'Nairobi',
    destination: 'Mombasa',
    departure_time: '2024-12-15T08:00:00Z',
    arrival_time: '2024-12-15T15:30:00Z',
    duration_minutes: 450,
    price: 1800,
    currency: 'KES',
    available_seats: 12,
    total_seats: 40,
    bus_type: 'VIP',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Snacks', 'Entertainment'],
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=400'
  },
  {
    id: 'trip-003',
    provider: 'guardian-angel',
    provider_name: 'Guardian Angel',
    origin: 'Nairobi',
    destination: 'Mombasa',
    departure_time: '2024-12-15T10:00:00Z',
    arrival_time: '2024-12-15T18:30:00Z',
    duration_minutes: 510,
    price: 1200,
    currency: 'KES',
    available_seats: 30,
    total_seats: 52,
    bus_type: 'Standard',
    amenities: ['AC', 'Reclining Seats'],
    rating: 4.0,
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400'
  },
  {
    id: 'trip-004',
    provider: 'easy-coach',
    provider_name: 'Easy Coach',
    origin: 'Nairobi',
    destination: 'Kisumu',
    departure_time: '2024-12-15T07:00:00Z',
    arrival_time: '2024-12-15T13:00:00Z',
    duration_minutes: 360,
    price: 1400,
    currency: 'KES',
    available_seats: 18,
    total_seats: 45,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
  },
  {
    id: 'trip-005',
    provider: 'buscar',
    provider_name: 'BusCar Kenya',
    origin: 'Nairobi',
    destination: 'Nakuru',
    departure_time: '2024-12-15T09:00:00Z',
    arrival_time: '2024-12-15T12:00:00Z',
    duration_minutes: 180,
    price: 800,
    currency: 'KES',
    available_seats: 35,
    total_seats: 50,
    bus_type: 'Standard',
    amenities: ['AC'],
    rating: 3.8,
    image_url: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400'
  },
  {
    id: 'trip-006',
    provider: 'modern-coast',
    provider_name: 'Modern Coast',
    origin: 'Mombasa',
    destination: 'Nairobi',
    departure_time: '2024-12-16T07:00:00Z',
    arrival_time: '2024-12-16T14:30:00Z',
    duration_minutes: 450,
    price: 1700,
    currency: 'KES',
    available_seats: 8,
    total_seats: 40,
    bus_type: 'VIP',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Snacks', 'Entertainment'],
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=400'
  },
  {
    id: 'trip-007',
    provider: 'tahmeed',
    provider_name: 'Tahmeed Express',
    origin: 'Nairobi',
    destination: 'Eldoret',
    departure_time: '2024-12-15T06:30:00Z',
    arrival_time: '2024-12-15T12:30:00Z',
    duration_minutes: 360,
    price: 1300,
    currency: 'KES',
    available_seats: 22,
    total_seats: 44,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging'],
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=400'
  },
  {
    id: 'trip-008',
    provider: 'crown-bus',
    provider_name: 'Crown Bus',
    origin: 'Nairobi',
    destination: 'Mombasa',
    departure_time: '2024-12-15T22:00:00Z',
    arrival_time: '2024-12-16T06:00:00Z',
    duration_minutes: 480,
    price: 1600,
    currency: 'KES',
    available_seats: 40,
    total_seats: 48,
    bus_type: 'Night Coach',
    amenities: ['AC', 'Blankets', 'Reclining Seats', 'USB Charging'],
    rating: 4.2,
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400'
  }
];

class SafirioService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.SAFIRIO_API_URL || 'https://api.safirio.com';
    this.apiKey = process.env.SAFIRIO_API_KEY || '';
  }

  async searchTrips(params: SearchParams): Promise<SearchResponse> {
    // In production, this would make actual API calls to Safirio
    // For now, we use mock data with filtering
    
    let filteredTrips = [...MOCK_TRIPS];

    // Filter by origin
    if (params.origin) {
      filteredTrips = filteredTrips.filter(trip => 
        trip.origin.toLowerCase().includes(params.origin!.toLowerCase())
      );
    }

    // Filter by destination
    if (params.destination) {
      filteredTrips = filteredTrips.filter(trip => 
        trip.destination.toLowerCase().includes(params.destination!.toLowerCase())
      );
    }

    // Filter by date
    if (params.date) {
      const searchDate = new Date(params.date).toDateString();
      filteredTrips = filteredTrips.filter(trip => 
        new Date(trip.departure_time).toDateString() === searchDate
      );
    }

    // Filter by price range
    if (params.min_price !== undefined) {
      filteredTrips = filteredTrips.filter(trip => trip.price >= params.min_price!);
    }
    if (params.max_price !== undefined) {
      filteredTrips = filteredTrips.filter(trip => trip.price <= params.max_price!);
    }

    // Sort
    const sortBy = params.sort_by || 'departure_time';
    const sortOrder = params.sort_order || 'asc';
    
    filteredTrips.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'departure_time':
          comparison = new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
          break;
        case 'duration':
          comparison = (a.duration_minutes || 0) - (b.duration_minutes || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

    return {
      trips: paginatedTrips,
      total: filteredTrips.length,
      page,
      limit,
      has_more: endIndex < filteredTrips.length
    };
  }

  async getTripById(tripId: string): Promise<Trip | null> {
    // In production, this would fetch from the Safirio API
    return MOCK_TRIPS.find(trip => trip.id === tripId) || null;
  }

  async getPopularDestinations(): Promise<string[]> {
    return ['Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Nairobi'];
  }

  async getPopularOrigins(): Promise<string[]> {
    return ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru'];
  }
}

export const safirioService = new SafirioService();

