import { Trip, SearchParams, SearchResponse } from '../types/index.js';

// Real bus images from Unsplash
const BUS_IMAGES = [
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=600&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=600&h=400&fit=crop&q=80',
];

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

// Mock trips with dynamic dates
const createMockTrips = (): Trip[] => [
  // Kenya Routes
  { id: 'trip-001', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 480), duration_minutes: 480, price: 1500, currency: 'KES', available_seats: 24, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'], rating: 4.5, image_url: BUS_IMAGES[0] },
  { id: 'trip-002', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 450), duration_minutes: 450, price: 1800, currency: 'KES', available_seats: 12, total_seats: 40, bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Snacks', 'Entertainment'], rating: 4.8, image_url: BUS_IMAGES[1] },
  { id: 'trip-003', provider: 'guardian-angel', provider_name: 'Guardian Angel', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 10), arrival_time: getArrivalDate(getDynamicDate(1, 10), 510), duration_minutes: 510, price: 1200, currency: 'KES', available_seats: 32, total_seats: 52, bus_type: 'Standard', amenities: ['AC', 'Reclining Seats'], rating: 4.0, image_url: BUS_IMAGES[2] },
  { id: 'trip-004', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Kisumu', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 390), duration_minutes: 390, price: 1200, currency: 'KES', available_seats: 18, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging'], rating: 4.3, image_url: BUS_IMAGES[3] },
  { id: 'trip-005', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Mombasa', destination: 'Nairobi', departure_time: getDynamicDate(2, 6), arrival_time: getArrivalDate(getDynamicDate(2, 6), 480), duration_minutes: 480, price: 1600, currency: 'KES', available_seats: 28, total_seats: 40, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks'], rating: 4.6, image_url: BUS_IMAGES[4] },
  { id: 'trip-006', provider: 'climax-coaches', provider_name: 'Climax Coaches', origin: 'Nairobi', destination: 'Nakuru', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 150), duration_minutes: 150, price: 600, currency: 'KES', available_seats: 35, total_seats: 45, bus_type: 'Standard', amenities: ['AC'], rating: 4.1, image_url: BUS_IMAGES[0] },
  { id: 'trip-007', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Eldoret', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 330), duration_minutes: 330, price: 1000, currency: 'KES', available_seats: 22, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging'], rating: 4.4, image_url: BUS_IMAGES[1] },
  // Cross-Border: Kenya - Uganda
  { id: 'trip-009', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Kampala', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 720), duration_minutes: 720, price: 3500, currency: 'KES', available_seats: 15, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks', 'Border Assistance'], rating: 4.6, image_url: BUS_IMAGES[3] },
  { id: 'trip-010', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Nairobi', destination: 'Kampala', departure_time: getDynamicDate(1, 20), arrival_time: getArrivalDate(getDynamicDate(1, 20), 660), duration_minutes: 660, price: 4000, currency: 'KES', available_seats: 10, total_seats: 40, bus_type: 'VIP Night Coach', amenities: ['WiFi', 'AC', 'USB Charging', 'Meals', 'Entertainment', 'Border Assistance'], rating: 4.9, image_url: BUS_IMAGES[4] },
  // Uganda Routes
  { id: 'trip-011', provider: 'link-bus', provider_name: 'Link Bus', origin: 'Kampala', destination: 'Jinja', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 90), duration_minutes: 90, price: 15000, currency: 'UGX', available_seats: 30, total_seats: 45, bus_type: 'Standard', amenities: ['AC'], rating: 4.0, image_url: BUS_IMAGES[0] },
  { id: 'trip-012', provider: 'jaguar-executive', provider_name: 'Jaguar Executive', origin: 'Kampala', destination: 'Mbarara', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 240), duration_minutes: 240, price: 35000, currency: 'UGX', available_seats: 20, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'], rating: 4.5, image_url: BUS_IMAGES[1] },
  // Cross-Border: Uganda - Rwanda
  { id: 'trip-013', provider: 'jaguar-executive', provider_name: 'Jaguar Executive', origin: 'Kampala', destination: 'Kigali', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 540), duration_minutes: 540, price: 80000, currency: 'UGX', available_seats: 12, total_seats: 40, bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Meals', 'Border Assistance'], rating: 4.7, image_url: BUS_IMAGES[2] },
  // Cross-Border: Kenya - Rwanda
  { id: 'trip-014', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Nairobi', destination: 'Kigali', departure_time: getDynamicDate(1, 18), arrival_time: getArrivalDate(getDynamicDate(1, 18), 1440), duration_minutes: 1440, price: 5500, currency: 'KES', available_seats: 18, total_seats: 40, bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Meals', 'Entertainment', 'Border Assistance'], rating: 4.7, image_url: BUS_IMAGES[3] },
  // Rwanda Routes
  { id: 'trip-015', provider: 'volcano-express', provider_name: 'Volcano Express', origin: 'Kigali', destination: 'Butare', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 150), duration_minutes: 150, price: 3500, currency: 'RWF', available_seats: 35, total_seats: 50, bus_type: 'Standard', amenities: ['AC'], rating: 4.0, image_url: BUS_IMAGES[4] },
  { id: 'trip-016', provider: 'virunga-express', provider_name: 'Virunga Express', origin: 'Kigali', destination: 'Gisenyi', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 180), duration_minutes: 180, price: 5000, currency: 'RWF', available_seats: 28, total_seats: 45, bus_type: 'Executive', amenities: ['AC', 'USB Charging'], rating: 4.3, image_url: BUS_IMAGES[0] },
  // Rwanda - Congo
  { id: 'trip-018', provider: 'trans-africa', provider_name: 'Trans Africa Express', origin: 'Kigali', destination: 'Goma', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 240), duration_minutes: 240, price: 15000, currency: 'RWF', available_seats: 25, total_seats: 45, bus_type: 'Executive', amenities: ['AC', 'USB Charging', 'Reclining Seats', 'Border Assistance'], rating: 4.2, image_url: BUS_IMAGES[2] },
  // Congo Routes
  { id: 'trip-019', provider: 'congo-express', provider_name: 'Congo Express', origin: 'Goma', destination: 'Bukavu', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 180), duration_minutes: 180, price: 25, currency: 'USD', available_seats: 30, total_seats: 45, bus_type: 'Standard', amenities: ['AC'], rating: 3.8, image_url: BUS_IMAGES[3] },
  // Tanzania Routes
  { id: 'trip-021', provider: 'dar-express', provider_name: 'Dar Express', origin: 'Nairobi', destination: 'Dar es Salaam', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 900), duration_minutes: 900, price: 4500, currency: 'KES', available_seats: 20, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Meals', 'Border Assistance'], rating: 4.4, image_url: BUS_IMAGES[0] },
  { id: 'trip-022', provider: 'kilimanjaro-express', provider_name: 'Kilimanjaro Express', origin: 'Nairobi', destination: 'Arusha', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 360), duration_minutes: 360, price: 2500, currency: 'KES', available_seats: 25, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Border Assistance'], rating: 4.5, image_url: BUS_IMAGES[1] },
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
}

export const safirioService = new SafirioService();
