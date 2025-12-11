import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Users, Wifi, Zap, Wind, Headphones, ArrowRight, Bus, Plane, Train, Ship, Car, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Trip, TravelMode } from '@/types'

interface TripCardProps { 
  trip: Trip
  index?: number 
}

// Animation variants for staggered children
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }),
  hover: {
    y: -8,
    transition: { duration: 0.3, type: "spring", stiffness: 300 }
  }
}

const imageVariants = {
  hover: {
    scale: 1.1,
    transition: { duration: 0.5 }
  }
}

const priceVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
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
  const [isHovered, setIsHovered] = useState(false)

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
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className="group overflow-hidden transition-all duration-300 cursor-pointer relative"
        onClick={handleCardClick}
        style={{
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(56, 189, 248, 0.15), 0 0 0 1px rgba(56, 189, 248, 0.2)' 
            : '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Animated border glow on hover */}
        <motion.div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          style={{
            background: 'linear-gradient(45deg, rgba(56, 189, 248, 0.1), rgba(139, 92, 246, 0.1), rgba(56, 189, 248, 0.1))',
            backgroundSize: '200% 200%',
          }}
          transition={{ duration: 0.3 }}
        />
        
        <CardContent className="p-0 relative">
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden bg-secondary">
              <AnimatePresence>
                {!imageLoaded && (
                  <motion.div 
                    className="absolute inset-0 bg-secondary flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {modeConfig.icon}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.img 
                src={getImageUrl()} 
                alt={`${trip.provider_name} - ${trip.origin} to ${trip.destination}`}
                className={cn(
                  "w-full h-full object-cover",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                variants={imageVariants}
                animate={isHovered ? "hover" : "initial"}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true)
                  setImageLoaded(true)
                }}
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Travel Mode Badge with animation */}
              <motion.div 
                className={cn("absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-sm", modeConfig.bgColor)}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <motion.span 
                  className={modeConfig.color}
                  animate={isHovered ? { rotate: [0, 15, -15, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {modeConfig.icon}
                </motion.span>
                <span className="text-xs font-medium text-white capitalize">{travelMode}</span>
              </motion.div>
              
              {/* Vehicle Type Badge */}
              <motion.div 
                className="absolute bottom-3 left-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white border-0">
                  {getTypeDisplay()}
                </Badge>
              </motion.div>
              
              {trip.rating && (
                <motion.div 
                  className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                  <span className="text-xs font-medium text-white">{trip.rating}</span>
                </motion.div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <motion.h3 
                      className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {trip.provider_name}
                    </motion.h3>
                    <p className="text-sm text-muted-foreground">{formatDate(trip.departure_time)}</p>
                  </div>
                  <motion.div 
                    className="text-right"
                    variants={priceVariants}
                    initial="initial"
                    animate={isHovered ? "pulse" : "initial"}
                  >
                    <p className="text-2xl font-bold text-primary">{formatCurrency(trip.price, trip.currency)}</p>
                    <p className="text-xs text-muted-foreground">per {travelMode === 'flight' ? 'passenger' : 'seat'}</p>
                  </motion.div>
                </div>

                {/* Animated Route */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={isHovered ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-sm font-medium">{trip.origin}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">{formatTime(trip.departure_time)}</p>
                  </div>
                  
                  {/* Animated route line */}
                  <div className="flex flex-col items-center px-4">
                    <div className="flex items-center text-muted-foreground mb-1 relative">
                      <motion.div 
                        className="w-8 h-[2px] bg-gradient-to-r from-primary/50 to-primary"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                      />
                      <motion.span 
                        className={cn("mx-2", modeConfig.color)}
                        animate={isHovered ? { 
                          x: [0, 5, 0],
                          transition: { duration: 1, repeat: Infinity }
                        } : {}}
                      >
                        {modeConfig.icon}
                      </motion.span>
                      <motion.div 
                        className="w-8 h-[2px] bg-gradient-to-r from-primary to-accent/50"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: index * 0.1 + 0.7, duration: 0.5 }}
                      />
                      
                      {/* Animated dot traveling along the route */}
                      {isHovered && (
                        <motion.div
                          className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                          initial={{ left: 0, opacity: 0 }}
                          animate={{ 
                            left: ["0%", "100%"],
                            opacity: [0, 1, 1, 0]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </div>
                    {trip.duration_minutes && (
                      <motion.span 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.8 }}
                      >
                        {formatDuration(trip.duration_minutes)}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-sm font-medium">{trip.destination}</span>
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-accent"
                        animate={isHovered ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                      />
                    </div>
                    {trip.arrival_time && (
                      <p className="text-xs text-muted-foreground mr-4">{formatTime(trip.arrival_time)}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <motion.div 
                  className="flex items-center justify-between mt-auto pt-4 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Animated Amenities */}
                    <div className="flex items-center gap-1">
                      {trip.amenities?.slice(0, 4).map((amenity, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors" 
                          title={amenity}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.7 + i * 0.05 }}
                          whileHover={{ scale: 1.2 }}
                        >
                          {amenityIcons[amenity] || <span className="text-[10px]">{amenity[0]}</span>}
                        </motion.div>
                      ))}
                      {trip.amenities && trip.amenities.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{trip.amenities.length - 4}</span>
                      )}
                    </div>
                    {/* Seats with animation */}
                    <motion.div 
                      className="flex items-center gap-1 text-muted-foreground"
                      animate={trip.available_seats < 10 ? { 
                        color: ['hsl(var(--muted-foreground))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))']
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{trip.available_seats} seats left</span>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="gradient" 
                      onClick={handleBookClick}
                      className="group/btn relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <Sparkles className="mr-2 h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      <span>Book Now</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
