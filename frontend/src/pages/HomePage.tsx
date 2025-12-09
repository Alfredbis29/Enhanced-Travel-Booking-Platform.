import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  { name: 'Rwanda', flag: '🇷🇼', cities: ['Kigali', 'Butare', 'Gisenyi'] },
  { name: 'Congo DRC', flag: '🇨🇩', cities: ['Goma', 'Bukavu', 'Kinshasa'] },
  { name: 'Tanzania', flag: '🇹🇿', cities: ['Dar es Salaam', 'Arusha'] },
]

// Real city images from Unsplash
const destinationImages: Record<string, string> = {
  'Nairobi': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400&h=400&fit=crop&q=80',
  'Mombasa': 'https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=400&h=400&fit=crop&q=80',
  'Kisumu': 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=400&h=400&fit=crop&q=80',
  'Nakuru': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=400&fit=crop&q=80',
  'Eldoret': 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&h=400&fit=crop&q=80',
  'Kampala': 'https://images.unsplash.com/photo-1597476817120-7a87ec431a92?w=400&h=400&fit=crop&q=80',
  'Jinja': 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&h=400&fit=crop&q=80',
  'Entebbe': 'https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=400&h=400&fit=crop&q=80',
  'Kigali': 'https://images.unsplash.com/photo-1580746738099-78d6833b3e86?w=400&h=400&fit=crop&q=80',
  'Butare': 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&h=400&fit=crop&q=80',
  'Gisenyi': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&q=80',
  'Goma': 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&h=400&fit=crop&q=80',
  'Bukavu': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=400&fit=crop&q=80',
  'Kinshasa': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&q=80',
  'Dar es Salaam': 'https://images.unsplash.com/photo-1568625502763-2a5ec6a94c47?w=400&h=400&fit=crop&q=80',
  'Arusha': 'https://images.unsplash.com/photo-1621414050345-53db43f7e7ab?w=400&h=400&fit=crop&q=80',
  'Malindi': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop&q=80',
  'Mwanza': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop&q=80',
}

const defaultCityImage = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&q=80'

const fallbackDestinations = ['Nairobi', 'Mombasa', 'Kampala', 'Kigali', 'Goma', 'Dar es Salaam', 'Kisumu', 'Arusha', 'Jinja', 'Eldoret', 'Nakuru', 'Entebbe']

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
  // More buses for cross-border
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
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>(fallbackTrips)
  const [destinations, setDestinations] = useState<string[]>(fallbackDestinations)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMode, setSelectedMode] = useState<TravelMode | 'all'>('all')

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
        } else if (destinationsData?.destinations?.length) {
          setDestinations(destinationsData.destinations)
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
    navigate(`/search?destination=${encodeURIComponent(city)}`)
  }

  const filteredTrips = selectedMode === 'all' 
    ? featuredTrips 
    : featuredTrips.filter(t => t.travel_mode === selectedMode)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-pattern py-20 md:py-32">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-maroon-700/20 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Travel Booking</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-foreground">Twende!</span><br />
              <span className="text-gradient">Let's Go Across East Africa</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Book buses, flights, trains & ferries across Kenya, Uganda, Rwanda, Congo & Tanzania with our AI-powered platform.
            </p>
            {/* Travel mode icons */}
            <div className="flex items-center justify-center gap-4 mb-4">
              {travelModes.map((mode) => (
                <div key={mode.mode} className="flex flex-col items-center gap-1" title={mode.name}>
                  <div className={`p-2 rounded-full ${mode.color} text-white`}>
                    {mode.icon}
                  </div>
                  <span className="text-xs text-muted-foreground">{mode.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 text-2xl mb-8">
              {countries.map((country) => (
                <button 
                  key={country.name} 
                  title={country.name} 
                  className="hover:scale-125 transition-transform cursor-pointer"
                  onClick={() => handleDestinationClick(country.cities[0])}
                >
                  {country.flag}
                </button>
              ))}
            </div>
          </motion.div>
          <AISearchBar className="mb-8" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Or search traditionally</p>
            <SearchBar variant="hero" />
          </motion.div>
        </div>
      </section>

      {/* Travel Modes Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {travelModes.map((mode, index) => (
              <motion.div
                key={mode.mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={selectedMode === mode.mode ? "default" : "outline"}
                  className="flex items-center gap-2 px-6 py-3"
                  onClick={() => navigate(`/search?mode=${mode.mode}`)}
                >
                  <span className="text-lg">{mode.emoji}</span>
                  <span>{mode.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-gradient">Twende</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Your gateway to seamless East African travel</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className="h-full hover:border-primary/50 transition-colors group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-maroon-700/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Travel Across <span className="text-gradient">5 Countries</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Cross-border travel made simple</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {countries.map((country, index) => (
              <motion.div 
                key={country.name} 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-sky-500/10 cursor-pointer group" 
                  onClick={() => handleDestinationClick(country.cities[0])}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{country.flag}</div>
                    <h3 className="font-display font-semibold text-lg mb-2">{country.name}</h3>
                    <p className="text-xs text-muted-foreground">{country.cities.join(', ')}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Popular <span className="text-gradient">Destinations</span></h2>
              <p className="text-muted-foreground">Explore East Africa's most traveled routes</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/search')} className="group">
              View All Routes
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.slice(0, 12).map((city, index) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleDestinationClick(city)}
                className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              >
                <img 
                  src={getDestinationImage(city)} 
                  alt={`${city} - East Africa`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{city}</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded-full p-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trips Section - Multi-modal */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Featured <span className="text-gradient">Trips</span></h2>
              <p className="text-muted-foreground">Buses, flights, trains & ferries - all in one place</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/search')} className="group">
              View All Trips
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          
          {/* Travel mode filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Badge 
              variant={selectedMode === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setSelectedMode('all')}
            >
              All
            </Badge>
            {travelModes.map((mode) => (
              <Badge 
                key={mode.mode}
                variant={selectedMode === mode.mode ? 'default' : 'outline'} 
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setSelectedMode(mode.mode)}
              >
                <span className="mr-1">{mode.emoji}</span>
                {mode.name}
              </Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTrips.slice(0, 6).map((trip, index) => (
                <TripCard key={trip.id} trip={trip} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-maroon-700 p-8 md:p-16 text-center">
            <div className="absolute inset-0 pattern-dots opacity-20" />
            <div className="relative z-10">
              <div className="flex justify-center gap-4 mb-6">
                {travelModes.map((mode) => (
                  <div key={mode.mode} className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <span className="text-2xl">{mode.emoji}</span>
                  </div>
                ))}
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Ready to Explore East Africa?</h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">Book buses, flights, trains & ferries across Kenya, Uganda, Rwanda, Congo & Tanzania. Twende!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" className="bg-white text-sky-600 hover:bg-white/90" onClick={() => navigate('/register')}>
                  <Sparkles className="mr-2 h-5 w-5" />Get Started Free
                </Button>
                <Button size="xl" variant="glass" onClick={() => navigate('/search')}>
                  <Star className="mr-2 h-5 w-5" />Explore Trips
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
