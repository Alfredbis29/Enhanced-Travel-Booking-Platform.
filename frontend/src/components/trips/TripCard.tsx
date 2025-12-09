import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, MapPin, Star, Users, Wifi, Zap, Wind, Headphones, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatTime, formatDuration, formatDate } from '@/lib/utils'
import type { Trip } from '@/types'

interface TripCardProps { trip: Trip; index?: number }

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-3 w-3" />,
  'AC': <Wind className="h-3 w-3" />,
  'USB Charging': <Zap className="h-3 w-3" />,
  'Entertainment': <Headphones className="h-3 w-3" />,
}

export default function TripCard({ trip, index = 0 }: TripCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
      <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:border-primary/20">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
              <img src={trip.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'} alt={trip.provider_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3"><Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white border-0">{trip.bus_type || 'Standard'}</Badge></div>
              {trip.rating && (<div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-xs font-medium text-white">{trip.rating}</span></div>)}
            </div>
            <div className="flex-1 p-5">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div><h3 className="font-display font-semibold text-lg mb-1">{trip.provider_name}</h3><p className="text-sm text-muted-foreground">{formatDate(trip.departure_time)}</p></div>
                  <div className="text-right"><p className="text-2xl font-bold text-primary">{formatCurrency(trip.price, trip.currency)}</p><p className="text-xs text-muted-foreground">per seat</p></div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1"><div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-sm font-medium">{trip.origin}</span></div><p className="text-xs text-muted-foreground ml-4">{formatTime(trip.departure_time)}</p></div>
                  <div className="flex flex-col items-center px-4"><div className="flex items-center text-muted-foreground mb-1"><div className="w-12 h-[1px] bg-border" /><ArrowRight className="h-4 w-4 mx-2" /><div className="w-12 h-[1px] bg-border" /></div>{trip.duration_minutes && (<span className="text-xs text-muted-foreground">{formatDuration(trip.duration_minutes)}</span>)}</div>
                  <div className="flex-1 text-right"><div className="flex items-center justify-end gap-2 mb-1"><span className="text-sm font-medium">{trip.destination}</span><div className="w-2 h-2 rounded-full bg-accent" /></div>{trip.arrival_time && (<p className="text-xs text-muted-foreground mr-4">{formatTime(trip.arrival_time)}</p>)}</div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">{trip.amenities?.slice(0, 4).map((amenity, i) => (<div key={i} className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-muted-foreground" title={amenity}>{amenityIcons[amenity] || <span className="text-[10px]">{amenity[0]}</span>}</div>))}{trip.amenities && trip.amenities.length > 4 && (<span className="text-xs text-muted-foreground">+{trip.amenities.length - 4}</span>)}</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" /><span className="text-sm">{trip.available_seats} seats left</span></div>
                  </div>
                  <Button variant="gradient" onClick={() => navigate(`/booking/${trip.id}`)} className="group/btn">Book Now<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" /></Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

