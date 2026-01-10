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

// Mock trips with multiple travel modes - Comprehensive East Africa Coverage
const createMockTrips = (): Trip[] => [
  // ================================================================================
  // 🚌 BUSES - KENYA DOMESTIC
  // ================================================================================
  { id: 'bus-001', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 480), duration_minutes: 480, price: 1500, currency: 'KES', available_seats: 24, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'], rating: 4.5, image_url: getImage('bus', 0) },
  { id: 'bus-002', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 450), duration_minutes: 450, price: 1800, currency: 'KES', available_seats: 12, total_seats: 40, travel_mode: 'bus', bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks', 'Entertainment'], rating: 4.8, image_url: getImage('bus', 1) },
  { id: 'bus-007', provider: 'guardian-angel', provider_name: 'Guardian Angel', origin: 'Nairobi', destination: 'Kisumu', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 360), duration_minutes: 360, price: 1200, currency: 'KES', available_seats: 30, total_seats: 50, travel_mode: 'bus', bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging'], rating: 4.3, image_url: getImage('bus', 2) },
  { id: 'bus-008', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Nakuru', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 180), duration_minutes: 180, price: 800, currency: 'KES', available_seats: 20, total_seats: 45, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC', 'USB Charging'], rating: 4.2, image_url: getImage('bus', 0) },
  { id: 'bus-009', provider: 'eldoret-express', provider_name: 'Eldoret Express', origin: 'Nairobi', destination: 'Eldoret', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 300), duration_minutes: 300, price: 1100, currency: 'KES', available_seats: 25, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging'], rating: 4.4, image_url: getImage('bus', 1) },
  { id: 'bus-010', provider: 'mombasa-raha', provider_name: 'Mombasa Raha', origin: 'Mombasa', destination: 'Malindi', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 120), duration_minutes: 120, price: 600, currency: 'KES', available_seats: 35, total_seats: 45, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC'], rating: 4.0, image_url: getImage('bus', 2) },
  { id: 'bus-011', provider: 'tahmeed', provider_name: 'Tahmeed Coach', origin: 'Mombasa', destination: 'Lamu', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 420), duration_minutes: 420, price: 1500, currency: 'KES', available_seats: 20, total_seats: 40, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'WiFi'], rating: 4.1, image_url: getImage('bus', 0) },
  
  // 🚌 BUSES - KENYA-UGANDA CROSS-BORDER
  { id: 'bus-003', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Kampala', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 720), duration_minutes: 720, price: 3500, currency: 'KES', available_seats: 15, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks', 'Border Assistance'], rating: 4.6, image_url: getImage('bus', 2) },
  { id: 'bus-012', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Nairobi', destination: 'Kampala', departure_time: getDynamicDate(1, 20), arrival_time: getArrivalDate(getDynamicDate(1, 20), 660), duration_minutes: 660, price: 4000, currency: 'KES', available_seats: 18, total_seats: 40, travel_mode: 'bus', bus_type: 'VIP Night Coach', amenities: ['WiFi', 'AC', 'Sleeper Seats', 'Meals', 'Border Assistance'], rating: 4.7, image_url: getImage('bus', 1) },
  { id: 'bus-013', provider: 'queen-coach', provider_name: 'Queen Coach', origin: 'Kisumu', destination: 'Kampala', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 480), duration_minutes: 480, price: 2500, currency: 'KES', available_seats: 22, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'USB Charging', 'Border Assistance'], rating: 4.3, image_url: getImage('bus', 2) },
  
  // 🚌 BUSES - UGANDA DOMESTIC
  { id: 'bus-004', provider: 'jaguar-executive', provider_name: 'Jaguar Executive', origin: 'Kampala', destination: 'Kigali', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 540), duration_minutes: 540, price: 80000, currency: 'UGX', available_seats: 12, total_seats: 40, travel_mode: 'bus', bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Meals'], rating: 4.7, image_url: getImage('bus', 0) },
  { id: 'bus-014', provider: 'link-bus', provider_name: 'Link Bus', origin: 'Kampala', destination: 'Jinja', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 120), duration_minutes: 120, price: 15000, currency: 'UGX', available_seats: 30, total_seats: 50, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC'], rating: 4.1, image_url: getImage('bus', 1) },
  { id: 'bus-015', provider: 'yy-coaches', provider_name: 'YY Coaches', origin: 'Kampala', destination: 'Mbarara', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 300), duration_minutes: 300, price: 35000, currency: 'UGX', available_seats: 25, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'WiFi'], rating: 4.4, image_url: getImage('bus', 2) },
  { id: 'bus-016', provider: 'swift-safaris', provider_name: 'Swift Safaris', origin: 'Kampala', destination: 'Fort Portal', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 360), duration_minutes: 360, price: 40000, currency: 'UGX', available_seats: 20, total_seats: 40, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'WiFi', 'USB Charging'], rating: 4.5, image_url: getImage('bus', 0) },
  { id: 'bus-017', provider: 'gateway-bus', provider_name: 'Gateway Bus', origin: 'Kampala', destination: 'Gulu', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 420), duration_minutes: 420, price: 45000, currency: 'UGX', available_seats: 28, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'USB Charging'], rating: 4.2, image_url: getImage('bus', 1) },
  
  // 🚌 BUSES - RWANDA DOMESTIC & CROSS-BORDER
  { id: 'bus-005', provider: 'trans-africa', provider_name: 'Trans Africa Express', origin: 'Kigali', destination: 'Goma', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 240), duration_minutes: 240, price: 15000, currency: 'RWF', available_seats: 25, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'USB Charging', 'Border Assistance'], rating: 4.2, image_url: getImage('bus', 1) },
  { id: 'bus-018', provider: 'volcano-express', provider_name: 'Volcano Express', origin: 'Kigali', destination: 'Butare (Huye)', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 150), duration_minutes: 150, price: 3500, currency: 'RWF', available_seats: 30, total_seats: 45, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC'], rating: 4.0, image_url: getImage('bus', 2) },
  { id: 'bus-019', provider: 'virunga-express', provider_name: 'Virunga Express', origin: 'Kigali', destination: 'Gisenyi (Rubavu)', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 180), duration_minutes: 180, price: 4000, currency: 'RWF', available_seats: 25, total_seats: 40, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'WiFi'], rating: 4.3, image_url: getImage('bus', 0) },
  { id: 'bus-020', provider: 'horizon-express', provider_name: 'Horizon Express', origin: 'Kigali', destination: 'Musanze', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 120), duration_minutes: 120, price: 3000, currency: 'RWF', available_seats: 35, total_seats: 50, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC'], rating: 4.1, image_url: getImage('bus', 1) },
  { id: 'bus-021', provider: 'trinity-express', provider_name: 'Trinity Express', origin: 'Kigali', destination: 'Bujumbura', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 360), duration_minutes: 360, price: 20000, currency: 'RWF', available_seats: 20, total_seats: 40, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'WiFi', 'Border Assistance'], rating: 4.4, image_url: getImage('bus', 2) },
  
  // 🚌 BUSES - TANZANIA DOMESTIC & CROSS-BORDER
  { id: 'bus-006', provider: 'dar-express', provider_name: 'Dar Express', origin: 'Nairobi', destination: 'Dar es Salaam', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 900), duration_minutes: 900, price: 4500, currency: 'KES', available_seats: 20, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['WiFi', 'AC', 'Meals', 'Border Assistance'], rating: 4.4, image_url: getImage('bus', 2) },
  { id: 'bus-022', provider: 'kilimanjaro-express', provider_name: 'Kilimanjaro Express', origin: 'Dar es Salaam', destination: 'Arusha', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 540), duration_minutes: 540, price: 35000, currency: 'TZS', available_seats: 28, total_seats: 45, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'WiFi', 'USB Charging'], rating: 4.5, image_url: getImage('bus', 0) },
  { id: 'bus-023', provider: 'scandinavia', provider_name: 'Scandinavia Express', origin: 'Dar es Salaam', destination: 'Mwanza', departure_time: getDynamicDate(1, 18), arrival_time: getArrivalDate(getDynamicDate(1, 18), 720), duration_minutes: 720, price: 50000, currency: 'TZS', available_seats: 22, total_seats: 40, travel_mode: 'bus', bus_type: 'VIP Night', amenities: ['AC', 'Sleeper Seats', 'Meals'], rating: 4.6, image_url: getImage('bus', 1) },
  { id: 'bus-024', provider: 'simba-coach', provider_name: 'Simba Coach', origin: 'Dar es Salaam', destination: 'Dodoma', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 360), duration_minutes: 360, price: 25000, currency: 'TZS', available_seats: 30, total_seats: 50, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC'], rating: 4.0, image_url: getImage('bus', 2) },
  { id: 'bus-025', provider: 'arusha-express', provider_name: 'Arusha Express', origin: 'Arusha', destination: 'Moshi', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 90), duration_minutes: 90, price: 8000, currency: 'TZS', available_seats: 35, total_seats: 45, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC'], rating: 4.1, image_url: getImage('bus', 0) },
  
  // 🚌 BUSES - DRC CONGO
  { id: 'bus-026', provider: 'congo-star', provider_name: 'Congo Star', origin: 'Goma', destination: 'Bukavu', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 240), duration_minutes: 240, price: 25, currency: 'USD', available_seats: 25, total_seats: 45, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC'], rating: 3.8, image_url: getImage('bus', 1) },
  { id: 'bus-027', provider: 'kivu-express', provider_name: 'Kivu Express', origin: 'Bukavu', destination: 'Uvira', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 180), duration_minutes: 180, price: 20, currency: 'USD', available_seats: 30, total_seats: 50, travel_mode: 'bus', bus_type: 'Standard', amenities: [], rating: 3.5, image_url: getImage('bus', 2) },
  { id: 'bus-028', provider: 'victoria-coaches', provider_name: 'Victoria Coaches', origin: 'Goma', destination: 'Butembo', departure_time: getDynamicDate(1, 5), arrival_time: getArrivalDate(getDynamicDate(1, 5), 420), duration_minutes: 420, price: 35, currency: 'USD', available_seats: 20, total_seats: 40, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC'], rating: 3.9, image_url: getImage('bus', 0) },
  
  // 🚌 BUSES - BURUNDI
  { id: 'bus-029', provider: 'otraco', provider_name: 'OTRACO', origin: 'Bujumbura', destination: 'Gitega', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 120), duration_minutes: 120, price: 5000, currency: 'BIF', available_seats: 35, total_seats: 50, travel_mode: 'bus', bus_type: 'Standard', amenities: ['AC'], rating: 3.8, image_url: getImage('bus', 1) },
  { id: 'bus-030', provider: 'belvedere', provider_name: 'Belvedere Express', origin: 'Bujumbura', destination: 'Kigali', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 300), duration_minutes: 300, price: 15000, currency: 'BIF', available_seats: 25, total_seats: 40, travel_mode: 'bus', bus_type: 'Executive', amenities: ['AC', 'Border Assistance'], rating: 4.0, image_url: getImage('bus', 2) },

  // ================================================================================
  // ✈️ FLIGHTS - KENYA DOMESTIC (Realistic 2024-2026 Prices)
  // ================================================================================
  // Kenya Airways - Premium carrier, higher prices
  { id: 'flight-001', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 55), duration_minutes: 55, price: 12500, currency: 'KES', available_seats: 45, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage', 'Seat Selection'], rating: 4.6, image_url: getImage('flight', 0) },
  // Jambojet - Budget carrier, lower prices
  { id: 'flight-008', provider: 'jambojet', provider_name: 'Jambojet', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 10), arrival_time: getArrivalDate(getDynamicDate(1, 10), 55), duration_minutes: 55, price: 4999, currency: 'KES', available_seats: 60, total_seats: 180, travel_mode: 'flight', bus_type: 'Economy', amenities: ['15kg Baggage'], rating: 4.2, image_url: getImage('flight', 1) },
  { id: 'flight-024', provider: 'jambojet', provider_name: 'Jambojet', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 14), arrival_time: getArrivalDate(getDynamicDate(1, 14), 55), duration_minutes: 55, price: 6500, currency: 'KES', available_seats: 45, total_seats: 180, travel_mode: 'flight', bus_type: 'Economy', amenities: ['15kg Baggage'], rating: 4.2, image_url: getImage('flight', 2) },
  // Fly540 - Budget regional
  { id: 'flight-009', provider: 'fly540', provider_name: 'Fly540', origin: 'Nairobi', destination: 'Kisumu', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 50), duration_minutes: 50, price: 5500, currency: 'KES', available_seats: 40, total_seats: 70, travel_mode: 'flight', bus_type: 'Economy', amenities: ['15kg Baggage'], rating: 4.0, image_url: getImage('flight', 2) },
  { id: 'flight-025', provider: 'fly540', provider_name: 'Fly540', origin: 'Nairobi', destination: 'Eldoret', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 45), duration_minutes: 45, price: 6200, currency: 'KES', available_seats: 35, total_seats: 70, travel_mode: 'flight', bus_type: 'Economy', amenities: ['15kg Baggage'], rating: 4.1, image_url: getImage('flight', 0) },
  // SafariLink - Premium bush/coastal flights
  { id: 'flight-010', provider: 'safarilink', provider_name: 'SafariLink', origin: 'Nairobi', destination: 'Malindi', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 75), duration_minutes: 75, price: 18500, currency: 'KES', available_seats: 12, total_seats: 14, travel_mode: 'flight', bus_type: 'Economy', amenities: ['Scenic Views', '15kg Baggage', 'Bush Landing'], rating: 4.5, image_url: getImage('flight', 0) },
  { id: 'flight-011', provider: 'safarilink', provider_name: 'SafariLink', origin: 'Nairobi', destination: 'Lamu', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 90), duration_minutes: 90, price: 22000, currency: 'KES', available_seats: 10, total_seats: 14, travel_mode: 'flight', bus_type: 'Economy', amenities: ['Scenic Views', '15kg Baggage', 'Bush Landing'], rating: 4.6, image_url: getImage('flight', 1) },
  { id: 'flight-012', provider: 'safarilink', provider_name: 'SafariLink', origin: 'Nairobi', destination: 'Masai Mara', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 45), duration_minutes: 45, price: 24500, currency: 'KES', available_seats: 8, total_seats: 12, travel_mode: 'flight', bus_type: 'Safari Charter', amenities: ['Scenic Views', '15kg Baggage', 'Bush Landing', 'Game Viewing'], rating: 4.8, image_url: getImage('flight', 2) },
  { id: 'flight-026', provider: 'safarilink', provider_name: 'SafariLink', origin: 'Nairobi', destination: 'Diani Beach', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 60), duration_minutes: 60, price: 19500, currency: 'KES', available_seats: 10, total_seats: 14, travel_mode: 'flight', bus_type: 'Economy', amenities: ['Scenic Views', '15kg Baggage'], rating: 4.5, image_url: getImage('flight', 0) },

  // ✈️ FLIGHTS - KENYA AIRWAYS REGIONAL (Cross-Border)
  { id: 'flight-002', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Kampala', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 75), duration_minutes: 75, price: 28500, currency: 'KES', available_seats: 32, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.7, image_url: getImage('flight', 1) },
  { id: 'flight-003', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Kigali', departure_time: getDynamicDate(1, 10), arrival_time: getArrivalDate(getDynamicDate(1, 10), 90), duration_minutes: 90, price: 32000, currency: 'KES', available_seats: 28, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.8, image_url: getImage('flight', 2) },
  { id: 'flight-007', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Dar es Salaam', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 90), duration_minutes: 90, price: 48000, currency: 'KES', available_seats: 20, total_seats: 36, travel_mode: 'flight', bus_type: 'Business', amenities: ['Premium Meal', 'Lounge Access', 'Priority Boarding', '46kg Baggage', 'Lie-flat Seat'], rating: 4.9, image_url: getImage('flight', 0) },
  { id: 'flight-027', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Dar es Salaam', departure_time: getDynamicDate(1, 14), arrival_time: getArrivalDate(getDynamicDate(1, 14), 90), duration_minutes: 90, price: 24500, currency: 'KES', available_seats: 45, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.6, image_url: getImage('flight', 1) },
  { id: 'flight-013', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Bujumbura', departure_time: getDynamicDate(1, 11), arrival_time: getArrivalDate(getDynamicDate(1, 11), 105), duration_minutes: 105, price: 35000, currency: 'KES', available_seats: 25, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.5, image_url: getImage('flight', 1) },
  { id: 'flight-014', provider: 'kenya-airways', provider_name: 'Kenya Airways', origin: 'Nairobi', destination: 'Zanzibar', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 80), duration_minutes: 80, price: 26500, currency: 'KES', available_seats: 40, total_seats: 150, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.7, image_url: getImage('flight', 2) },

  // ✈️ FLIGHTS - UGANDA AIRLINES (Prices in UGX - realistic 2024-2026)
  { id: 'flight-005', provider: 'uganda-airlines', provider_name: 'Uganda Airlines', origin: 'Kampala', destination: 'Nairobi', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 70), duration_minutes: 70, price: 485000, currency: 'UGX', available_seats: 35, total_seats: 130, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.4, image_url: getImage('flight', 1) },
  { id: 'flight-015', provider: 'uganda-airlines', provider_name: 'Uganda Airlines', origin: 'Kampala', destination: 'Dar es Salaam', departure_time: getDynamicDate(1, 10), arrival_time: getArrivalDate(getDynamicDate(1, 10), 110), duration_minutes: 110, price: 620000, currency: 'UGX', available_seats: 30, total_seats: 130, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.3, image_url: getImage('flight', 2) },
  { id: 'flight-016', provider: 'uganda-airlines', provider_name: 'Uganda Airlines', origin: 'Kampala', destination: 'Kigali', departure_time: getDynamicDate(1, 14), arrival_time: getArrivalDate(getDynamicDate(1, 14), 55), duration_minutes: 55, price: 385000, currency: 'UGX', available_seats: 40, total_seats: 130, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', '23kg Baggage'], rating: 4.4, image_url: getImage('flight', 0) },
  { id: 'flight-028', provider: 'uganda-airlines', provider_name: 'Uganda Airlines', origin: 'Kampala', destination: 'Zanzibar', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 120), duration_minutes: 120, price: 725000, currency: 'UGX', available_seats: 28, total_seats: 130, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.5, image_url: getImage('flight', 1) },

  // ✈️ FLIGHTS - RWANDAIR (Prices in RWF - realistic 2024-2026)
  { id: 'flight-004', provider: 'rwandair', provider_name: 'RwandAir', origin: 'Kigali', destination: 'Nairobi', departure_time: getDynamicDate(1, 14), arrival_time: getArrivalDate(getDynamicDate(1, 14), 85), duration_minutes: 85, price: 185000, currency: 'RWF', available_seats: 40, total_seats: 120, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.5, image_url: getImage('flight', 0) },
  { id: 'flight-017', provider: 'rwandair', provider_name: 'RwandAir', origin: 'Kigali', destination: 'Kampala', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 50), duration_minutes: 50, price: 125000, currency: 'RWF', available_seats: 45, total_seats: 120, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', '23kg Baggage'], rating: 4.4, image_url: getImage('flight', 1) },
  { id: 'flight-018', provider: 'rwandair', provider_name: 'RwandAir', origin: 'Kigali', destination: 'Dar es Salaam', departure_time: getDynamicDate(1, 11), arrival_time: getArrivalDate(getDynamicDate(1, 11), 120), duration_minutes: 120, price: 245000, currency: 'RWF', available_seats: 35, total_seats: 120, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.6, image_url: getImage('flight', 2) },
  { id: 'flight-019', provider: 'rwandair', provider_name: 'RwandAir', origin: 'Kigali', destination: 'Bujumbura', departure_time: getDynamicDate(1, 15), arrival_time: getArrivalDate(getDynamicDate(1, 15), 35), duration_minutes: 35, price: 85000, currency: 'RWF', available_seats: 50, total_seats: 120, travel_mode: 'flight', bus_type: 'Economy', amenities: ['15kg Baggage'], rating: 4.3, image_url: getImage('flight', 0) },
  { id: 'flight-029', provider: 'rwandair', provider_name: 'RwandAir', origin: 'Kigali', destination: 'Zanzibar', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 130), duration_minutes: 130, price: 285000, currency: 'RWF', available_seats: 30, total_seats: 120, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.6, image_url: getImage('flight', 1) },
  { id: 'flight-030', provider: 'rwandair', provider_name: 'RwandAir', origin: 'Kigali', destination: 'Mombasa', departure_time: getDynamicDate(2, 9), arrival_time: getArrivalDate(getDynamicDate(2, 9), 150), duration_minutes: 150, price: 265000, currency: 'RWF', available_seats: 25, total_seats: 120, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', 'Entertainment', '23kg Baggage'], rating: 4.5, image_url: getImage('flight', 2) },

  // ✈️ FLIGHTS - TANZANIA (Precision Air, Coastal Aviation, Auric Air)
  { id: 'flight-006', provider: 'precision-air', provider_name: 'Precision Air', origin: 'Dar es Salaam', destination: 'Nairobi', departure_time: getDynamicDate(1, 11), arrival_time: getArrivalDate(getDynamicDate(1, 11), 95), duration_minutes: 95, price: 18500, currency: 'KES', available_seats: 25, total_seats: 100, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', '23kg Baggage'], rating: 4.3, image_url: getImage('flight', 2) },
  { id: 'flight-020', provider: 'precision-air', provider_name: 'Precision Air', origin: 'Dar es Salaam', destination: 'Zanzibar', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 25), duration_minutes: 25, price: 125000, currency: 'TZS', available_seats: 40, total_seats: 70, travel_mode: 'flight', bus_type: 'Economy', amenities: ['15kg Baggage'], rating: 4.2, image_url: getImage('flight', 0) },
  { id: 'flight-021', provider: 'precision-air', provider_name: 'Precision Air', origin: 'Dar es Salaam', destination: 'Kilimanjaro', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 70), duration_minutes: 70, price: 285000, currency: 'TZS', available_seats: 35, total_seats: 100, travel_mode: 'flight', bus_type: 'Economy', amenities: ['In-flight Meal', '23kg Baggage'], rating: 4.4, image_url: getImage('flight', 1) },
  // Coastal Aviation - Premium safari flights (USD prices)
  { id: 'flight-022', provider: 'coastal-aviation', provider_name: 'Coastal Aviation', origin: 'Arusha', destination: 'Serengeti', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 60), duration_minutes: 60, price: 385, currency: 'USD', available_seats: 10, total_seats: 12, travel_mode: 'flight', bus_type: 'Safari Charter', amenities: ['Scenic Views', '15kg Baggage', 'Bush Landing', 'Game Spotting'], rating: 4.9, image_url: getImage('flight', 2) },
  { id: 'flight-031', provider: 'coastal-aviation', provider_name: 'Coastal Aviation', origin: 'Arusha', destination: 'Zanzibar', departure_time: getDynamicDate(1, 11), arrival_time: getArrivalDate(getDynamicDate(1, 11), 90), duration_minutes: 90, price: 425, currency: 'USD', available_seats: 8, total_seats: 12, travel_mode: 'flight', bus_type: 'Economy', amenities: ['Scenic Views', '15kg Baggage'], rating: 4.7, image_url: getImage('flight', 0) },
  { id: 'flight-032', provider: 'coastal-aviation', provider_name: 'Coastal Aviation', origin: 'Zanzibar', destination: 'Serengeti', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 150), duration_minutes: 150, price: 550, currency: 'USD', available_seats: 6, total_seats: 12, travel_mode: 'flight', bus_type: 'Safari Charter', amenities: ['Scenic Views', '15kg Baggage', 'Bush Landing'], rating: 4.8, image_url: getImage('flight', 1) },
  // Auric Air - Regional Tanzania
  { id: 'flight-023', provider: 'auric-air', provider_name: 'Auric Air', origin: 'Dar es Salaam', destination: 'Mwanza', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 90), duration_minutes: 90, price: 385000, currency: 'TZS', available_seats: 15, total_seats: 19, travel_mode: 'flight', bus_type: 'Economy', amenities: ['15kg Baggage'], rating: 4.1, image_url: getImage('flight', 0) },
  { id: 'flight-033', provider: 'auric-air', provider_name: 'Auric Air', origin: 'Dar es Salaam', destination: 'Kigoma', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 120), duration_minutes: 120, price: 425000, currency: 'TZS', available_seats: 12, total_seats: 19, travel_mode: 'flight', bus_type: 'Economy', amenities: ['15kg Baggage'], rating: 4.0, image_url: getImage('flight', 1) },

  // ================================================================================
  // 🚂 TRAINS
  // ================================================================================
  { id: 'train-001', provider: 'sgr-kenya', provider_name: 'Madaraka Express (SGR)', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 300), duration_minutes: 300, price: 3000, currency: 'KES', available_seats: 100, total_seats: 500, travel_mode: 'train', bus_type: 'First Class', amenities: ['AC', 'Dining Car', 'WiFi', 'Scenic Views'], rating: 4.7, image_url: getImage('train', 0) },
  { id: 'train-002', provider: 'sgr-kenya', provider_name: 'Madaraka Express (SGR)', origin: 'Nairobi', destination: 'Mombasa', departure_time: getDynamicDate(1, 14), arrival_time: getArrivalDate(getDynamicDate(1, 14), 300), duration_minutes: 300, price: 1500, currency: 'KES', available_seats: 200, total_seats: 800, travel_mode: 'train', bus_type: 'Economy', amenities: ['AC', 'Dining Car', 'Scenic Views'], rating: 4.5, image_url: getImage('train', 1) },
  { id: 'train-003', provider: 'sgr-kenya', provider_name: 'Madaraka Express (SGR)', origin: 'Mombasa', destination: 'Nairobi', departure_time: getDynamicDate(2, 8), arrival_time: getArrivalDate(getDynamicDate(2, 8), 300), duration_minutes: 300, price: 3000, currency: 'KES', available_seats: 80, total_seats: 500, travel_mode: 'train', bus_type: 'First Class', amenities: ['AC', 'Dining Car', 'WiFi', 'Scenic Views'], rating: 4.7, image_url: getImage('train', 0) },
  { id: 'train-005', provider: 'sgr-kenya', provider_name: 'SGR Naivasha Express', origin: 'Nairobi', destination: 'Naivasha', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 90), duration_minutes: 90, price: 1000, currency: 'KES', available_seats: 150, total_seats: 500, travel_mode: 'train', bus_type: 'Economy', amenities: ['AC', 'Scenic Views'], rating: 4.4, image_url: getImage('train', 1) },
  { id: 'train-004', provider: 'trc-tanzania', provider_name: 'TAZARA Railway', origin: 'Dar es Salaam', destination: 'Mbeya', departure_time: getDynamicDate(1, 16), arrival_time: getArrivalDate(getDynamicDate(1, 16), 1080), duration_minutes: 1080, price: 85000, currency: 'TZS', available_seats: 50, total_seats: 300, travel_mode: 'train', bus_type: 'Sleeper', amenities: ['Sleeping Berth', 'Dining Car', 'Scenic Views'], rating: 4.2, image_url: getImage('train', 1) },
  { id: 'train-006', provider: 'trc-tanzania', provider_name: 'Central Line Railway', origin: 'Dar es Salaam', destination: 'Dodoma', departure_time: getDynamicDate(1, 20), arrival_time: getArrivalDate(getDynamicDate(1, 20), 480), duration_minutes: 480, price: 15000, currency: 'TZS', available_seats: 100, total_seats: 400, travel_mode: 'train', bus_type: 'Economy', amenities: ['Dining Car', 'Scenic Views'], rating: 3.8, image_url: getImage('train', 0) },
  { id: 'train-007', provider: 'trc-tanzania', provider_name: 'Central Line Railway', origin: 'Dar es Salaam', destination: 'Tabora', departure_time: getDynamicDate(2, 17), arrival_time: getArrivalDate(getDynamicDate(2, 17), 900), duration_minutes: 900, price: 35000, currency: 'TZS', available_seats: 80, total_seats: 300, travel_mode: 'train', bus_type: 'Sleeper', amenities: ['Sleeping Berth', 'Dining Car'], rating: 3.9, image_url: getImage('train', 1) },

  // ================================================================================
  // ⛴️ FERRIES
  // ================================================================================
  { id: 'ferry-001', provider: 'likoni-ferry', provider_name: 'Likoni Ferry', origin: 'Mombasa Island', destination: 'Likoni', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 15), duration_minutes: 15, price: 0, currency: 'KES', available_seats: 500, total_seats: 1000, travel_mode: 'ferry', bus_type: 'Standard', amenities: ['Vehicle Transport', 'Pedestrian Access'], rating: 4.0, image_url: getImage('ferry', 0) },
  { id: 'ferry-002', provider: 'lake-victoria', provider_name: 'MV Uhuru', origin: 'Kisumu', destination: 'Mwanza', departure_time: getDynamicDate(1, 20), arrival_time: getArrivalDate(getDynamicDate(1, 20), 720), duration_minutes: 720, price: 5000, currency: 'KES', available_seats: 80, total_seats: 200, travel_mode: 'ferry', bus_type: 'Cabin', amenities: ['Cabin', 'Restaurant', 'Lake Views'], rating: 4.1, image_url: getImage('ferry', 1) },
  { id: 'ferry-003', provider: 'lake-kivu', provider_name: 'Lake Kivu Ferry', origin: 'Gisenyi', destination: 'Goma', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 45), duration_minutes: 45, price: 3000, currency: 'RWF', available_seats: 40, total_seats: 100, travel_mode: 'ferry', bus_type: 'Standard', amenities: ['Lake Views', 'Border Crossing'], rating: 4.0, image_url: getImage('ferry', 0) },
  { id: 'ferry-004', provider: 'zanzibar-ferry', provider_name: 'Azam Marine', origin: 'Dar es Salaam', destination: 'Zanzibar', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 120), duration_minutes: 120, price: 35, currency: 'USD', available_seats: 200, total_seats: 500, travel_mode: 'ferry', bus_type: 'Business', amenities: ['AC', 'Lounge', 'Restaurant', 'Sea Views'], rating: 4.5, image_url: getImage('ferry', 1) },
  { id: 'ferry-005', provider: 'zanzibar-ferry', provider_name: 'Azam Marine', origin: 'Dar es Salaam', destination: 'Zanzibar', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 120), duration_minutes: 120, price: 25, currency: 'USD', available_seats: 350, total_seats: 800, travel_mode: 'ferry', bus_type: 'Economy', amenities: ['AC', 'Sea Views'], rating: 4.3, image_url: getImage('ferry', 0) },
  { id: 'ferry-006', provider: 'zanzibar-ferry', provider_name: 'Kilimanjaro Fast Ferry', origin: 'Dar es Salaam', destination: 'Zanzibar', departure_time: getDynamicDate(1, 12), arrival_time: getArrivalDate(getDynamicDate(1, 12), 90), duration_minutes: 90, price: 40, currency: 'USD', available_seats: 150, total_seats: 400, travel_mode: 'ferry', bus_type: 'VIP', amenities: ['AC', 'Lounge', 'Snacks', 'Fast Speed'], rating: 4.6, image_url: getImage('ferry', 1) },
  { id: 'ferry-007', provider: 'lake-victoria', provider_name: 'MV Victoria', origin: 'Mwanza', destination: 'Bukoba', departure_time: getDynamicDate(1, 21), arrival_time: getArrivalDate(getDynamicDate(1, 21), 600), duration_minutes: 600, price: 20000, currency: 'TZS', available_seats: 120, total_seats: 300, travel_mode: 'ferry', bus_type: 'Standard', amenities: ['Cabin', 'Restaurant', 'Lake Views'], rating: 3.9, image_url: getImage('ferry', 0) },
  { id: 'ferry-008', provider: 'lake-kivu', provider_name: 'Kivu Belvedere', origin: 'Cyangugu', destination: 'Bukavu', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 60), duration_minutes: 60, price: 5000, currency: 'RWF', available_seats: 50, total_seats: 120, travel_mode: 'ferry', bus_type: 'Standard', amenities: ['Lake Views', 'Border Crossing'], rating: 3.8, image_url: getImage('ferry', 1) },
  { id: 'ferry-009', provider: 'lake-tanganyika', provider_name: 'MV Liemba', origin: 'Kigoma', destination: 'Mpulungu', departure_time: getDynamicDate(3, 16), arrival_time: getArrivalDate(getDynamicDate(3, 16), 2400), duration_minutes: 2400, price: 100, currency: 'USD', available_seats: 80, total_seats: 200, travel_mode: 'ferry', bus_type: 'Cabin', amenities: ['Sleeping Cabin', 'Restaurant', 'Historic Vessel'], rating: 4.0, image_url: getImage('ferry', 0) },

  // ================================================================================
  // 🚐 SHUTTLES
  // ================================================================================
  { id: 'shuttle-001', provider: 'riverside', provider_name: 'Riverside Shuttle', origin: 'Nairobi', destination: 'Arusha', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 360), duration_minutes: 360, price: 2500, currency: 'KES', available_seats: 8, total_seats: 14, travel_mode: 'shuttle', bus_type: 'Minivan', amenities: ['AC', 'WiFi', 'Border Assistance'], rating: 4.4, image_url: getImage('shuttle', 0) },
  { id: 'shuttle-002', provider: 'impala', provider_name: 'Impala Shuttle', origin: 'Nairobi', destination: 'Arusha', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 330), duration_minutes: 330, price: 3000, currency: 'KES', available_seats: 6, total_seats: 12, travel_mode: 'shuttle', bus_type: 'Premium Minivan', amenities: ['AC', 'WiFi', 'Snacks', 'Border Assistance'], rating: 4.6, image_url: getImage('shuttle', 1) },
  { id: 'shuttle-003', provider: 'jinja-express', provider_name: 'Jinja Express Shuttle', origin: 'Kampala', destination: 'Jinja', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 90), duration_minutes: 90, price: 25000, currency: 'UGX', available_seats: 10, total_seats: 14, travel_mode: 'shuttle', bus_type: 'Minivan', amenities: ['AC'], rating: 4.2, image_url: getImage('shuttle', 0) },
  { id: 'shuttle-004', provider: 'kigali-shuttle', provider_name: 'Kigali City Shuttle', origin: 'Kigali', destination: 'Butare', departure_time: getDynamicDate(1, 9), arrival_time: getArrivalDate(getDynamicDate(1, 9), 120), duration_minutes: 120, price: 4000, currency: 'RWF', available_seats: 12, total_seats: 18, travel_mode: 'shuttle', bus_type: 'Coaster', amenities: ['AC', 'WiFi'], rating: 4.3, image_url: getImage('shuttle', 1) },
  { id: 'shuttle-005', provider: 'namanga-shuttle', provider_name: 'Namanga Border Shuttle', origin: 'Nairobi', destination: 'Namanga Border', departure_time: getDynamicDate(1, 7), arrival_time: getArrivalDate(getDynamicDate(1, 7), 180), duration_minutes: 180, price: 1500, currency: 'KES', available_seats: 10, total_seats: 14, travel_mode: 'shuttle', bus_type: 'Minivan', amenities: ['AC', 'Border Assistance'], rating: 4.1, image_url: getImage('shuttle', 0) },
  { id: 'shuttle-006', provider: 'entebbe-shuttle', provider_name: 'Airport Shuttle Uganda', origin: 'Kampala', destination: 'Entebbe Airport', departure_time: getDynamicDate(1, 5), arrival_time: getArrivalDate(getDynamicDate(1, 5), 60), duration_minutes: 60, price: 35000, currency: 'UGX', available_seats: 8, total_seats: 12, travel_mode: 'shuttle', bus_type: 'Premium', amenities: ['AC', 'WiFi', 'Airport Drop'], rating: 4.5, image_url: getImage('shuttle', 1) },
  { id: 'shuttle-007', provider: 'jkia-shuttle', provider_name: 'JKIA Express Shuttle', origin: 'Nairobi CBD', destination: 'JKIA Airport', departure_time: getDynamicDate(1, 4), arrival_time: getArrivalDate(getDynamicDate(1, 4), 45), duration_minutes: 45, price: 800, currency: 'KES', available_seats: 12, total_seats: 18, travel_mode: 'shuttle', bus_type: 'Coaster', amenities: ['AC', 'Airport Drop'], rating: 4.3, image_url: getImage('shuttle', 0) },
  { id: 'shuttle-008', provider: 'moshi-shuttle', provider_name: 'Kilimanjaro Shuttle', origin: 'Arusha', destination: 'Moshi', departure_time: getDynamicDate(1, 8), arrival_time: getArrivalDate(getDynamicDate(1, 8), 90), duration_minutes: 90, price: 15000, currency: 'TZS', available_seats: 10, total_seats: 14, travel_mode: 'shuttle', bus_type: 'Minivan', amenities: ['AC'], rating: 4.2, image_url: getImage('shuttle', 1) },
  { id: 'shuttle-009', provider: 'gorilla-shuttle', provider_name: 'Gorilla Highlands Shuttle', origin: 'Kigali', destination: 'Musanze', departure_time: getDynamicDate(1, 6), arrival_time: getArrivalDate(getDynamicDate(1, 6), 120), duration_minutes: 120, price: 8000, currency: 'RWF', available_seats: 8, total_seats: 12, travel_mode: 'shuttle', bus_type: 'Premium', amenities: ['AC', 'WiFi', 'Scenic Route'], rating: 4.6, image_url: getImage('shuttle', 0) },
  { id: 'shuttle-010', provider: 'zanzibar-shuttle', provider_name: 'Stone Town Shuttle', origin: 'Zanzibar Airport', destination: 'Stone Town', departure_time: getDynamicDate(1, 10), arrival_time: getArrivalDate(getDynamicDate(1, 10), 30), duration_minutes: 30, price: 10, currency: 'USD', available_seats: 15, total_seats: 20, travel_mode: 'shuttle', bus_type: 'Minivan', amenities: ['AC'], rating: 4.0, image_url: getImage('shuttle', 1) },
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
    // 5 MAIN CAPITAL CITIES ONLY
    return [
      'Nairobi',        // 🇰🇪 Kenya capital
      'Kigali',         // 🇷🇼 Rwanda capital
      'Dar es Salaam',  // 🇹🇿 Tanzania capital
      'Bujumbura',      // 🇧🇮 Burundi capital
      'Kinshasa',       // 🇨🇩 DRC Congo capital
    ];
  }

  async getPopularOrigins(): Promise<string[]> {
    // 5 MAIN CAPITAL CITIES ONLY
    return [
      'Nairobi',        // 🇰🇪 Kenya capital
      'Kigali',         // 🇷🇼 Rwanda capital
      'Dar es Salaam',  // 🇹🇿 Tanzania capital
      'Bujumbura',      // 🇧🇮 Burundi capital
      'Kinshasa',       // 🇨🇩 DRC Congo capital
    ];
  }

  async getFeaturedTrips(): Promise<Trip[]> {
    // Return a diverse mix of different travel modes and regions
    const featuredIds = [
      // Buses
      'bus-001', 'bus-003', 'bus-022', 'bus-004',
      // Flights
      'flight-001', 'flight-003', 'flight-014', 'flight-022',
      // Trains
      'train-001', 'train-004',
      // Ferries
      'ferry-004', 'ferry-002',
      // Shuttles
      'shuttle-001', 'shuttle-009'
    ];
    const featured = this.mockTrips.filter(t => featuredIds.includes(t.id));
    return featured;
  }

  async getTravelModes(): Promise<TravelMode[]> {
    return ['bus', 'flight', 'train', 'ferry', 'shuttle'];
  }
}

export const safirioService = new SafirioService();
