import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Sparkles, Shield, CreditCard, ArrowRight, MapPin, Star, Bus, Globe, Plane, Train, Ship } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AISearchBar from '@/components/search/AISearchBar'
import SearchBar from '@/components/search/SearchBar'
import TripCard from '@/components/trips/TripCard'
import { TripCardSkeleton } from '@/components/ui/skeleton'
import { searchApi, aiApi } from '@/lib/api'
import type { Trip, TravelMode } from '@/types'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
}

const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
  }
}

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
}

// Floating particle component
const FloatingParticle = ({ delay, duration, x, size, color }: { delay: number; duration: number; x: number; size: number; color: string }) => (
  <motion.div
    className={`absolute rounded-full ${color}`}
    style={{ width: size, height: size, left: `${x}%` }}
    initial={{ y: '110vh', opacity: 0 }}
    animate={{ 
      y: '-10vh', 
      opacity: [0, 1, 1, 0],
      rotate: [0, 360]
    }}
    transition={{ 
      duration, 
      delay, 
      repeat: Infinity, 
      ease: "linear"
    }}
  />
)

const features = [
  { icon: <Sparkles className="h-6 w-6" />, title: 'AI-Powered Search', description: 'Natural language queries to find your perfect trip' },
  { icon: <Globe className="h-6 w-6" />, title: 'East Africa Coverage', description: 'Kenya, Uganda, Rwanda, Congo & Tanzania routes' },
  { icon: <Shield className="h-6 w-6" />, title: 'Secure Booking', description: 'Safe and encrypted payment processing' },
  { icon: <CreditCard className="h-6 w-6" />, title: 'Multiple Currencies', description: 'Pay in KES, UGX, RWF, USD or local currency' }
]

// Travel modes available
const travelModes = [
  { mode: 'bus' as TravelMode, name: 'Buses', icon: <Bus className="h-5 w-5" />, emoji: '🚌', color: 'bg-sky-500' },
  { mode: 'flight' as TravelMode, name: 'Flights', icon: <Plane className="h-5 w-5" />, emoji: '✈️', color: 'bg-violet-500' },
  { mode: 'train' as TravelMode, name: 'Trains', icon: <Train className="h-5 w-5" />, emoji: '🚂', color: 'bg-emerald-500' },
  { mode: 'ferry' as TravelMode, name: 'Ferries', icon: <Ship className="h-5 w-5" />, emoji: '⛴️', color: 'bg-blue-500' },
]

const countries = [
  { name: 'Kenya', flag: '🇰🇪', cities: ['Nairobi', 'Mombasa', 'Kisumu'] },
  { name: 'Uganda', flag: '🇺🇬', cities: ['Kampala', 'Jinja', 'Entebbe'] },
  { name: 'Rwanda', flag: '🇷🇼', cities: ['Kigali', 'Butare', 'Musanze'] },
  { name: 'Tanzania', flag: '🇹🇿', cities: ['Dar es Salaam', 'Dodoma', 'Zanzibar'] },
  { name: 'Burundi', flag: '🇧🇮', cities: ['Bujumbura', 'Gitega'] },
  { name: 'Congo DRC', flag: '🇨🇩', cities: ['Kinshasa', 'Goma', 'Bukavu'] },
]

// East African CAPITAL city images - Real verified city photos
const destinationImages: Record<string, string> = {
  // 🇰🇪 Nairobi - Actual Nairobi skyline with KICC tower
  'Nairobi': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400&h=400&fit=crop&q=80',
  // 🇺🇬 Kampala - Uganda's capital on seven hills
  'Kampala': 'https://images.unsplash.com/photo-1597007030739-6d2e39278470?w=400&h=400&fit=crop&q=80',
  // 🇷🇼 Kigali - Rwanda's clean modern capital
  'Kigali': 'https://images.unsplash.com/photo-1619451683160-4afc79989f68?w=400&h=400&fit=crop&q=80',
  // 🇹🇿 Dar es Salaam - Tanzania's coastal city harbor
  'Dar es Salaam': 'https://images.unsplash.com/photo-1568057373406-a39e8acb8aa2?w=400&h=400&fit=crop&q=80',
  // 🇧🇮 Bujumbura - Burundi capital on Lake Tanganyika
  'Bujumbura': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&h=400&fit=crop&q=80',
  // 🇨🇩 Kinshasa - DRC capital on Congo River
  'Kinshasa': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop&q=80',
  // 🇰🇪 Mombasa - Kenya coastal city
  'Mombasa': 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400&h=400&fit=crop&q=80',
  // 🇹🇿 Zanzibar - Stone Town historic center
  'Zanzibar': 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=400&h=400&fit=crop&q=80',
  // 🇹🇿 Arusha - Gateway to Kilimanjaro
  'Arusha': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=400&fit=crop&q=80',
  // 🇨🇩 Goma - Lake Kivu volcanic city
  'Goma': 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&h=400&fit=crop&q=80',
  // 🇹🇿 Dodoma - Tanzania official capital
  'Dodoma': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&h=400&fit=crop&q=80',
  // 🇧🇮 Gitega - Burundi political capital
  'Gitega': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=400&fit=crop&q=80',
}

const defaultCityImage = 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400&h=400&fit=crop&q=80'

// Featured destinations - 6 MAIN CAPITAL CITIES
const fallbackDestinations = [
  'Nairobi',       // 🇰🇪 Kenya capital
  'Kampala',       // 🇺🇬 Uganda capital  
  'Kigali',        // 🇷🇼 Rwanda capital
  'Dar es Salaam', // 🇹🇿 Tanzania capital
  'Bujumbura',     // 🇧🇮 Burundi capital
  'Kinshasa',      // 🇨🇩 DRC Congo capital
]

// Multi-modal fallback trips - buses, flights, trains, ferries
const fallbackTrips: Trip[] = [
  // Buses
  {
    id: 'bus-001',
    provider: 'easy-coach',
    provider_name: 'Easy Coach',
    origin: 'Nairobi',
    destination: 'Mombasa',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 28800000).toISOString(),
    duration_minutes: 480,
    price: 1500,
    currency: 'KES',
    available_seats: 24,
    total_seats: 45,
    travel_mode: 'bus',
    vehicle_type: 'Executive',
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80'
  },
  // Flights
  {
    id: 'flight-001',
    provider: 'kenya-airways',
    provider_name: 'Kenya Airways',
    origin: 'Nairobi (JKIA)',
    destination: 'Mombasa (MIA)',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    duration_minutes: 60,
    price: 8500,
    currency: 'KES',
    available_seats: 45,
    total_seats: 150,
    travel_mode: 'flight',
    vehicle_type: 'Boeing 737',
    class: 'Economy',
    amenities: ['WiFi', 'Entertainment', 'Meals', 'USB Charging'],
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop&q=80'
  },
  {
    id: 'flight-002',
    provider: 'rwandair',
    provider_name: 'RwandAir',
    origin: 'Nairobi (JKIA)',
    destination: 'Kigali (KGL)',
    departure_time: new Date(Date.now() + 172800000).toISOString(),
    arrival_time: new Date(Date.now() + 172800000 + 5400000).toISOString(),
    duration_minutes: 90,
    price: 185,
    currency: 'USD',
    available_seats: 30,
    total_seats: 120,
    travel_mode: 'flight',
    vehicle_type: 'Airbus A320',
    class: 'Economy',
    amenities: ['WiFi', 'Entertainment', 'Meals', 'USB Charging'],
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=600&h=400&fit=crop&q=80'
  },
  // Trains
  {
    id: 'train-001',
    provider: 'sgr-kenya',
    provider_name: 'Madaraka Express (SGR)',
    origin: 'Nairobi Terminus',
    destination: 'Mombasa Terminus',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 18000000).toISOString(),
    duration_minutes: 300,
    price: 3000,
    currency: 'KES',
    available_seats: 120,
    total_seats: 400,
    travel_mode: 'train',
    vehicle_type: 'Express Train',
    class: 'First Class',
    amenities: ['AC', 'USB Charging', 'Meals', 'Entertainment'],
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&h=400&fit=crop&q=80'
  },
  {
    id: 'train-002',
    provider: 'tanzania-railway',
    provider_name: 'Tanzania Railways',
    origin: 'Dar es Salaam',
    destination: 'Dodoma',
    departure_time: new Date(Date.now() + 259200000).toISOString(),
    arrival_time: new Date(Date.now() + 259200000 + 28800000).toISOString(),
    duration_minutes: 480,
    price: 45000,
    currency: 'TZS',
    available_seats: 80,
    total_seats: 250,
    travel_mode: 'train',
    vehicle_type: 'Standard Rail',
    class: 'Economy',
    amenities: ['AC', 'Reclining Seats'],
    rating: 4.2,
    image_url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=600&h=400&fit=crop&q=80'
  },
  // Ferries
  {
    id: 'ferry-001',
    provider: 'likoni-ferry',
    provider_name: 'Likoni Ferry Services',
    origin: 'Mombasa Island',
    destination: 'South Coast',
    departure_time: new Date(Date.now() + 43200000).toISOString(),
    arrival_time: new Date(Date.now() + 43200000 + 1200000).toISOString(),
    duration_minutes: 20,
    price: 50,
    currency: 'KES',
    available_seats: 200,
    total_seats: 500,
    travel_mode: 'ferry',
    vehicle_type: 'Passenger Ferry',
    amenities: ['Open Deck', 'Pedestrian Friendly'],
    rating: 4.0,
    image_url: 'https://images.unsplash.com/photo-1545890404-6d5b2f65c6b1?w=600&h=400&fit=crop&q=80'
  },
  {
    id: 'ferry-002',
    provider: 'lake-victoria-ferry',
    provider_name: 'Lake Victoria Ferry',
    origin: 'Kisumu Port',
    destination: 'Mwanza Port',
    departure_time: new Date(Date.now() + 172800000).toISOString(),
    arrival_time: new Date(Date.now() + 172800000 + 21600000).toISOString(),
    duration_minutes: 360,
    price: 4500,
    currency: 'KES',
    available_seats: 50,
    total_seats: 150,
    travel_mode: 'ferry',
    vehicle_type: 'Lake Cruiser',
    class: 'Standard',
    amenities: ['Cabin', 'Restaurant', 'WiFi'],
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&q=80'
  },
  // Cross-border buses
  {
    id: 'bus-002',
    provider: 'modern-coast',
    provider_name: 'Modern Coast',
    origin: 'Nairobi',
    destination: 'Kampala',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 43200000).toISOString(),
    duration_minutes: 720,
    price: 3500,
    currency: 'KES',
    available_seats: 20,
    total_seats: 45,
    travel_mode: 'bus',
    vehicle_type: 'VIP Sleeper',
    bus_type: 'VIP',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Meals', 'Entertainment'],
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=600&h=400&fit=crop&q=80'
  },
  // 🇺🇬 Uganda Routes
  {
    id: 'bus-ug-001',
    provider: 'link-bus',
    provider_name: 'Link Bus Uganda',
    origin: 'Kampala',
    destination: 'Jinja',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 5400000).toISOString(),
    duration_minutes: 90,
    price: 25000,
    currency: 'UGX',
    available_seats: 35,
    total_seats: 45,
    travel_mode: 'bus',
    vehicle_type: 'Standard',
    bus_type: 'Standard',
    amenities: ['AC'],
    rating: 4.1,
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop&q=80'
  },
  {
    id: 'flight-ug-001',
    provider: 'uganda-airlines',
    provider_name: 'Uganda Airlines',
    origin: 'Entebbe (EBB)',
    destination: 'Mombasa (MBA)',
    departure_time: new Date(Date.now() + 172800000).toISOString(),
    arrival_time: new Date(Date.now() + 172800000 + 5400000).toISOString(),
    duration_minutes: 90,
    price: 220,
    currency: 'USD',
    available_seats: 40,
    total_seats: 140,
    travel_mode: 'flight',
    vehicle_type: 'CRJ-900',
    class: 'Economy',
    amenities: ['WiFi', 'Meals', 'Entertainment'],
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop&q=80'
  },
  // 🇷🇼 Rwanda Routes  
  {
    id: 'bus-rw-001',
    provider: 'volcano-express',
    provider_name: 'Volcano Express',
    origin: 'Kigali',
    destination: 'Gisenyi',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 10800000).toISOString(),
    duration_minutes: 180,
    price: 5000,
    currency: 'RWF',
    available_seats: 28,
    total_seats: 45,
    travel_mode: 'bus',
    vehicle_type: 'Executive',
    bus_type: 'Executive',
    amenities: ['AC', 'USB Charging'],
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=600&h=400&fit=crop&q=80'
  },
  {
    id: 'flight-rw-001',
    provider: 'rwandair',
    provider_name: 'RwandAir',
    origin: 'Kigali (KGL)',
    destination: 'Entebbe (EBB)',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 2700000).toISOString(),
    duration_minutes: 45,
    price: 150,
    currency: 'USD',
    available_seats: 35,
    total_seats: 120,
    travel_mode: 'flight',
    vehicle_type: 'Dash 8',
    class: 'Economy',
    amenities: ['Snacks', 'Drinks'],
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?w=600&h=400&fit=crop&q=80'
  },
  // 🇨🇩 Congo (DRC) Routes
  {
    id: 'bus-cd-001',
    provider: 'virunga-express',
    provider_name: 'Virunga Express',
    origin: 'Goma',
    destination: 'Bukavu',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 14400000).toISOString(),
    duration_minutes: 240,
    price: 35,
    currency: 'USD',
    available_seats: 30,
    total_seats: 45,
    travel_mode: 'bus',
    vehicle_type: 'Standard',
    bus_type: 'Standard',
    amenities: ['AC', 'Border Assistance'],
    rating: 3.9,
    image_url: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=600&h=400&fit=crop&q=80'
  },
  {
    id: 'ferry-cd-001',
    provider: 'lake-kivu-ferry',
    provider_name: 'Lake Kivu Ferry',
    origin: 'Goma Port',
    destination: 'Bukavu Port',
    departure_time: new Date(Date.now() + 172800000).toISOString(),
    arrival_time: new Date(Date.now() + 172800000 + 14400000).toISOString(),
    duration_minutes: 240,
    price: 25,
    currency: 'USD',
    available_seats: 60,
    total_seats: 120,
    travel_mode: 'ferry',
    vehicle_type: 'Lake Ferry',
    amenities: ['Open Deck', 'Restaurant'],
    rating: 4.1,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&q=80'
  },
  // 🇹🇿 Tanzania Routes
  {
    id: 'bus-tz-001',
    provider: 'kilimanjaro-express',
    provider_name: 'Kilimanjaro Express',
    origin: 'Dar es Salaam',
    destination: 'Arusha',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 36000000).toISOString(),
    duration_minutes: 600,
    price: 45000,
    currency: 'TZS',
    available_seats: 25,
    total_seats: 45,
    travel_mode: 'bus',
    vehicle_type: 'Executive',
    bus_type: 'Executive',
    amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks'],
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80'
  },
  {
    id: 'flight-tz-001',
    provider: 'precision-air',
    provider_name: 'Precision Air',
    origin: 'Dar es Salaam (DAR)',
    destination: 'Kilimanjaro (JRO)',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 4500000).toISOString(),
    duration_minutes: 75,
    price: 180,
    currency: 'USD',
    available_seats: 50,
    total_seats: 100,
    travel_mode: 'flight',
    vehicle_type: 'ATR 72',
    class: 'Economy',
    amenities: ['Snacks', 'Drinks'],
    rating: 4.3,
    image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop&q=80'
  },
  {
    id: 'shuttle-tz-001',
    provider: 'riverside-shuttle',
    provider_name: 'Riverside Shuttle',
    origin: 'Arusha',
    destination: 'Nairobi',
    departure_time: new Date(Date.now() + 86400000).toISOString(),
    arrival_time: new Date(Date.now() + 86400000 + 21600000).toISOString(),
    duration_minutes: 360,
    price: 35,
    currency: 'USD',
    available_seats: 12,
    total_seats: 18,
    travel_mode: 'shuttle',
    vehicle_type: 'Mini Van',
    amenities: ['AC', 'Border Assistance'],
    rating: 4.2,
    image_url: 'https://images.unsplash.com/photo-1449965408869-ebd3fee29a08?w=600&h=400&fit=crop&q=80'
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>(fallbackTrips)
  const [destinations, setDestinations] = useState<string[]>(fallbackDestinations)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMode, setSelectedMode] = useState<TravelMode | 'all'>('all')
  
  // Parallax scroll effect
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  // Generate random particles
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
      x: Math.random() * 100,
      size: 4 + Math.random() * 8,
      color: i % 3 === 0 ? 'bg-sky-400/30' : i % 3 === 1 ? 'bg-cyan-400/20' : 'bg-rose-400/20'
    })), []
  )

  useEffect(() => {
    async function loadData() {
      try {
        const [suggestionsData, destinationsData] = await Promise.all([
          aiApi.getSuggestions().catch(() => null),
          searchApi.getDestinations().catch(() => null)
        ])
        
        if (suggestionsData?.featured_trips?.length) {
          setFeaturedTrips(suggestionsData.featured_trips)
        }
        
        if (destinationsData && Array.isArray(destinationsData) && destinationsData.length > 0) {
          setDestinations(destinationsData)
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const getDestinationImage = (city: string): string => {
    return destinationImages[city] || defaultCityImage
  }

  const handleDestinationClick = (city: string) => {
    navigate(`/city/${encodeURIComponent(city)}`)
  }

  const filteredTrips = selectedMode === 'all' 
    ? featuredTrips 
    : featuredTrips.filter(t => t.travel_mode === selectedMode)

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-pattern py-20 md:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 pattern-dots opacity-30" />
        
        {/* Floating orbs with animation */}
        <motion.div 
          variants={floatVariants}
          animate="animate"
          className="absolute top-20 left-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl"
        />
        <motion.div 
          variants={floatVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-maroon-700/20 rounded-full blur-3xl"
        />
        <motion.div 
          variants={pulseVariants}
          animate="animate"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-sky-500/10 to-transparent rounded-full"
        />
        
        {/* Floating particles */}
        <div className="particles">
          {particles.map((p) => (
            <FloatingParticle key={p.id} {...p} />
          ))}
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto px-4 relative z-10"
        >
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            {/* AI Badge with shimmer effect */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-sm text-muted-foreground">AI-Powered Travel Booking</span>
            </motion.div>
            
            {/* Animated heading */}
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <motion.span 
                className="text-foreground inline-block"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(56, 189, 248, 0)",
                    "0 0 40px rgba(56, 189, 248, 0.3)",
                    "0 0 20px rgba(56, 189, 248, 0)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Twende!
              </motion.span>
              <br />
              <span className="text-gradient animate-gradient bg-[length:200%_auto]">Let's Go Across East Africa</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
            >
              Book buses, flights, trains & ferries across Kenya, Uganda, Rwanda, Congo & Tanzania with our AI-powered platform.
            </motion.p>
            
            {/* Travel mode icons with staggered animation */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center gap-4 mb-4"
            >
              {travelModes.map((mode, i) => (
                <motion.div 
                  key={mode.mode} 
                  className="flex flex-col items-center gap-1" 
                  title={mode.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.2, y: -5 }}
                >
                  <motion.div 
                    className={`p-2 rounded-full ${mode.color} text-white`}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    {mode.icon}
                  </motion.div>
                  <span className="text-xs text-muted-foreground">{mode.name}</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Country flags with bounce animation */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center gap-3 text-2xl mb-8"
            >
              {countries.map((country, i) => (
                <motion.button 
                  key={country.name} 
                  title={country.name} 
                  className="cursor-pointer"
                  onClick={() => handleDestinationClick(country.cities[0])}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ 
                    scale: 1.3, 
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {country.flag}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <AISearchBar className="mb-8" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8 }} 
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">Or search traditionally</p>
            <SearchBar variant="hero" />
          </motion.div>
        </motion.div>
      </section>

      {/* Travel Modes Section */}
      <section className="py-12 bg-card/30 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-50"
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {travelModes.map((mode, index) => (
              <motion.div
                key={mode.mode}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 150 }}
              >
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={selectedMode === mode.mode ? "default" : "outline"}
                    className="flex items-center gap-2 px-6 py-3 relative overflow-hidden group"
                    onClick={() => navigate(`/search?mode=${mode.mode}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <motion.span 
                      className="text-lg"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                    >
                      {mode.emoji}
                    </motion.span>
                    <span>{mode.name}</span>
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="text-center mb-12"
          >
            <motion.h2 
              className="font-display text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose <span className="text-gradient">Twende</span>
            </motion.h2>
            <motion.p 
              className="text-muted-foreground max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Your gateway to seamless East African travel
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 40 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              >
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Card className="h-full hover:border-primary/50 transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6 relative">
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-maroon-700/20 flex items-center justify-center mb-4 text-primary"
                        whileHover={{ 
                          rotate: [0, -10, 10, 0],
                          scale: 1.1,
                          transition: { duration: 0.4 }
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Animated map dots background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                left: `${10 + (i % 10) * 10}%`,
                top: `${10 + Math.floor(i / 10) * 30}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Travel Across <span className="text-gradient">5 Countries</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Cross-border travel made simple</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {countries.map((country, index) => (
              <motion.div 
                key={country.name} 
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }} 
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    className="h-full hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-sky-500/20 cursor-pointer group relative overflow-hidden" 
                    onClick={() => handleDestinationClick(country.cities[0])}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <CardContent className="p-6 text-center relative">
                      <motion.div 
                        className="text-5xl mb-3"
                        animate={{ 
                          y: [0, -5, 0],
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: "easeInOut",
                          delay: index * 0.2 
                        }}
                        whileHover={{ 
                          scale: 1.3, 
                          rotate: [0, -5, 5, 0],
                          transition: { duration: 0.3 }
                        }}
                      >
                        {country.flag}
                      </motion.div>
                      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{country.name}</h3>
                      <p className="text-xs text-muted-foreground">{country.cities.join(', ')}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-20 bg-card/50 relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 0% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)",
              "radial-gradient(ellipse at 100% 100%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)",
              "radial-gradient(ellipse at 0% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Popular <span className="text-gradient">Destinations</span>
              </h2>
              <p className="text-muted-foreground">Explore East Africa's most traveled routes</p>
            </div>
            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={() => navigate('/search')} className="group relative overflow-hidden">
                <span className="relative z-10">View All Routes</span>
                <motion.div 
                  className="absolute inset-0 bg-primary/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
              </Button>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.slice(0, 12).map((city, index) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                onClick={() => handleDestinationClick(city)}
                className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer"
              >
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img 
                    src={getDestinationImage(city)} 
                    alt={`${city} - East Africa`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultCityImage;
                    }}
                  />
                </motion.div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Hover overlay with animated border */}
                <motion.div 
                  className="absolute inset-0 rounded-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ 
                    opacity: 1,
                    boxShadow: "inset 0 0 0 2px rgba(56, 189, 248, 0.5)"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-primary/20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                
                {/* City name */}
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 p-4"
                  initial={{ y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center gap-2 text-white">
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <MapPin className="h-4 w-4" />
                    </motion.div>
                    <span className="font-medium">{city}</span>
                  </div>
                </motion.div>
                
                {/* Arrow icon */}
                <motion.div 
                  className="absolute top-3 right-3"
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  whileHover={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="bg-white/90 rounded-full p-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trips Section - Multi-modal */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          >
            <div>
              <motion.h2 
                className="font-display text-3xl md:text-4xl font-bold mb-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                Featured <span className="text-gradient">Trips</span>
              </motion.h2>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Buses, flights, trains & ferries - all in one place
              </motion.p>
            </div>
            <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={() => navigate('/search')} className="group">
                View All Trips
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Travel mode filter with animations */}
          <motion.div 
            className="flex flex-wrap items-center gap-2 mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge 
                variant={selectedMode === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer px-4 py-2 text-sm transition-all duration-300"
                onClick={() => setSelectedMode('all')}
              >
                All
              </Badge>
            </motion.div>
            {travelModes.map((mode, i) => (
              <motion.div 
                key={mode.mode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant={selectedMode === mode.mode ? 'default' : 'outline'} 
                  className="cursor-pointer px-4 py-2 text-sm transition-all duration-300"
                  onClick={() => setSelectedMode(mode.mode)}
                >
                  <motion.span 
                    className="mr-1"
                    animate={selectedMode === mode.mode ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {mode.emoji}
                  </motion.span>
                  {mode.name}
                </Badge>
              </motion.div>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4 md:grid-cols-2"
              >
                {[1, 2, 3, 4].map((i) => (
                  <TripCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="trips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4 md:grid-cols-2"
              >
                {filteredTrips.slice(0, 6).map((trip, index) => (
                  <TripCard key={trip.id} trip={trip} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }} 
            whileInView={{ opacity: 1, y: 0, scale: 1 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-maroon-700 p-8 md:p-16 text-center"
          >
            {/* Animated background pattern */}
            <motion.div 
              className="absolute inset-0 pattern-dots opacity-20"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Floating orbs */}
            <motion.div 
              className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
              animate={{ 
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-10 right-10 w-40 h-40 bg-maroon-500/20 rounded-full blur-2xl"
              animate={{ 
                x: [0, -50, 0],
                y: [0, -30, 0],
                scale: [1.2, 1, 1.2]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            
            <div className="relative z-10">
              {/* Animated travel mode icons */}
              <div className="flex justify-center gap-4 mb-6">
                {travelModes.map((mode, i) => (
                  <motion.div 
                    key={mode.mode} 
                    className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ 
                      scale: 1.2, 
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.3 }
                    }}
                  >
                    <motion.span 
                      className="text-2xl block"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {mode.emoji}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
              
              <motion.h2 
                className="font-display text-3xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}>
                Ready to Explore East Africa?
              </motion.h2>
              
              <motion.p 
                className="text-white/80 text-lg max-w-xl mx-auto mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Book buses, flights, trains & ferries across Kenya, Uganda, Rwanda, Congo & Tanzania. Twende!
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="xl" 
                    className="bg-white text-sky-600 hover:bg-white/90 relative overflow-hidden group" 
                    onClick={() => navigate('/register')}>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-sky-100 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}/>
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="mr-2 h-5 w-5 relative z-10" />
                    </motion.span>
                    <span className="relative z-10">Get Started Free</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="xl" variant="glass" onClick={() => navigate('/search')}>
                    <Star className="mr-2 h-5 w-5" />Explore Trips
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
