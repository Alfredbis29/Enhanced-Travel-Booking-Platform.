import { Trip, SearchParams, SearchResponse } from '../types/index.js';

// Mock data for development - in production, this would call the actual Safirio API
// Expanded for East Africa: Kenya, Uganda, Rwanda, Congo (DRC)
const MOCK_TRIPS: Trip[] = [
  // Kenya Routes
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
  },
  // Uganda Routes
  {
    id: 'trip-009',
    provider: 'easy-coach',
    provider_name: 'Easy Coach',
    origin: 'Nairobi',
    destination: 'Kampala',
    departure_time: '2024-12-15T06:00:00Z',
    arrival_time: '2024-12-15T18:00:00Z',
    duration_minutes: 720,
    price: 3500,
    currency: 'KES',
    available_seats: 20,
    total_seats: 45,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Snacks'],
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
  },
  {
    id: 'trip-010',
    provider: 'modern-coast',
    provider_name: 'Modern Coast',
    origin: 'Nairobi',
    destination: 'Kampala',
    departure_time: '2024-12-15T08:00:00Z',
    arrival_time: '2024-12-15T20:00:00Z',
    duration_minutes: 720,
    price: 4000,
    currency: 'KES',
    available_seats: 15,
    total_seats: 40,
    bus_type: 'VIP',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Snacks', 'Entertainment', 'Meals'],
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=400'
  },
  {
    id: 'trip-011',
    provider: 'simba-coach',
    provider_name: 'Simba Coach',
    origin: 'Kampala',
    destination: 'Nairobi',
    departure_time: '2024-12-16T07:00:00Z',
    arrival_time: '2024-12-16T19:00:00Z',
    duration_minutes: 720,
    price: 3200,
    currency: 'KES',
    available_seats: 28,
    total_seats: 50,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400'
  },
  {
    id: 'trip-012',
    provider: 'jaguar-executive',
    provider_name: 'Jaguar Executive',
    origin: 'Kampala',
    destination: 'Jinja',
    departure_time: '2024-12-15T09:00:00Z',
    arrival_time: '2024-12-15T11:00:00Z',
    duration_minutes: 120,
    price: 15000,
    currency: 'UGX',
    available_seats: 35,
    total_seats: 45,
    bus_type: 'Standard',
    amenities: ['AC'],
    rating: 4.0,
    image_url: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400'
  },
  {
    id: 'trip-013',
    provider: 'link-bus',
    provider_name: 'Link Bus',
    origin: 'Kampala',
    destination: 'Mbarara',
    departure_time: '2024-12-15T08:00:00Z',
    arrival_time: '2024-12-15T13:00:00Z',
    duration_minutes: 300,
    price: 35000,
    currency: 'UGX',
    available_seats: 25,
    total_seats: 52,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging'],
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
  },
  // Rwanda Routes
  {
    id: 'trip-014',
    provider: 'modern-coast',
    provider_name: 'Modern Coast',
    origin: 'Nairobi',
    destination: 'Kigali',
    departure_time: '2024-12-15T06:00:00Z',
    arrival_time: '2024-12-16T06:00:00Z',
    duration_minutes: 1440,
    price: 5500,
    currency: 'KES',
    available_seats: 18,
    total_seats: 40,
    bus_type: 'VIP',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Meals', 'Entertainment', 'Blankets'],
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=400'
  },
  {
    id: 'trip-015',
    provider: 'trinity-express',
    provider_name: 'Trinity Express',
    origin: 'Kampala',
    destination: 'Kigali',
    departure_time: '2024-12-15T07:00:00Z',
    arrival_time: '2024-12-15T17:00:00Z',
    duration_minutes: 600,
    price: 45000,
    currency: 'UGX',
    available_seats: 22,
    total_seats: 45,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Snacks'],
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
  },
  {
    id: 'trip-016',
    provider: 'volcano-express',
    provider_name: 'Volcano Express',
    origin: 'Kigali',
    destination: 'Kampala',
    departure_time: '2024-12-16T06:00:00Z',
    arrival_time: '2024-12-16T16:00:00Z',
    duration_minutes: 600,
    price: 20000,
    currency: 'RWF',
    available_seats: 30,
    total_seats: 48,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400'
  },
  {
    id: 'trip-017',
    provider: 'virunga-express',
    provider_name: 'Virunga Express',
    origin: 'Kigali',
    destination: 'Butare',
    departure_time: '2024-12-15T08:00:00Z',
    arrival_time: '2024-12-15T10:30:00Z',
    duration_minutes: 150,
    price: 5000,
    currency: 'RWF',
    available_seats: 40,
    total_seats: 50,
    bus_type: 'Standard',
    amenities: ['AC'],
    rating: 4.1,
    image_url: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400'
  },
  // Congo (DRC) Routes
  {
    id: 'trip-018',
    provider: 'trans-africa',
    provider_name: 'Trans Africa Express',
    origin: 'Kigali',
    destination: 'Goma',
    departure_time: '2024-12-15T07:00:00Z',
    arrival_time: '2024-12-15T11:00:00Z',
    duration_minutes: 240,
    price: 15000,
    currency: 'RWF',
    available_seats: 25,
    total_seats: 45,
    bus_type: 'Executive',
    amenities: ['AC', 'USB Charging', 'Reclining Seats'],
    rating: 4.2,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
  },
  {
    id: 'trip-019',
    provider: 'great-lakes',
    provider_name: 'Great Lakes Transport',
    origin: 'Kampala',
    destination: 'Goma',
    departure_time: '2024-12-15T06:00:00Z',
    arrival_time: '2024-12-15T18:00:00Z',
    duration_minutes: 720,
    price: 80000,
    currency: 'UGX',
    available_seats: 20,
    total_seats: 40,
    bus_type: 'VIP',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Meals'],
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=400'
  },
  {
    id: 'trip-020',
    provider: 'congo-express',
    provider_name: 'Congo Express',
    origin: 'Goma',
    destination: 'Bukavu',
    departure_time: '2024-12-15T08:00:00Z',
    arrival_time: '2024-12-15T12:00:00Z',
    duration_minutes: 240,
    price: 25,
    currency: 'USD',
    available_seats: 32,
    total_seats: 48,
    bus_type: 'Executive',
    amenities: ['AC', 'USB Charging'],
    rating: 4.0,
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400'
  },
  {
    id: 'trip-021',
    provider: 'trans-africa',
    provider_name: 'Trans Africa Express',
    origin: 'Goma',
    destination: 'Kinshasa',
    departure_time: '2024-12-15T05:00:00Z',
    arrival_time: '2024-12-17T20:00:00Z',
    duration_minutes: 3780,
    price: 150,
    currency: 'USD',
    available_seats: 15,
    total_seats: 40,
    bus_type: 'VIP Long Distance',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Meals', 'Entertainment', 'Blankets', 'Rest Stops'],
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=400'
  },
  // Cross-border Routes
  {
    id: 'trip-022',
    provider: 'easy-coach',
    provider_name: 'Easy Coach',
    origin: 'Mombasa',
    destination: 'Dar es Salaam',
    departure_time: '2024-12-15T06:00:00Z',
    arrival_time: '2024-12-15T18:00:00Z',
    duration_minutes: 720,
    price: 4500,
    currency: 'KES',
    available_seats: 22,
    total_seats: 45,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Snacks'],
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'
  },
  {
    id: 'trip-023',
    provider: 'simba-coach',
    provider_name: 'Simba Coach',
    origin: 'Nairobi',
    destination: 'Arusha',
    departure_time: '2024-12-15T07:00:00Z',
    arrival_time: '2024-12-15T13:00:00Z',
    duration_minutes: 360,
    price: 2500,
    currency: 'KES',
    available_seats: 28,
    total_seats: 50,
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400'
  },
  {
    id: 'trip-024',
    provider: 'kilimanjaro-express',
    provider_name: 'Kilimanjaro Express',
    origin: 'Arusha',
    destination: 'Nairobi',
    departure_time: '2024-12-16T08:00:00Z',
    arrival_time: '2024-12-16T14:00:00Z',
    duration_minutes: 360,
    price: 2800,
    currency: 'KES',
    available_seats: 24,
    total_seats: 45,
    bus_type: 'VIP',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Snacks', 'Entertainment'],
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=400'
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
    // East Africa destinations
    return [
      // Kenya
      'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi',
      // Uganda
      'Kampala', 'Jinja', 'Mbarara', 'Entebbe',
      // Rwanda
      'Kigali', 'Butare', 'Gisenyi',
      // Congo (DRC)
      'Goma', 'Bukavu', 'Kinshasa',
      // Tanzania (bonus)
      'Dar es Salaam', 'Arusha', 'Mwanza'
    ];
  }

  async getPopularOrigins(): Promise<string[]> {
    return [
      // Kenya
      'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret',
      // Uganda
      'Kampala', 'Jinja',
      // Rwanda
      'Kigali',
      // Congo (DRC)
      'Goma', 'Kinshasa',
      // Tanzania
      'Dar es Salaam', 'Arusha'
    ];
  }
}

export const safirioService = new SafirioService();
