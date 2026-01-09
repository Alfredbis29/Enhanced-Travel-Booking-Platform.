import { Trip, SearchParams, SearchResponse } from '../types/index.js';

// Travel mode type
type TravelMode = 'bus' | 'flight' | 'train' | 'ferry' | 'shuttle';

// Real images by travel mode
const TRAVEL_IMAGES = {
  bus: [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop&q=80',
  ],
  flight: [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&h=400&fit=crop&q=80',
  ],
  train: [
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=600&h=400&fit=crop&q=80',
  ],
  ferry: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&h=400&fit=crop&q=80',
  ],
  shuttle: [
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=600&h=400&fit=crop&q=80',
  ],
};

// Helper to get dynamic dates
const getDynamicDate = (daysFromNow: number, hour: number = 6): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const getArrivalDate = (departureDate: string, durationMinutes: number): string => {
  const departure = new Date(departureDate);
  departure.setMinutes(departure.getMinutes() + durationMinutes);
  return departure.toISOString();
};

const getImage = (mode: TravelMode, index: number): string => {
  const images = TRAVEL_IMAGES[mode];
  return images[index % images.length];
};

// Mock trips with multiple travel modes
const createMockTrips = (): Trip[] => [
  // ========== BUSES ==========
  { id: 'bus-001', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 480), duration_minutes: 480, price: 1500, currency: 'KES', available_seats: 24, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'], rating: 4.5, image_url: getImage('bus', 0) },
  { id: 'bus-002', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 450), duration_minutes: 450, price: 1800, currency: 'KES', available_seats: 12, total_seats: 40, travel_mode: 'bus', bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks', 'Entertainment'], rating: 4.8, image_url: getImage('bus', 1) },
  { id: 'bus-003', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Kampala', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 720), duration_minutes: 720, price: 3500, currency: 'KES', available_seats: 15, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks', 'Border Assistance'], rating: 4.6, image_url: getImage('bus', 2) },
  { id: 'bus-004', provider: 'jaguar-executive', provider_name: 'Jaguar Executive', origin: 'Kampala', destination: 'Kigali', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 540), duration_minutes: 540, price: 80000, currency: 'UGX', available_seats: 12, total_seats: 40, travel_mode: 'bus', bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Meals'], rating: 4.7, image_url: getImage('bus', 0) },
  { id: 'bus-005', provider: 'trans-africa', provider_name: 'Trans Africa Express', origin: 'Kigali', destination: 'Goma', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 240), duration_minutes: 240, price: 15000, currency: 'RWF', available_seats: 25, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'USB Charging', 'Border Assistance'], rating: 4.2, image_url: getImage('bus', 1) },
  { id: 'bus-006', provider: 'dar-express', provider_name: 'Dar Express', origin: 'Nairobi', destination: 'Dar es Salaam', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 900), duration_minutes: 900, price: 4500, currency: 'KES', available_seats: 20, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['WiFi', 'AC', 'Meals', 'Border Assistance'], rating: 4.4, image_url: getImage('bus', 2) },

  // ========== FLIGHTS ==========
  { id: 'flight-001', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 55), duration_minutes: 55, price: 8500, currency: 'KES', available_seats: 45, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', 'Baggage'], rating: 4.6, image_url: getImage('flight', 0) },
  { id: 'flight-002', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Kampala', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 75), duration_minutes: 75, price: 15000, currency: 'KES', available_seats: 32, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', 'Baggage'], rating: 4.7, image_url: getImage('flight', 1) },
  { id: 'flight-003', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Kigali', departure_time: getDynamicDate(1, 10), arrival_time: getArrivalDate(getDynamicDate(1, 10), 90), duration_minutes: 90, price: 18000, currency: 'KES', available_seats: 28, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', 'Baggage'], rating: 4.8, image_url: getImage('flight', 2) },
  { id: 'flight-004', provider: 'rwandair', provider_name: 'RwandAir', origin: 'Kigali', destination: 'Nairobi', departure_time: getDynamicDate(1, 14), arrival_time: getArrivalDate(getDynamicDate(1, 14), 85), duration_minutes: 85, price: 45000, currency: 'RWF', available_seats: 40, total_seats: 120, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', 'Baggage'], rating: 4.5, image_url: getImage('flight', 0) },
  { id: 'flight-005', provider: 'uganda-airlines', provider_name: 'Uganda Airlines', origin: 'Kampala', destination: 'Nairobi', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 70), duration_minutes: 70, price: 180000, currency: 'UGX', available_seats: 35, total_seats: 130, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', 'Baggage'], rating: 4.4, image_url: getImage('flight', 1) },
  { id: 'flight-006', provider: 'precision-air', provider_name: 'Precision Air', origin: 'Dar es Salaam', destination: 'Nairobi', departure_time: getDynamicDate(1, 11), arrival_time: getArrivalDate(getDynamicDate(1, 11), 95), duration_minutes: 95, price: 12000, currency: 'KES', available_seats: 25, total_seats: 100, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Baggage'], rating: 4.3, image_url: getImage('flight', 2) },
  { id: 'flight-007', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Dar es Salaam', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 90), duration_minutes: 90, price: 14500, currency: 'KES', available_seats: 50, total_seats: 150, travel_mode: 'flight', bus_type: 'Business', amenities: ['Premium Meal', 'Lounge Access', 'Priority Boarding', 'Extra Baggage'], rating: 4.9, image_url: getImage('flight', 0) },

  // ========== TRAINS ==========
  { id: 'train-001', provider: 'sgr-kenya', provider_name: 'Madaraka Express (SGR)', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 300), duration_minutes: 300, price: 3000, currency: 'KES', available_seats: 100, total_seats: 500, travel_mode: 'train', bus_type: 'First Class', amenities: ['AC', 'Dining Car', 'WiFi', 'Scenic Views'], rating: 4.7, image_url: getImage('train', 0) },
  { id: 'train-002', provider: 'sgr-kenya', provider_name: 'Madaraka Express (SGR)', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 14), arrival_time: getArrivalDate(getDynamicDate(1, 14), 300), duration_minutes: 300, price: 1500, currency: 'KES', available_seats: 200, total_seats: 800, travel_mode: 'train', bus_type: 'Economy', amenities: ['AC', 'Dining Car', 'Scenic Views'], rating: 4.5, image_url: getImage('train', 1) },
  { id: 'train-003', provider: 'sgr-kenya', provider_name: 'Madaraka Express (SGR)', origin: 'Mombasa', destination: 'Nairobi', departure_time: getDynamicDate(2, 8), arrival_time: getArrivalDate(getDynamicDate(2, 8), 300), duration_minutes: 300, price: 3000, currency: 'KES', available_seats: 80, total_seats: 500, travel_mode: 'train', bus_type: 'First Class', amenities: ['AC', 'Dining Car', 'WiFi', 'Scenic Views'], rating: 4.7, image_url: getImage('train', 0) },
  { id: 'train-004', provider: 'trc-tanzania', provider_name: 'TAZARA Railway', origin: 'Dar es Salaam', destination: 'Mbeya', departure_time: getDynamicDate(1, 16), arrival_time: getArrivalDate(getDynamicDate(1, 16), 1080), duration_minutes: 1080, price: 85000, currency: 'TZS', available_seats: 50, total_seats: 300, travel_mode: 'train', bus_type: 'Sleeper', amenities: ['Sleeping Berth', 'Dining Car', 'Scenic Views'], rating: 4.2, image_url: getImage('train', 1) },

  // ========== FERRIES ==========
  { id: 'ferry-001', provider: 'likoni-ferry', provider_name: 'Likoni Ferry', origin: 'Mombasa (South)', destination: 'Likoni', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 15), duration_minutes: 15, price: 0, currency: 'KES', available_seats: 500, total_seats: 1000, travel_mode: 'ferry', bus_type: 'Standard', amenities: ['Vehicle Transport', 'Pedestrian Access'], rating: 4.0, image_url: getImage('ferry', 0) },
  { id: 'ferry-002', provider: 'lake-victoria', provider_name: 'MV Uhuru', origin: 'Kisumu', destination: 'Mwanza', departure_time: getDynamicDate(1, 20), arrival_time: getArrivalDate(getDynamicDate(1, 20), 720), duration_minutes: 720, price: 5000, currency: 'KES', available_seats: 80, total_seats: 200, travel_mode: 'ferry', bus_type: 'Cabin', amenities: ['Cabin', 'Restaurant', 'Lake Views'], rating: 4.1, image_url: getImage('ferry', 1) },
  { id: 'ferry-003', provider: 'lake-kivu', provider_name: 'Lake Kivu Ferry', origin: 'Gisenyi', destination: 'Goma', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 45), duration_minutes: 45, price: 3000, currency: 'RWF', available_seats: 40, total_seats: 100, travel_mode: 'ferry', bus_type: 'Standard', amenities: ['Lake Views', 'Border Crossing'], rating: 4.0, image_url: getImage('ferry', 0) },

  // ========== SHUTTLES ==========
  { id: 'shuttle-001', provider: 'riverside', provider_name: 'Riverside Shuttle', origin: 'Nairobi', destination: 'Arusha', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 360), duration_minutes: 360, price: 2500, currency: 'KES', available_seats: 8, total_seats: 14, travel_mode: 'shuttle', bus_type: 'Minivan', amenities: ['AC', 'WiFi', 'Border Assistance'], rating: 4.4, image_url: getImage('shuttle', 0) },
  { id: 'shuttle-002', provider: 'impala', provider_name: 'Impala Shuttle', origin: 'Nairobi', destination: 'Arusha', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 330), duration_minutes: 330, price: 3000, currency: 'KES', available_seats: 6, total_seats: 12, travel_mode: 'shuttle', bus_type: 'Premium Minivan', amenities: ['AC', 'WiFi', 'Snacks', 'Border Assistance'], rating: 4.6, image_url: getImage('shuttle', 1) },
  { id: 'shuttle-003', provider: 'jinja-express', provider_name: 'Jinja Express Shuttle', origin: 'Kampala', destination: 'Jinja', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 90), duration_minutes: 90, price: 25000, currency: 'UGX', available_seats: 10, total_seats: 14, travel_mode: 'shuttle', bus_type: 'Minivan', amenities: ['AC'], rating: 4.2, image_url: getImage('shuttle', 0) },
  { id: 'shuttle-004', provider: 'kigali-shuttle', provider_name: 'Kigali City Shuttle', origin: 'Kigali', destination: 'Butare', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 120), duration_minutes: 120, price: 4000, currency: 'RWF', available_seats: 12, total_seats: 18, travel_mode: 'shuttle', bus_type: 'Coaster', amenities: ['AC', 'WiFi'], rating: 4.3, image_url: getImage('shuttle', 1) },
];

class SafirioService {
  private apiKey: string;
  private baseUrl: string;
  private mockTrips: Trip[];

  constructor() {
    this.apiKey = process.env.SAFIRIO_API_KEY || '';
    this.baseUrl = process.env.SAFIRIO_API_URL || 'https://api.safirio.africa/v1';
    this.mockTrips = createMockTrips();
  }

  async searchTrips(params: SearchParams): Promise<SearchResponse> {
    let filteredTrips = [...this.mockTrips];
    
    // Filter by travel mode (bus, flight, train, ferry, shuttle)
    if (params.travel_mode) {
      const mode = params.travel_mode.toLowerCase();
      filteredTrips = filteredTrips.filter(trip => trip.travel_mode === mode);
    }
    
    if (params.origin) {
      const origin = params.origin.toLowerCase();
      filteredTrips = filteredTrips.filter(trip => trip.origin.toLowerCase().includes(origin));
    }
    if (params.destination) {
      const destination = params.destination.toLowerCase();
      filteredTrips = filteredTrips.filter(trip => trip.destination.toLowerCase().includes(destination));
    }
    if (params.min_price !== undefined) {
      filteredTrips = filteredTrips.filter(trip => trip.price >= params.min_price!);
    }
    if (params.max_price !== undefined) {
      filteredTrips = filteredTrips.filter(trip => trip.price <= params.max_price!);
    }
    if (params.sort_by) {
      filteredTrips.sort((a, b) => {
        let aVal: number, bVal: number;
        switch (params.sort_by) {
          case 'price': aVal = a.price; bVal = b.price; break;
          case 'departure_time': aVal = new Date(a.departure_time).getTime(); bVal = new Date(b.departure_time).getTime(); break;
          case 'duration': aVal = a.duration_minutes || 0; bVal = b.duration_minutes || 0; break;
          case 'rating': aVal = a.rating || 0; bVal = b.rating || 0; break;
          default: return 0;
        }
        return params.sort_order === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedTrips = filteredTrips.slice(startIndex, startIndex + limit);
    return { trips: paginatedTrips, total: filteredTrips.length, page, limit, has_more: startIndex + limit < filteredTrips.length };
  }

  async getTripById(id: string): Promise<Trip | null> {
    return this.mockTrips.find(t => t.id === id) || null;
  }

  async getPopularDestinations(): Promise<string[]> {
    return ['Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Nairobi', 'Kampala', 'Jinja', 'Mbarara', 'Entebbe', 'Kigali', 'Butare', 'Gisenyi', 'Goma', 'Bukavu', 'Dar es Salaam', 'Arusha', 'Mwanza'];
  }

  async getPopularOrigins(): Promise<string[]> {
    return ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru', 'Kampala', 'Jinja', 'Kigali', 'Goma', 'Dar es Salaam', 'Arusha'];
  }

  async getFeaturedTrips(): Promise<Trip[]> {
    // Return a mix of different travel modes
    const featured = this.mockTrips.filter(t => 
      ['bus-001', 'flight-001', 'train-001', 'ferry-002', 'shuttle-001', 'flight-003', 'bus-003', 'train-002'].includes(t.id)
    );
    return featured;
  }

  async getTravelModes(): Promise<TravelMode[]> {
    return ['bus', 'flight', 'train', 'ferry', 'shuttle'];
  }
}

export const safirioService = new SafirioService();
