import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, Hotel, Utensils, Building2, Car, Calendar, 
  Star, Clock, Phone, Globe, ArrowLeft, ExternalLink,
  Landmark, Camera, Music, ShoppingBag, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// City data with attractions, hotels, restaurants, hospitals, taxis, and events
const cityData: Record<string, CityInfo> = {
  'Nairobi': {
    name: 'Nairobi',
    country: 'Kenya',
    flag: '🇰🇪',
    description: 'The vibrant capital of Kenya, known as the "Green City in the Sun". A bustling metropolis that serves as East Africa\'s commercial hub.',
    image: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1200&h=600&fit=crop&q=80',
    attractions: [
      { name: 'Nairobi National Park', type: 'Wildlife', rating: 4.8, image: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=400&h=300&fit=crop&q=80', description: 'The only national park within a capital city' },
      { name: 'Giraffe Centre', type: 'Wildlife', rating: 4.7, image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=400&h=300&fit=crop&q=80', description: 'Get up close with endangered Rothschild giraffes' },
      { name: 'Karen Blixen Museum', type: 'Museum', rating: 4.5, image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&h=300&fit=crop&q=80', description: 'Historic home of the "Out of Africa" author' },
      { name: 'Nairobi National Museum', type: 'Museum', rating: 4.4, image: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=400&h=300&fit=crop&q=80', description: 'Kenya\'s cultural heritage and natural history' },
    ],
    hotels: [
      { name: 'Villa Rosa Kempinski', rating: 5, price: 'KES 35,000/night', phone: '+254 703 049 000', website: 'kempinski.com' },
      { name: 'Sarova Stanley', rating: 5, price: 'KES 25,000/night', phone: '+254 20 275 7000', website: 'sarovahotels.com' },
      { name: 'Radisson Blu', rating: 4, price: 'KES 18,000/night', phone: '+254 20 422 6000', website: 'radissonhotels.com' },
      { name: 'Ibis Styles', rating: 3, price: 'KES 8,000/night', phone: '+254 20 420 0000', website: 'ibis.com' },
    ],
    restaurants: [
      { name: 'Carnivore Restaurant', cuisine: 'Grill/BBQ', rating: 4.6, priceRange: '$$$$', specialty: 'Famous for game meat nyama choma' },
      { name: 'Talisman', cuisine: 'International', rating: 4.7, priceRange: '$$$', specialty: 'Garden dining experience' },
      { name: 'Mama Oliech', cuisine: 'Kenyan', rating: 4.5, priceRange: '$$', specialty: 'Best fish and ugali in town' },
      { name: 'Java House', cuisine: 'Cafe', rating: 4.3, priceRange: '$$', specialty: 'Coffee and casual dining' },
    ],
    hospitals: [
      { name: 'Nairobi Hospital', type: 'General', emergency: '+254 20 284 5000', address: 'Argwings Kodhek Road' },
      { name: 'Aga Khan University Hospital', type: 'General', emergency: '+254 20 366 2000', address: '3rd Parklands Avenue' },
      { name: 'Kenyatta National Hospital', type: 'Public', emergency: '+254 20 272 6300', address: 'Hospital Road' },
    ],
    taxiServices: [
      { name: 'Uber', description: 'Most popular ride-hailing app', appLink: 'uber.com', avgPrice: 'KES 500-2000' },
      { name: 'Bolt', description: 'Affordable ride-hailing service', appLink: 'bolt.eu', avgPrice: 'KES 400-1800' },
      { name: 'Little Cab', description: 'Local Kenyan ride-hailing app', appLink: 'littlecab.co.ke', avgPrice: 'KES 450-1900' },
      { name: 'Wasili', description: 'Premium taxi service', appLink: 'wasili.co.ke', avgPrice: 'KES 600-2500' },
    ],
    events: [
      { name: 'Nairobi Restaurant Week', date: 'Jan 20-26, 2026', type: 'Food & Dining', description: 'Experience top restaurants at special prices' },
      { name: 'Safari Rally', date: 'Mar 15-18, 2026', type: 'Sports', description: 'World Rally Championship event' },
      { name: 'Koroga Festival', date: 'Feb 8, 2026', type: 'Music', description: 'Popular outdoor music and food festival' },
      { name: 'Nairobi Fashion Week', date: 'Apr 5-7, 2026', type: 'Fashion', description: 'Showcasing African fashion designers' },
    ],
  },
  'Mombasa': {
    name: 'Mombasa',
    country: 'Kenya',
    flag: '🇰🇪',
    description: 'Kenya\'s coastal paradise, known for beautiful beaches, rich Swahili culture, and historic Old Town.',
    image: 'https://images.unsplash.com/photo-1596005554384-d293674c91d7?w=1200&h=600&fit=crop&q=80',
    attractions: [
      { name: 'Fort Jesus', type: 'Historic', rating: 4.6, image: 'https://images.unsplash.com/photo-1590062111236-a74b06e8e6e3?w=400&h=300&fit=crop&q=80', description: 'UNESCO World Heritage Site, 16th-century Portuguese fort' },
      { name: 'Diani Beach', type: 'Beach', rating: 4.9, image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=400&h=300&fit=crop&q=80', description: 'Award-winning white sand beach' },
      { name: 'Old Town Mombasa', type: 'Cultural', rating: 4.5, image: 'https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=400&h=300&fit=crop&q=80', description: 'Historic Swahili architecture and markets' },
      { name: 'Haller Park', type: 'Nature', rating: 4.4, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop&q=80', description: 'Wildlife sanctuary with giraffes and hippos' },
    ],
    hotels: [
      { name: 'Serena Beach Resort', rating: 5, price: 'KES 28,000/night', phone: '+254 41 548 5721', website: 'serenahotels.com' },
      { name: 'Sarova Whitesands', rating: 5, price: 'KES 22,000/night', phone: '+254 41 548 5900', website: 'sarovahotels.com' },
      { name: 'PrideInn Paradise', rating: 4, price: 'KES 12,000/night', phone: '+254 41 471 5000', website: 'prideinn.co.ke' },
      { name: 'Voyager Beach Resort', rating: 4, price: 'KES 15,000/night', phone: '+254 41 471 2000', website: 'heritage-eastafrica.com' },
    ],
    restaurants: [
      { name: 'Tamarind Restaurant', cuisine: 'Seafood', rating: 4.8, priceRange: '$$$$', specialty: 'Fresh seafood with ocean views' },
      { name: 'Moorings', cuisine: 'International', rating: 4.5, priceRange: '$$$', specialty: 'Floating restaurant experience' },
      { name: 'Shehnai', cuisine: 'Indian', rating: 4.4, priceRange: '$$', specialty: 'Authentic Indian coastal cuisine' },
      { name: 'Forodhani', cuisine: 'Swahili', rating: 4.3, priceRange: '$$', specialty: 'Traditional Swahili dishes' },
    ],
    hospitals: [
      { name: 'Aga Khan Hospital Mombasa', type: 'General', emergency: '+254 41 222 7710', address: 'Vanga Road' },
      { name: 'Coast General Hospital', type: 'Public', emergency: '+254 41 231 4201', address: 'Moi Avenue' },
      { name: 'Pandya Memorial Hospital', type: 'Private', emergency: '+254 41 231 4660', address: 'Dedan Kimathi Avenue' },
    ],
    taxiServices: [
      { name: 'Uber', description: 'Available in Mombasa', appLink: 'uber.com', avgPrice: 'KES 400-1500' },
      { name: 'Bolt', description: 'Affordable rides', appLink: 'bolt.eu', avgPrice: 'KES 350-1400' },
      { name: 'Mombasa Taxis', description: 'Local taxi service', appLink: 'Call +254 722 XXX XXX', avgPrice: 'KES 500-2000' },
    ],
    events: [
      { name: 'Mombasa Carnival', date: 'Nov 15-17, 2026', type: 'Cultural', description: 'Annual street carnival celebrating coastal culture' },
      { name: 'Diani Beach Festival', date: 'Dec 20-22, 2025', type: 'Music', description: 'Beach music festival' },
      { name: 'Lamu Cultural Festival', date: 'Aug 10-12, 2026', type: 'Cultural', description: 'Celebration of Swahili heritage' },
    ],
  },
  'Kampala': {
    name: 'Kampala',
    country: 'Uganda',
    flag: '🇺🇬',
    description: 'The bustling capital of Uganda, built on seven hills and known for its vibrant nightlife and rich history.',
    image: 'https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=1200&h=600&fit=crop&q=80',
    attractions: [
      { name: 'Kasubi Tombs', type: 'Historic', rating: 4.5, image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&h=300&fit=crop&q=80', description: 'UNESCO World Heritage burial grounds of Buganda kings' },
      { name: 'Uganda National Museum', type: 'Museum', rating: 4.3, image: 'https://images.unsplash.com/photo-1575223970966-76ae61ee7838?w=400&h=300&fit=crop&q=80', description: 'Uganda\'s cultural and natural heritage' },
      { name: 'Namugongo Martyrs Shrine', type: 'Religious', rating: 4.6, image: 'https://images.unsplash.com/photo-1545296664-39db56ad95bd?w=400&h=300&fit=crop&q=80', description: 'Important pilgrimage site' },
      { name: 'Owino Market', type: 'Market', rating: 4.2, image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop&q=80', description: 'East Africa\'s largest open-air market' },
    ],
    hotels: [
      { name: 'Sheraton Kampala Hotel', rating: 5, price: 'UGX 600,000/night', phone: '+256 417 420 000', website: 'marriott.com' },
      { name: 'Kampala Serena Hotel', rating: 5, price: 'UGX 550,000/night', phone: '+256 417 309 000', website: 'serenahotels.com' },
      { name: 'Protea Hotel', rating: 4, price: 'UGX 350,000/night', phone: '+256 312 400 400', website: 'marriott.com' },
      { name: 'Hotel & City Botique', rating: 3, price: 'UGX 150,000/night', phone: '+256 414 250 468', website: 'hotelcitybotique.com' },
    ],
    restaurants: [
      { name: 'The Lawns', cuisine: 'International', rating: 4.6, priceRange: '$$$$', specialty: 'Fine dining with garden setting' },
      { name: 'Khana Khazana', cuisine: 'Indian', rating: 4.5, priceRange: '$$$', specialty: 'Best Indian food in Kampala' },
      { name: 'Cafe Javas', cuisine: 'Cafe', rating: 4.4, priceRange: '$$', specialty: 'Popular cafe chain' },
      { name: 'Fang Fang', cuisine: 'Chinese', rating: 4.3, priceRange: '$$$', specialty: 'Authentic Chinese cuisine' },
    ],
    hospitals: [
      { name: 'Mulago National Hospital', type: 'Public', emergency: '+256 414 554 001', address: 'Upper Mulago Hill Road' },
      { name: 'International Hospital Kampala', type: 'Private', emergency: '+256 312 200 400', address: 'St. Barnabas Road' },
      { name: 'Nsambya Hospital', type: 'Private', emergency: '+256 414 267 011', address: 'Nsambya Hill' },
    ],
    taxiServices: [
      { name: 'SafeBoda', description: 'Most popular boda-boda app', appLink: 'safeboda.com', avgPrice: 'UGX 5,000-20,000' },
      { name: 'Uber', description: 'Available in Kampala', appLink: 'uber.com', avgPrice: 'UGX 15,000-50,000' },
      { name: 'Bolt', description: 'Affordable rides', appLink: 'bolt.eu', avgPrice: 'UGX 12,000-45,000' },
      { name: 'Taxify', description: 'Local ride service', appLink: 'bolt.eu', avgPrice: 'UGX 10,000-40,000' },
    ],
    events: [
      { name: 'Nyege Nyege Festival', date: 'Sep 5-8, 2026', type: 'Music', description: 'Africa\'s biggest electronic music festival' },
      { name: 'Rolex Festival', date: 'Aug 20, 2026', type: 'Food', description: 'Celebrating Uganda\'s famous street food' },
      { name: 'Kampala City Festival', date: 'Oct 3-5, 2026', type: 'Cultural', description: 'Annual celebration of Kampala' },
    ],
  },
  'Kigali': {
    name: 'Kigali',
    country: 'Rwanda',
    flag: '🇷🇼',
    description: 'Africa\'s cleanest city, known for its stunning hills, memorial sites, and remarkable transformation.',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&h=600&fit=crop&q=80',
    attractions: [
      { name: 'Kigali Genocide Memorial', type: 'Memorial', rating: 4.9, image: 'https://images.unsplash.com/photo-1580745294605-1265987cf598?w=400&h=300&fit=crop&q=80', description: 'Moving tribute to the 1994 genocide victims' },
      { name: 'Inema Arts Center', type: 'Art', rating: 4.6, image: 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=400&h=300&fit=crop&q=80', description: 'Contemporary Rwandan art gallery' },
      { name: 'Kimironko Market', type: 'Market', rating: 4.4, image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&q=80', description: 'Largest local market for crafts and produce' },
      { name: 'Nyamirambo', type: 'Cultural', rating: 4.3, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&q=80', description: 'Vibrant Muslim quarter with great nightlife' },
    ],
    hotels: [
      { name: 'Kigali Marriott Hotel', rating: 5, price: 'RWF 350,000/night', phone: '+250 252 252 252', website: 'marriott.com' },
      { name: 'Radisson Blu Hotel', rating: 5, price: 'RWF 280,000/night', phone: '+250 252 252 252', website: 'radissonhotels.com' },
      { name: 'Hotel des Mille Collines', rating: 4, price: 'RWF 180,000/night', phone: '+250 252 576 530', website: 'millecollines.rw' },
      { name: 'Urban by CityBlue', rating: 4, price: 'RWF 120,000/night', phone: '+250 788 383 000', website: 'cityblue.com' },
    ],
    restaurants: [
      { name: 'Republika Lounge', cuisine: 'International', rating: 4.7, priceRange: '$$$$', specialty: 'Rooftop dining with city views' },
      { name: 'Heaven Restaurant', cuisine: 'International', rating: 4.6, priceRange: '$$$', specialty: 'Beautiful garden setting' },
      { name: 'Brachetto', cuisine: 'Italian', rating: 4.5, priceRange: '$$$', specialty: 'Authentic Italian cuisine' },
      { name: 'New Cactus', cuisine: 'Rwandan', rating: 4.3, priceRange: '$$', specialty: 'Traditional Rwandan buffet' },
    ],
    hospitals: [
      { name: 'King Faisal Hospital', type: 'Private', emergency: '+250 252 588 888', address: 'KG 544 St' },
      { name: 'Rwanda Military Hospital', type: 'Public', emergency: '+250 252 575 967', address: 'KK 737 St' },
      { name: 'CHUK Hospital', type: 'Public', emergency: '+250 252 575 555', address: 'University Avenue' },
    ],
    taxiServices: [
      { name: 'Yego Moto', description: 'Most popular moto taxi app', appLink: 'yegomoto.com', avgPrice: 'RWF 1,000-5,000' },
      { name: 'Move', description: 'Rwanda\'s ride-hailing app', appLink: 'move.rw', avgPrice: 'RWF 3,000-15,000' },
      { name: 'Uber', description: 'Available in Kigali', appLink: 'uber.com', avgPrice: 'RWF 5,000-20,000' },
    ],
    events: [
      { name: 'Kigali Up', date: 'Jul 15-17, 2026', type: 'Music', description: 'Annual music and arts festival' },
      { name: 'Rwanda Film Festival', date: 'Mar 10-15, 2026', type: 'Film', description: 'Celebrating African cinema' },
      { name: 'Kwita Izina', date: 'Sep 4, 2026', type: 'Cultural', description: 'Gorilla naming ceremony' },
    ],
  },
  'Dar es Salaam': {
    name: 'Dar es Salaam',
    country: 'Tanzania',
    flag: '🇹🇿',
    description: 'Tanzania\'s largest city and commercial hub, a vibrant port city with beautiful beaches and rich culture.',
    image: 'https://images.unsplash.com/photo-1568625502763-2a5ec6a94c47?w=1200&h=600&fit=crop&q=80',
    attractions: [
      { name: 'National Museum', type: 'Museum', rating: 4.4, image: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=400&h=300&fit=crop&q=80', description: 'Tanzania\'s history and archaeology' },
      { name: 'Coco Beach', type: 'Beach', rating: 4.3, image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=300&fit=crop&q=80', description: 'Popular beach for locals and tourists' },
      { name: 'Village Museum', type: 'Cultural', rating: 4.2, image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&h=300&fit=crop&q=80', description: 'Traditional Tanzanian village life' },
      { name: 'Kariakoo Market', type: 'Market', rating: 4.1, image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&h=300&fit=crop&q=80', description: 'Bustling local market' },
    ],
    hotels: [
      { name: 'Hyatt Regency', rating: 5, price: 'TZS 450,000/night', phone: '+255 22 211 1234', website: 'hyatt.com' },
      { name: 'Serena Hotel', rating: 5, price: 'TZS 380,000/night', phone: '+255 22 211 2416', website: 'serenahotels.com' },
      { name: 'Southern Sun', rating: 4, price: 'TZS 250,000/night', phone: '+255 22 213 7575', website: 'tsogosun.com' },
      { name: 'Slipway Hotel', rating: 4, price: 'TZS 180,000/night', phone: '+255 22 260 0893', website: 'slipway.co.tz' },
    ],
    restaurants: [
      { name: 'Cape Town Fish Market', cuisine: 'Seafood', rating: 4.6, priceRange: '$$$$', specialty: 'Fresh seafood and sushi' },
      { name: 'Addis in Dar', cuisine: 'Ethiopian', rating: 4.5, priceRange: '$$$', specialty: 'Authentic Ethiopian cuisine' },
      { name: 'Mamboz Corner BBQ', cuisine: 'BBQ', rating: 4.4, priceRange: '$$', specialty: 'Best nyama choma in the city' },
      { name: 'Akemi', cuisine: 'Japanese', rating: 4.3, priceRange: '$$$', specialty: 'Japanese cuisine with views' },
    ],
    hospitals: [
      { name: 'Aga Khan Hospital', type: 'Private', emergency: '+255 22 211 5151', address: 'Ocean Road' },
      { name: 'Muhimbili National Hospital', type: 'Public', emergency: '+255 22 215 0596', address: 'United Nations Road' },
      { name: 'Regency Medical Centre', type: 'Private', emergency: '+255 22 215 0100', address: 'Ali Hassan Mwinyi Road' },
    ],
    taxiServices: [
      { name: 'Uber', description: 'Available in Dar', appLink: 'uber.com', avgPrice: 'TZS 8,000-30,000' },
      { name: 'Bolt', description: 'Popular ride-hailing', appLink: 'bolt.eu', avgPrice: 'TZS 6,000-25,000' },
      { name: 'Little Cab', description: 'Local ride service', appLink: 'littlecab.co.ke', avgPrice: 'TZS 7,000-28,000' },
    ],
    events: [
      { name: 'Sauti za Busara', date: 'Feb 13-16, 2026', type: 'Music', description: 'East Africa\'s biggest music festival' },
      { name: 'Dar es Salaam Food Festival', date: 'May 20-22, 2026', type: 'Food', description: 'Celebrating Tanzanian cuisine' },
      { name: 'Karibu Travel Fair', date: 'Jun 5-7, 2026', type: 'Tourism', description: 'East Africa\'s leading travel expo' },
    ],
  },
}

// Default city data for cities not in the database
const defaultCityData: CityInfo = {
  name: 'City',
  country: 'East Africa',
  flag: '🌍',
  description: 'Discover the beauty and culture of this East African destination.',
  image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=600&fit=crop&q=80',
  attractions: [
    { name: 'Local Attractions', type: 'Various', rating: 4.0, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', description: 'Explore local points of interest' },
  ],
  hotels: [
    { name: 'Local Hotels', rating: 4, price: 'Varies', phone: 'Contact locally', website: 'booking.com' },
  ],
  restaurants: [
    { name: 'Local Restaurants', cuisine: 'Local', rating: 4.0, priceRange: '$$', specialty: 'Local cuisine' },
  ],
  hospitals: [
    { name: 'Local Hospital', type: 'General', emergency: 'Emergency services available', address: 'City center' },
  ],
  taxiServices: [
    { name: 'Uber/Bolt', description: 'Check availability', appLink: 'uber.com', avgPrice: 'Varies by location' },
  ],
  events: [],
}

interface CityInfo {
  name: string
  country: string
  flag: string
  description: string
  image: string
  attractions: Array<{ name: string; type: string; rating: number; image: string; description: string }>
  hotels: Array<{ name: string; rating: number; price: string; phone: string; website: string }>
  restaurants: Array<{ name: string; cuisine: string; rating: number; priceRange: string; specialty: string }>
  hospitals: Array<{ name: string; type: string; emergency: string; address: string }>
  taxiServices: Array<{ name: string; description: string; appLink: string; avgPrice: string }>
  events: Array<{ name: string; date: string; type: string; description: string }>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function CityDetailsPage() {
  const { cityName } = useParams<{ cityName: string }>()
  const navigate = useNavigate()
  const [city, setCity] = useState<CityInfo | null>(null)

  useEffect(() => {
    if (cityName) {
      const decodedName = decodeURIComponent(cityName)
      const cityInfo = cityData[decodedName] || { ...defaultCityData, name: decodedName }
      setCity(cityInfo)
    }
  }, [cityName])

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'music': return <Music className="h-4 w-4" />
      case 'food': case 'food & dining': return <Utensils className="h-4 w-4" />
      case 'cultural': return <Landmark className="h-4 w-4" />
      case 'sports': return <Heart className="h-4 w-4" />
      case 'fashion': return <ShoppingBag className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={city.image} 
            alt={city.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Button 
                variant="ghost" 
                className="mb-4 text-white hover:bg-white/20"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{city.flag}</span>
                <Badge variant="secondary" className="text-sm">
                  {city.country}
                </Badge>
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-3">
                {city.name}
              </h1>
              
              <p className="text-white/80 text-lg max-w-2xl">
                {city.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="attractions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
            <TabsTrigger value="attractions" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Attractions</span>
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              <span className="hidden sm:inline">Hotels</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Hospitals</span>
            </TabsTrigger>
            <TabsTrigger value="taxi" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Taxi</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
          </TabsList>

          {/* Attractions Tab */}
          <TabsContent value="attractions">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {city.attractions.map((attraction, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={attraction.image} 
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3">{attraction.type}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display font-semibold text-lg">{attraction.name}</h3>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{attraction.rating}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{attraction.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {city.hotels.map((hotel, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display font-semibold text-lg">{hotel.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(hotel.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
                            ))}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm font-semibold">
                          {hotel.price}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{hotel.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <a href={`https://${hotel.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {hotel.website}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {city.restaurants.map((restaurant, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display font-semibold text-lg">{restaurant.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{restaurant.cuisine}</Badge>
                            <span className="text-muted-foreground">{restaurant.priceRange}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{restaurant.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{restaurant.specialty}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {city.hospitals.map((hospital, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-5 w-5 text-red-500" />
                        <h3 className="font-display font-semibold">{hospital.name}</h3>
                      </div>
                      <Badge variant="secondary" className="mb-3">{hospital.type}</Badge>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-red-600 font-medium">
                          <Phone className="h-4 w-4" />
                          <span>Emergency: {hospital.emergency}</span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span>{hospital.address}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Taxi Tab */}
          <TabsContent value="taxi">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    How to Book a Taxi in {city.name}
                  </CardTitle>
                  <CardDescription>
                    Download these apps to easily book rides around the city
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {city.taxiServices.map((taxi, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="hover:shadow-lg transition-shadow hover:border-primary/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                              <Car className="h-5 w-5 text-primary" />
                              {taxi.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{taxi.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Average Price</p>
                            <p className="font-semibold text-primary">{taxi.avgPrice}</p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <a href={`https://${taxi.appLink}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Get App
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {city.events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {city.events.map((event, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                              {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-display font-semibold text-lg">{event.name}</h3>
                              <div className="flex items-center gap-2 mt-1 mb-2">
                                <Badge variant="outline">{event.type}</Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {event.date}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground">Check back later for events in {city.name}</p>
                </Card>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Book Trip CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-2xl font-bold mb-2">
                Ready to visit {city.name}?
              </h3>
              <p className="text-muted-foreground mb-6">
                Book your trip now and explore everything this amazing city has to offer!
              </p>
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => navigate(`/search?destination=${encodeURIComponent(city.name)}`)}
              >
                Find Trips to {city.name}
                <MapPin className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}

