import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Shield, Clock, CreditCard, ArrowRight, MapPin, Star, Bus, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AISearchBar from '@/components/search/AISearchBar'
import SearchBar from '@/components/search/SearchBar'
import TripCard from '@/components/trips/TripCard'
import { TripCardSkeleton } from '@/components/ui/skeleton'
import { searchApi, aiApi } from '@/lib/api'
import type { Trip } from '@/types'

const features = [
  { icon: <Sparkles className="h-6 w-6" />, title: 'AI-Powered Search', description: 'Natural language queries to find your perfect trip' },
  { icon: <Globe className="h-6 w-6" />, title: 'East Africa Coverage', description: 'Kenya, Uganda, Rwanda, Congo & Tanzania routes' },
  { icon: <Shield className="h-6 w-6" />, title: 'Secure Booking', description: 'Safe and encrypted payment processing' },
  { icon: <CreditCard className="h-6 w-6" />, title: 'Multiple Currencies', description: 'Pay in KES, UGX, RWF, USD or local currency' }
]

const countries = [
  { name: 'Kenya', flag: '🇰🇪', cities: ['Nairobi', 'Mombasa', 'Kisumu'] },
  { name: 'Uganda', flag: '🇺🇬', cities: ['Kampala', 'Jinja', 'Entebbe'] },
  { name: 'Rwanda', flag: '🇷🇼', cities: ['Kigali', 'Butare', 'Gisenyi'] },
  { name: 'Congo DRC', flag: '🇨🇩', cities: ['Goma', 'Bukavu', 'Kinshasa'] },
  { name: 'Tanzania', flag: '🇹🇿', cities: ['Dar es Salaam', 'Arusha'] },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>([])
  const [destinations, setDestinations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [suggestionsData, destinationsData] = await Promise.all([aiApi.getSuggestions(), searchApi.getDestinations()])
        setFeaturedTrips(suggestionsData.featured_trips)
        setDestinations(destinationsData)
      } catch (error) { console.error('Failed to load homepage data:', error) } 
      finally { setIsLoading(false) }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-hero-pattern py-20 md:py-32">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-maroon-700/20 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm text-muted-foreground">AI-Powered Travel Booking</span></div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6"><span className="text-foreground">Twende!</span><br /><span className="text-gradient">Let's Go Across East Africa</span></h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">Book buses across Kenya, Uganda, Rwanda, Congo & Tanzania with our AI-powered platform.</p>
            <div className="flex items-center justify-center gap-3 text-2xl mb-8">
              {countries.map((country) => (
                <span key={country.name} title={country.name}>{country.flag}</span>
              ))}
            </div>
          </motion.div>
          <AISearchBar className="mb-8" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center"><p className="text-sm text-muted-foreground mb-4">Or search traditionally</p><SearchBar variant="hero" /></motion.div>
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-gradient">Twende</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Your gateway to seamless East African travel</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (<motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}><Card className="h-full hover:border-primary/50 transition-colors group"><CardContent className="p-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-maroon-700/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">{feature.icon}</div><h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3><p className="text-sm text-muted-foreground">{feature.description}</p></CardContent></Card></motion.div>))}
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
                className="group"
              >
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-sky-500/10 cursor-pointer" onClick={() => navigate(`/search?destination=${country.cities[0]}`)}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{country.flag}</div>
                    <h3 className="font-display font-semibold text-lg mb-2">{country.name}</h3>
                    <p className="text-xs text-muted-foreground">{country.cities.join(', ')}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div><h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Popular <span className="text-gradient">Destinations</span></h2><p className="text-muted-foreground">Explore East Africa's most traveled routes</p></div>
            <Button variant="outline" onClick={() => navigate('/search')}>View All Routes<ArrowRight className="ml-2 h-4 w-4" /></Button>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.slice(0, 12).map((city, index) => (<motion.button key={city} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} onClick={() => navigate(`/search?destination=${city}`)} className="group relative overflow-hidden rounded-xl aspect-square"><img src={`https://source.unsplash.com/400x400/?${city},africa,city`} alt={city} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-4"><div className="flex items-center gap-2 text-white"><MapPin className="h-4 w-4" /><span className="font-medium">{city}</span></div></div></motion.button>))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12"><h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Featured <span className="text-gradient">Trips</span></h2><p className="text-muted-foreground">Top-rated journeys handpicked for you</p></motion.div>
          {isLoading ? (<div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((i) => (<TripCardSkeleton key={i} />))}</div>) : (<div className="grid gap-4 md:grid-cols-2">{featuredTrips.slice(0, 4).map((trip, index) => (<TripCard key={trip.id} trip={trip} index={index} />))}</div>)}
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-maroon-700 p-8 md:p-16 text-center">
            <div className="absolute inset-0 pattern-dots opacity-20" />
            <div className="relative z-10">
              <div className="flex justify-center mb-6"><div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm"><Bus className="h-8 w-8 text-white" /></div></div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">Ready to Explore East Africa?</h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">Join thousands of travelers exploring Kenya, Uganda, Rwanda, Congo & Tanzania. Twende!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" className="bg-white text-sky-600 hover:bg-white/90" onClick={() => navigate('/register')}><Sparkles className="mr-2 h-5 w-5" />Get Started Free</Button>
                <Button size="xl" variant="glass" onClick={() => navigate('/search')}><Star className="mr-2 h-5 w-5" />Explore Trips</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
