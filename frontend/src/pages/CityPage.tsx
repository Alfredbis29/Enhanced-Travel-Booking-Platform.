import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Star, Wifi, Coffee, Car, Utensils, 
  Camera, Mountain, Building, TreePine, Waves,
  ArrowLeft, Bus, Plane, Heart, Share2, Clock,
  Globe, Navigation, Sparkles, Hotel, Landmark
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// City data with hotels and attractions
const cityData: Record<string, {
  name: string
  country: string
  flag: string
  description: string
  image: string
  heroImage: string
  timezone: string
  currency: string
  language: string
  population: string
  hotels: Array<{
    id: string
    name: string
    rating: number
    reviews: number
    price: number
    currency: string
    image: string
    amenities: string[]
    location: string
    description: string
  }>
  attractions: Array<{
    id: string
    name: string
    type: string
    rating: number
    image: string
    description: string
    entryFee?: string
    hours?: string
  }>
}> = {
  'Nairobi': {
    name: 'Nairobi',
    country: 'Kenya',
    flag: '🇰🇪',
    description: 'The vibrant capital of Kenya, known as the "Green City in the Sun". A perfect blend of urban life and wildlife, with the only national park within a city limits.',
    image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1920&h=800&fit=crop&q=80',
    timezone: 'EAT (UTC+3)',
    currency: 'KES',
    language: 'English, Swahili',
    population: '4.4 million',
    hotels: [
      { id: 'h1', name: 'Villa Rosa Kempinski', rating: 4.9, reviews: 1250, price: 25000, currency: 'KES', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'], location: 'Westlands', description: 'Luxury 5-star hotel in the heart of Nairobi' },
      { id: 'h2', name: 'Sarova Stanley', rating: 4.7, reviews: 980, price: 18000, currency: 'KES', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Restaurant', 'Bar', 'Business Center'], location: 'CBD', description: 'Historic hotel with colonial charm' },
      { id: 'h3', name: 'Radisson Blu', rating: 4.6, reviews: 756, price: 15000, currency: 'KES', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Parking'], location: 'Upper Hill', description: 'Modern comfort with stunning city views' },
      { id: 'h4', name: 'The Boma Nairobi', rating: 4.5, reviews: 542, price: 12000, currency: 'KES', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Restaurant', 'Pool', 'Gym'], location: 'Hurlingham', description: 'Boutique hotel with African elegance' },
    ],
    attractions: [
      { id: 'a1', name: 'Nairobi National Park', type: 'Wildlife', rating: 4.8, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop&q=80', description: 'See lions, rhinos, and giraffes with the city skyline as backdrop', entryFee: 'KES 430', hours: '6:00 AM - 6:00 PM' },
      { id: 'a2', name: 'Giraffe Centre', type: 'Wildlife', rating: 4.7, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&h=300&fit=crop&q=80', description: 'Get up close with endangered Rothschild giraffes', entryFee: 'KES 1500', hours: '9:00 AM - 5:00 PM' },
      { id: 'a3', name: 'David Sheldrick Wildlife Trust', type: 'Wildlife', rating: 4.9, image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&h=300&fit=crop&q=80', description: 'Elephant orphanage - watch baby elephants play', entryFee: 'KES 1500', hours: '11:00 AM - 12:00 PM' },
      { id: 'a4', name: 'Karura Forest', type: 'Nature', rating: 4.6, image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop&q=80', description: 'Urban forest with hiking trails and waterfalls', entryFee: 'KES 600', hours: '6:00 AM - 6:00 PM' },
      { id: 'a5', name: 'Nairobi National Museum', type: 'Culture', rating: 4.5, image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop&q=80', description: 'Rich history and cultural heritage of Kenya', entryFee: 'KES 1200', hours: '8:30 AM - 5:30 PM' },
    ]
  },
  'Kampala': {
    name: 'Kampala',
    country: 'Uganda',
    flag: '🇺🇬',
    description: 'The capital and largest city of Uganda, built on seven hills. A bustling metropolis with rich history, vibrant nightlife, and gateway to Uganda\'s incredible wildlife.',
    image: 'https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=1920&h=800&fit=crop&q=80',
    timezone: 'EAT (UTC+3)',
    currency: 'UGX',
    language: 'English, Luganda',
    population: '1.7 million',
    hotels: [
      { id: 'h1', name: 'Sheraton Kampala', rating: 4.8, reviews: 890, price: 450000, currency: 'UGX', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'], location: 'Central', description: 'Iconic luxury hotel overlooking the city' },
      { id: 'h2', name: 'Kampala Serena Hotel', rating: 4.7, reviews: 720, price: 380000, currency: 'UGX', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Business Center'], location: 'Nakasero', description: 'Award-winning African hospitality' },
      { id: 'h3', name: 'Protea Hotel by Marriott', rating: 4.5, reviews: 456, price: 280000, currency: 'UGX', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant'], location: 'Kololo', description: 'Contemporary comfort in a prime location' },
      { id: 'h4', name: 'Speke Hotel', rating: 4.4, reviews: 385, price: 200000, currency: 'UGX', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Restaurant', 'Bar'], location: 'Nile Avenue', description: 'Historic charm meets modern comfort' },
    ],
    attractions: [
      { id: 'a1', name: 'Uganda National Mosque', type: 'Religious', rating: 4.7, image: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&h=300&fit=crop&q=80', description: 'Stunning mosque with panoramic city views from the minaret', entryFee: 'UGX 20000', hours: '9:00 AM - 5:00 PM' },
      { id: 'a2', name: 'Kasubi Tombs', type: 'Heritage', rating: 4.5, image: 'https://images.unsplash.com/photo-1580746738099-78d14c7e60d3?w=400&h=300&fit=crop&q=80', description: 'UNESCO World Heritage Site - burial grounds of Buganda kings', entryFee: 'UGX 15000', hours: '8:00 AM - 6:00 PM' },
      { id: 'a3', name: 'Uganda Museum', type: 'Culture', rating: 4.4, image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop&q=80', description: 'Journey through Uganda\'s rich history and culture', entryFee: 'UGX 10000', hours: '10:00 AM - 6:00 PM' },
      { id: 'a4', name: 'Ndere Cultural Centre', type: 'Entertainment', rating: 4.6, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&q=80', description: 'Traditional dance and music performances', entryFee: 'UGX 50000', hours: 'Shows at 7:00 PM' },
    ]
  },
  'Kigali': {
    name: 'Kigali',
    country: 'Rwanda',
    flag: '🇷🇼',
    description: 'One of Africa\'s cleanest and safest cities. The "Land of a Thousand Hills" capital is known for its stunning scenery, excellent coffee, and remarkable transformation.',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1920&h=800&fit=crop&q=80',
    timezone: 'CAT (UTC+2)',
    currency: 'RWF',
    language: 'English, French, Kinyarwanda',
    population: '1.2 million',
    hotels: [
      { id: 'h1', name: 'Kigali Marriott Hotel', rating: 4.9, reviews: 680, price: 280000, currency: 'RWF', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'], location: 'City Center', description: 'Luxury hotel with stunning hillside views' },
      { id: 'h2', name: 'Kigali Serena Hotel', rating: 4.8, reviews: 520, price: 250000, currency: 'RWF', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'], location: 'Kiyovu', description: 'Elegant gardens and African hospitality' },
      { id: 'h3', name: 'Radisson Blu Hotel', rating: 4.6, reviews: 380, price: 180000, currency: 'RWF', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Bar'], location: 'Convention Center', description: 'Modern design meets comfort' },
      { id: 'h4', name: 'The Retreat by Heaven', rating: 4.7, reviews: 290, price: 150000, currency: 'RWF', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Restaurant', 'Garden', 'Yoga'], location: 'Kacyiru', description: 'Boutique eco-friendly retreat' },
    ],
    attractions: [
      { id: 'a1', name: 'Kigali Genocide Memorial', type: 'Memorial', rating: 4.9, image: 'https://images.unsplash.com/photo-1580746738099-78d14c7e60d3?w=400&h=300&fit=crop&q=80', description: 'Moving tribute to the 1994 genocide victims - a must-visit', entryFee: 'Free', hours: '8:00 AM - 5:00 PM' },
      { id: 'a2', name: 'Inema Arts Center', type: 'Art', rating: 4.7, image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&q=80', description: 'Contemporary Rwandan art gallery and studio', entryFee: 'Free', hours: '9:00 AM - 6:00 PM' },
      { id: 'a3', name: 'Kimironko Market', type: 'Market', rating: 4.5, image: 'https://images.unsplash.com/photo-1555529771-122e5b5f2c58?w=400&h=300&fit=crop&q=80', description: 'Vibrant local market for crafts and fresh produce', entryFee: 'Free', hours: '6:00 AM - 6:00 PM' },
      { id: 'a4', name: 'Nyamirambo Walking Tours', type: 'Tour', rating: 4.8, image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&q=80', description: 'Experience local life in Kigali\'s most vibrant neighborhood', entryFee: 'RWF 20000', hours: 'Tours at 9:00 AM' },
    ]
  },
  'Mombasa': {
    name: 'Mombasa',
    country: 'Kenya',
    flag: '🇰🇪',
    description: 'Kenya\'s coastal gem on the Indian Ocean. Ancient Swahili culture, pristine beaches, and rich history make this East Africa\'s most popular beach destination.',
    image: 'https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=1920&h=800&fit=crop&q=80',
    timezone: 'EAT (UTC+3)',
    currency: 'KES',
    language: 'English, Swahili',
    population: '1.2 million',
    hotels: [
      { id: 'h1', name: 'Sarova Whitesands', rating: 4.7, reviews: 1100, price: 22000, currency: 'KES', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&q=80', amenities: ['Beach', 'Pool', 'Spa', 'Restaurant', 'WiFi'], location: 'Bamburi Beach', description: 'Beachfront paradise with water sports' },
      { id: 'h2', name: 'Voyager Beach Resort', rating: 4.6, reviews: 890, price: 18000, currency: 'KES', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['Beach', 'Pool', 'Kids Club', 'Restaurant'], location: 'Nyali Beach', description: 'Family-friendly resort with pirate theme' },
      { id: 'h3', name: 'PrideInn Paradise', rating: 4.5, reviews: 650, price: 14000, currency: 'KES', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80', amenities: ['Beach', 'Pool', 'Restaurant', 'Bar'], location: 'Shanzu Beach', description: 'All-inclusive beach experience' },
      { id: 'h4', name: 'Diani Reef Beach Resort', rating: 4.8, reviews: 780, price: 25000, currency: 'KES', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80', amenities: ['Beach', 'Pool', 'Spa', 'Diving'], location: 'Diani Beach', description: 'Award-winning beach resort' },
    ],
    attractions: [
      { id: 'a1', name: 'Fort Jesus', type: 'Heritage', rating: 4.7, image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&h=300&fit=crop&q=80', description: 'UNESCO World Heritage Portuguese fort built in 1593', entryFee: 'KES 1200', hours: '8:00 AM - 6:00 PM' },
      { id: 'a2', name: 'Old Town Mombasa', type: 'Heritage', rating: 4.6, image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop&q=80', description: 'Winding streets with Swahili architecture and craft shops', entryFee: 'Free', hours: 'Open 24 hours' },
      { id: 'a3', name: 'Haller Park', type: 'Nature', rating: 4.5, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&h=300&fit=crop&q=80', description: 'Nature park with giraffes, hippos, and crocodiles', entryFee: 'KES 1200', hours: '8:00 AM - 5:00 PM' },
      { id: 'a4', name: 'Diani Beach', type: 'Beach', rating: 4.9, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80', description: 'Award-winning white sand beach with crystal clear waters', entryFee: 'Free', hours: 'Open 24 hours' },
    ]
  },
  'Dar es Salaam': {
    name: 'Dar es Salaam',
    country: 'Tanzania',
    flag: '🇹🇿',
    description: 'Tanzania\'s largest city and economic hub. The "Haven of Peace" blends modern skyscrapers with colonial architecture and beautiful Indian Ocean beaches.',
    image: 'https://images.unsplash.com/photo-1568625502763-2a5ec6a94c47?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1568625502763-2a5ec6a94c47?w=1920&h=800&fit=crop&q=80',
    timezone: 'EAT (UTC+3)',
    currency: 'TZS',
    language: 'English, Swahili',
    population: '6.7 million',
    hotels: [
      { id: 'h1', name: 'Hyatt Regency Dar es Salaam', rating: 4.8, reviews: 650, price: 350000, currency: 'TZS', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'], location: 'Kivukoni', description: 'Luxury waterfront hotel with harbor views' },
      { id: 'h2', name: 'Slipway Hotel', rating: 4.6, reviews: 420, price: 280000, currency: 'TZS', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Marina'], location: 'Msasani Peninsula', description: 'Boutique hotel with marina access' },
      { id: 'h3', name: 'Southern Sun', rating: 4.5, reviews: 380, price: 220000, currency: 'TZS', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Business Center'], location: 'City Center', description: 'Central location with modern amenities' },
    ],
    attractions: [
      { id: 'a1', name: 'National Museum', type: 'Culture', rating: 4.5, image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop&q=80', description: 'Learn about Tanzania\'s history and the famous Homo habilis fossils', entryFee: 'TZS 15000', hours: '9:30 AM - 6:00 PM' },
      { id: 'a2', name: 'Coco Beach', type: 'Beach', rating: 4.4, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80', description: 'Popular beach for swimming and sunset views', entryFee: 'Free', hours: 'Open 24 hours' },
      { id: 'a3', name: 'Village Museum', type: 'Culture', rating: 4.3, image: 'https://images.unsplash.com/photo-1580746738099-78d14c7e60d3?w=400&h=300&fit=crop&q=80', description: 'Open-air museum showcasing Tanzania\'s tribal diversity', entryFee: 'TZS 10000', hours: '9:00 AM - 5:00 PM' },
    ]
  },
  'Arusha': {
    name: 'Arusha',
    country: 'Tanzania',
    flag: '🇹🇿',
    description: 'Safari capital of Tanzania and gateway to Serengeti, Ngorongoro, and Kilimanjaro. A vibrant city surrounded by stunning natural beauty.',
    image: 'https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=1920&h=800&fit=crop&q=80',
    timezone: 'EAT (UTC+3)',
    currency: 'TZS',
    language: 'English, Swahili',
    population: '416,000',
    hotels: [
      { id: 'h1', name: 'Gran Meliá Arusha', rating: 4.9, reviews: 520, price: 450000, currency: 'TZS', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Coffee Farm'], location: 'Usa River', description: 'Luxury safari lodge with Kilimanjaro views' },
      { id: 'h2', name: 'Four Points by Sheraton', rating: 4.6, reviews: 380, price: 280000, currency: 'TZS', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Gym'], location: 'City Center', description: 'Modern hotel in the heart of Arusha' },
      { id: 'h3', name: 'Mount Meru Hotel', rating: 4.5, reviews: 290, price: 180000, currency: 'TZS', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Garden'], location: 'City Center', description: 'Classic hotel with mountain views' },
    ],
    attractions: [
      { id: 'a1', name: 'Arusha National Park', type: 'Wildlife', rating: 4.8, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop&q=80', description: 'Diverse ecosystems from rainforest to alpine desert', entryFee: 'USD 50', hours: '6:00 AM - 6:00 PM' },
      { id: 'a2', name: 'Mount Meru', type: 'Mountain', rating: 4.7, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80', description: 'Tanzania\'s second highest peak - excellent for acclimatization', entryFee: 'USD 50/day', hours: 'Multi-day treks' },
      { id: 'a3', name: 'Shanga Cultural Centre', type: 'Culture', rating: 4.6, image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop&q=80', description: 'Social enterprise employing disabled artisans', entryFee: 'Free', hours: '8:30 AM - 5:00 PM' },
      { id: 'a4', name: 'Maasai Market', type: 'Market', rating: 4.5, image: 'https://images.unsplash.com/photo-1555529771-122e5b5f2c58?w=400&h=300&fit=crop&q=80', description: 'Traditional crafts and Maasai cultural items', entryFee: 'Free', hours: '8:00 AM - 6:00 PM' },
    ]
  },
  'Goma': {
    name: 'Goma',
    country: 'DR Congo',
    flag: '🇨🇩',
    description: 'Gateway to Virunga National Park and the mountain gorillas. Situated on the shores of Lake Kivu with the dramatic Nyiragongo volcano as backdrop.',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&h=800&fit=crop&q=80',
    timezone: 'CAT (UTC+2)',
    currency: 'USD/CDF',
    language: 'French, Swahili',
    population: '670,000',
    hotels: [
      { id: 'h1', name: 'Hotel Ihusi', rating: 4.5, reviews: 180, price: 150, currency: 'USD', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Restaurant', 'Lake View', 'Generator'], location: 'Lake Kivu Shore', description: 'Lakefront hotel with stunning views' },
      { id: 'h2', name: 'Serena Kivu Hotel', rating: 4.4, reviews: 120, price: 120, currency: 'USD', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant'], location: 'City Center', description: 'Comfortable base for gorilla trekking' },
    ],
    attractions: [
      { id: 'a1', name: 'Virunga National Park', type: 'Wildlife', rating: 4.9, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop&q=80', description: 'Africa\'s oldest national park - home to mountain gorillas', entryFee: 'USD 400', hours: 'Tours start 6:00 AM' },
      { id: 'a2', name: 'Nyiragongo Volcano', type: 'Adventure', rating: 4.8, image: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=400&h=300&fit=crop&q=80', description: 'Active volcano with the world\'s largest lava lake', entryFee: 'USD 300', hours: 'Overnight trek' },
      { id: 'a3', name: 'Lake Kivu', type: 'Nature', rating: 4.6, image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop&q=80', description: 'One of Africa\'s great lakes - swimming and boat rides', entryFee: 'Free', hours: 'Open 24 hours' },
    ]
  },
  'Jinja': {
    name: 'Jinja',
    country: 'Uganda',
    flag: '🇺🇬',
    description: 'Adventure capital of East Africa, located at the source of the Nile. Famous for world-class whitewater rafting, bungee jumping, and water sports.',
    image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1920&h=800&fit=crop&q=80',
    timezone: 'EAT (UTC+3)',
    currency: 'UGX',
    language: 'English, Luganda',
    population: '300,000',
    hotels: [
      { id: 'h1', name: 'Wildwaters Lodge', rating: 4.9, reviews: 280, price: 450, currency: 'USD', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&q=80', amenities: ['River View', 'Pool', 'Restaurant', 'Spa'], location: 'Nile River', description: 'Luxury lodge on a private island in the Nile' },
      { id: 'h2', name: 'Jinja Nile Resort', rating: 4.6, reviews: 220, price: 180000, currency: 'UGX', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Adventure Desk'], location: 'Nile Banks', description: 'Riverside resort with adventure activities' },
    ],
    attractions: [
      { id: 'a1', name: 'Source of the Nile', type: 'Nature', rating: 4.7, image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&h=300&fit=crop&q=80', description: 'Where the world\'s longest river begins its journey', entryFee: 'UGX 10000', hours: '8:00 AM - 6:00 PM' },
      { id: 'a2', name: 'Whitewater Rafting', type: 'Adventure', rating: 4.9, image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=400&h=300&fit=crop&q=80', description: 'World-class Grade 5 rapids on the Nile', entryFee: 'USD 125', hours: 'Full day trips' },
      { id: 'a3', name: 'Bungee Jumping', type: 'Adventure', rating: 4.8, image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400&h=300&fit=crop&q=80', description: '44-meter jump over the Nile River', entryFee: 'USD 115', hours: '9:00 AM - 5:00 PM' },
    ]
  },
  'Bujumbura': {
    name: 'Bujumbura',
    country: 'Burundi',
    flag: '🇧🇮',
    description: 'The former capital and largest city of Burundi, beautifully situated on the shores of Lake Tanganyika. Known for its beaches, vibrant nightlife, and as a gateway to Burundi\'s natural wonders.',
    image: 'https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=1920&h=800&fit=crop&q=80',
    timezone: 'CAT (UTC+2)',
    currency: 'BIF',
    language: 'French, Kirundi',
    population: '1.2 million',
    hotels: [
      { id: 'h1', name: 'Hotel Club du Lac Tanganyika', rating: 4.6, reviews: 320, price: 120, currency: 'USD', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&q=80', amenities: ['Beach', 'Pool', 'Restaurant', 'WiFi'], location: 'Lake Shore', description: 'Beachfront resort on Lake Tanganyika' },
      { id: 'h2', name: 'Kiriri Garden Hotel', rating: 4.4, reviews: 185, price: 85, currency: 'USD', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Pool', 'Restaurant', 'Garden'], location: 'City Center', description: 'Peaceful garden hotel in the heart of Bujumbura' },
      { id: 'h3', name: 'Hotel Safari Gate', rating: 4.3, reviews: 140, price: 70, currency: 'USD', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Restaurant', 'Bar'], location: 'Downtown', description: 'Modern comfort with African hospitality' },
    ],
    attractions: [
      { id: 'a1', name: 'Lake Tanganyika Beach', type: 'Beach', rating: 4.7, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80', description: 'Beautiful sandy beaches on the world\'s second deepest lake', entryFee: 'Free', hours: 'Open 24 hours' },
      { id: 'a2', name: 'Rusizi National Park', type: 'Wildlife', rating: 4.5, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop&q=80', description: 'Hippos, crocodiles, and birdlife at the Rusizi River delta', entryFee: 'USD 20', hours: '6:00 AM - 6:00 PM' },
      { id: 'a3', name: 'Living Museum of Bujumbura', type: 'Culture', rating: 4.3, image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop&q=80', description: 'Traditional Burundian culture and crafts', entryFee: 'BIF 5000', hours: '9:00 AM - 5:00 PM' },
      { id: 'a4', name: 'Saga Beach', type: 'Beach', rating: 4.6, image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=400&h=300&fit=crop&q=80', description: 'Popular beach resort with restaurants and water activities', entryFee: 'BIF 2000', hours: '8:00 AM - 8:00 PM' },
    ]
  },
  'Gitega': {
    name: 'Gitega',
    country: 'Burundi',
    flag: '🇧🇮',
    description: 'The political capital of Burundi since 2019, located in the heart of the country. Rich in history and home to the National Museum of Gitega.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&q=80',
    heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=800&fit=crop&q=80',
    timezone: 'CAT (UTC+2)',
    currency: 'BIF',
    language: 'French, Kirundi',
    population: '135,000',
    hotels: [
      { id: 'h1', name: 'Hotel Novy', rating: 4.2, reviews: 85, price: 60, currency: 'USD', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop&q=80', amenities: ['WiFi', 'Restaurant', 'Parking'], location: 'City Center', description: 'Comfortable hotel in the capital' },
    ],
    attractions: [
      { id: 'a1', name: 'National Museum of Gitega', type: 'Culture', rating: 4.5, image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop&q=80', description: 'Burundi\'s premier museum with royal artifacts and history', entryFee: 'BIF 5000', hours: '8:00 AM - 5:00 PM' },
      { id: 'a2', name: 'Royal Drum Sanctuary', type: 'Heritage', rating: 4.6, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&q=80', description: 'Sacred site of traditional Burundian drumming', entryFee: 'BIF 3000', hours: '9:00 AM - 4:00 PM' },
    ]
  }
}

// Default city data for cities not in the database
const getDefaultCityData = (cityName: string) => ({
  name: cityName,
  country: 'East Africa',
  flag: '🌍',
  description: `Discover the beauty and culture of ${cityName}. Book your transport and explore the local attractions.`,
  image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
  heroImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=800&fit=crop&q=80',
  timezone: 'EAT (UTC+3)',
  currency: 'USD',
  language: 'Local languages',
  population: 'Unknown',
  hotels: [] as typeof cityData.Nairobi.hotels,
  attractions: [] as typeof cityData.Nairobi.attractions
})

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-3 h-3" />,
  'Pool': <Waves className="w-3 h-3" />,
  'Restaurant': <Utensils className="w-3 h-3" />,
  'Spa': <Sparkles className="w-3 h-3" />,
  'Gym': <Mountain className="w-3 h-3" />,
  'Parking': <Car className="w-3 h-3" />,
  'Bar': <Coffee className="w-3 h-3" />,
  'Beach': <Waves className="w-3 h-3" />,
}

const attractionIcons: Record<string, React.ReactNode> = {
  'Wildlife': <TreePine className="w-4 h-4" />,
  'Heritage': <Building className="w-4 h-4" />,
  'Nature': <Mountain className="w-4 h-4" />,
  'Culture': <Landmark className="w-4 h-4" />,
  'Beach': <Waves className="w-4 h-4" />,
  'Adventure': <Sparkles className="w-4 h-4" />,
  'Market': <Coffee className="w-4 h-4" />,
  'Art': <Camera className="w-4 h-4" />,
  'Religious': <Building className="w-4 h-4" />,
  'Memorial': <Building className="w-4 h-4" />,
  'Tour': <Navigation className="w-4 h-4" />,
  'Mountain': <Mountain className="w-4 h-4" />,
  'Entertainment': <Star className="w-4 h-4" />,
}

export default function CityPage() {
  const { cityName } = useParams<{ cityName: string }>()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<'hotels' | 'attractions'>('hotels')
  const [savedHotels, setSavedHotels] = useState<Set<string>>(new Set())
  const [savedAttractions, setSavedAttractions] = useState<Set<string>>(new Set())
  
  const decodedCity = decodeURIComponent(cityName || '')
  const city = cityData[decodedCity] || getDefaultCityData(decodedCity)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [cityName])

  const toggleSaveHotel = (id: string) => {
    setSavedHotels(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSaveAttraction = (id: string) => {
    setSavedAttractions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const formatPrice = (price: number, currency: string) => {
    const symbols: Record<string, string> = { KES: 'KSh', UGX: 'USh', RWF: 'FRw', TZS: 'TSh', USD: '$', CDF: 'FC' }
    return `${symbols[currency] || currency} ${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <img 
            src={city.heroImage} 
            alt={city.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </motion.div>
        
        {/* Back button */}
        <motion.div 
          className="absolute top-6 left-6 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="glass" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>
        
        {/* City info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{city.flag}</span>
                <Badge variant="secondary" className="text-sm">
                  {city.country}
                </Badge>
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                {city.name}
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mb-6">
                {city.description}
              </p>
              
              {/* Quick info */}
              <div className="flex flex-wrap gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {city.timezone}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" /> {city.language}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Pop: {city.population}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-6 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant={selectedTab === 'hotels' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('hotels')}
                className="gap-2"
              >
                <Hotel className="w-4 h-4" />
                Hotels ({city.hotels.length})
              </Button>
              <Button 
                variant={selectedTab === 'attractions' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('attractions')}
                className="gap-2"
              >
                <Landmark className="w-4 h-4" />
                Attractions ({city.attractions.length})
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/search?destination=${encodeURIComponent(city.name)}`)}>
                <Bus className="w-4 h-4 mr-2" />
                Book Transport
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {selectedTab === 'hotels' ? (
              <motion.div
                key="hotels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      Stay in <span className="text-gradient">{city.name}</span>
                    </h2>
                    <p className="text-muted-foreground">
                      {city.hotels.length > 0 
                        ? `${city.hotels.length} hotels available for your stay`
                        : 'Hotels coming soon for this destination'
                      }
                    </p>
                  </div>
                </div>

                {city.hotels.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {city.hotels.map((hotel, index) => (
                      <motion.div
                        key={hotel.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:border-primary/50 transition-all group cursor-pointer">
                          <div className="flex flex-col md:flex-row">
                            <div className="relative w-full md:w-48 h-48 overflow-hidden">
                              <img 
                                src={hotel.image} 
                                alt={hotel.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <button 
                                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                                onClick={(e) => { e.stopPropagation(); toggleSaveHotel(hotel.id) }}
                              >
                                <Heart className={`w-4 h-4 ${savedHotels.has(hotel.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                              </button>
                            </div>
                            <CardContent className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                    {hotel.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {hotel.location}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium">{hotel.rating}</span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{hotel.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {hotel.amenities.slice(0, 5).map((amenity) => (
                                  <Badge key={amenity} variant="secondary" className="text-xs gap-1">
                                    {amenityIcons[amenity] || <Sparkles className="w-3 h-3" />}
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-xl font-bold text-primary">
                                    {formatPrice(hotel.price, hotel.currency)}
                                  </span>
                                  <span className="text-sm text-muted-foreground"> /night</span>
                                </div>
                                <Button size="sm" variant="gradient">
                                  Book Now
                                </Button>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Hotels Listed Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      We're working on adding hotels in {city.name}. Check back soon!
                    </p>
                    <Button variant="outline" onClick={() => navigate(`/search?destination=${encodeURIComponent(city.name)}`)}>
                      <Bus className="w-4 h-4 mr-2" />
                      Book Transport Instead
                    </Button>
                  </Card>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="attractions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      Explore <span className="text-gradient">{city.name}</span>
                    </h2>
                    <p className="text-muted-foreground">
                      {city.attractions.length > 0 
                        ? `${city.attractions.length} must-visit places`
                        : 'Attractions coming soon for this destination'
                      }
                    </p>
                  </div>
                </div>

                {city.attractions.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {city.attractions.map((attraction, index) => (
                      <motion.div
                        key={attraction.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:border-primary/50 transition-all group cursor-pointer h-full">
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={attraction.image} 
                              alt={attraction.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <button 
                              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                              onClick={(e) => { e.stopPropagation(); toggleSaveAttraction(attraction.id) }}
                            >
                              <Heart className={`w-4 h-4 ${savedAttractions.has(attraction.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                            </button>
                            <Badge 
                              className="absolute bottom-3 left-3 gap-1"
                              variant="secondary"
                            >
                              {attractionIcons[attraction.type] || <Star className="w-3 h-3" />}
                              {attraction.type}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {attraction.name}
                              </h3>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-medium">{attraction.rating}</span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {attraction.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm">
                              {attraction.entryFee && (
                                <span className="text-muted-foreground">
                                  Entry: <span className="font-medium text-foreground">{attraction.entryFee}</span>
                                </span>
                              )}
                              {attraction.hours && (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {attraction.hours}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Landmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Attractions Listed Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      We're working on adding attractions in {city.name}. Check back soon!
                    </p>
                    <Button variant="outline" onClick={() => navigate(`/search?destination=${encodeURIComponent(city.name)}`)}>
                      <Bus className="w-4 h-4 mr-2" />
                      Book Transport
                    </Button>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Book Transport CTA */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-sky-600 to-maroon-700 border-0 overflow-hidden relative">
            <div className="absolute inset-0 pattern-dots opacity-20" />
            <CardContent className="p-8 md:p-12 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                    Ready to visit {city.name}?
                  </h3>
                  <p className="text-white/80">
                    Book buses, flights, trains & ferries to {city.name}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="bg-white text-sky-600 hover:bg-white/90"
                    onClick={() => navigate(`/search?destination=${encodeURIComponent(city.name)}`)}
                  >
                    <Bus className="w-4 h-4 mr-2" />
                    Find Transport
                  </Button>
                  <Button 
                    size="lg" 
                    variant="glass"
                    onClick={() => navigate(`/search?origin=${encodeURIComponent(city.name)}`)}
                  >
                    <Plane className="w-4 h-4 mr-2" />
                    Travel From Here
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

