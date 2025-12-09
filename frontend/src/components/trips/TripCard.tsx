import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Users, Wifi, Zap, Wind, Headphones, ArrowRight, Bus, Plane, Train, Ship, Car } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Trip, TravelMode } from '@/types'

interface TripCardProps { 
  trip: Trip
  index?: number 
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-3 w-3" />,
  'AC': <Wind className="h-3 w-3" />,
  'USB Charging': <Zap className="h-3 w-3" />,
  'Entertainment': <Headphones className="h-3 w-3" />,
}

// Travel mode icons and colors
const TRAVEL_MODE_CONFIG: Record<TravelMode, { icon: React.ReactNode; emoji: string; color: string; bgColor: string }> = {
  bus: { icon: <Bus className="h-4 w-4" />, emoji: '🚌', color: 'text-sky-400', bgColor: 'bg-sky-500/20' },
  flight: { icon: <Plane className="h-4 w-4" />, emoji: '✈️', color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
  train: { icon: <Train className="h-4 w-4" />, emoji: '🚂', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  ferry: { icon: <Ship className="h-4 w-4" />, emoji: '⛴️', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  shuttle: { icon: <Car className="h-4 w-4" />, emoji: '🚐', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
}

// Real images by travel mode
const TRAVEL_IMAGES: Record<TravelMode, string[]> = {
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
}

// Format helpers
const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    KES: 'Ksh',
    UGX: 'USh',
    RWF: 'FRw',
    USD: '$',
    CDF: 'FC',
    TZS: 'TSh'
  }
  return `${symbols[currency] || currency} ${amount.toLocaleString()}`
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export default function TripCard({ trip, index = 0 }: TripCardProps) {
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const travelMode = (trip.travel_mode || 'bus') as TravelMode
  const modeConfig = TRAVEL_MODE_CONFIG[travelMode]

  const getImageUrl = (): string => {
    if (trip.image_url && !imageError) {
      return trip.image_url
    }
    // Use consistent image based on trip id and travel mode
    const images = TRAVEL_IMAGES[travelMode]
    const hash = trip.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return images[hash % images.length]
  }

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/booking/${trip.id}`)
  }

  const handleCardClick = () => {
    navigate(`/booking/${trip.id}`)
  }

  // Get the vehicle/class type display
  const getTypeDisplay = () => {
    return trip.bus_type || trip.vehicle_type || (travelMode === 'flight' ? 'Economy' : 'Standard')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card 
        className="group overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:border-primary/20 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden bg-secondary">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center">
                  {modeConfig.icon}
                </div>
              )}
              <img 
                src={getImageUrl()} 
                alt={`${trip.provider_name} - ${trip.origin} to ${trip.destination}`}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true)
                  setImageLoaded(true)
                }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Travel Mode Badge */}
              <div className={cn("absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-sm", modeConfig.bgColor)}>
                <span className={modeConfig.color}>{modeConfig.icon}</span>
                <span className="text-xs font-medium text-white capitalize">{travelMode}</span>
              </div>
              
              {/* Vehicle Type Badge */}
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white border-0">
                  {getTypeDisplay()}
                </Badge>
              </div>
              
              {trip.rating && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-white">{trip.rating}</span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {trip.provider_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{formatDate(trip.departure_time)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(trip.price, trip.currency)}</p>
                    <p className="text-xs text-muted-foreground">per {travelMode === 'flight' ? 'passenger' : 'seat'}</p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{trip.origin}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">{formatTime(trip.departure_time)}</p>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <div className="flex items-center text-muted-foreground mb-1">
                      <div className="w-8 h-[1px] bg-border" />
                      <span className={cn("mx-2", modeConfig.color)}>{modeConfig.icon}</span>
                      <div className="w-8 h-[1px] bg-border" />
                    </div>
                    {trip.duration_minutes && (
                      <span className="text-xs text-muted-foreground">{formatDuration(trip.duration_minutes)}</span>
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-sm font-medium">{trip.destination}</span>
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    {trip.arrival_time && (
                      <p className="text-xs text-muted-foreground mr-4">{formatTime(trip.arrival_time)}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    {/* Amenities */}
                    <div className="flex items-center gap-1">
                      {trip.amenities?.slice(0, 4).map((amenity, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-muted-foreground" 
                          title={amenity}
                        >
                          {amenityIcons[amenity] || <span className="text-[10px]">{amenity[0]}</span>}
                        </div>
                      ))}
                      {trip.amenities && trip.amenities.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{trip.amenities.length - 4}</span>
                      )}
                    </div>
                    {/* Seats */}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{trip.available_seats} {travelMode === 'flight' ? 'seats' : 'seats'} left</span>
                    </div>
                  </div>
                  <Button 
                    variant="gradient" 
                    onClick={handleBookClick}
                    className="group/btn"
                  >
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
