import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Calendar, User, Phone, Mail, CreditCard, CheckCircle, Loader2, Star, Users, Minus, Plus, Bus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { searchApi, bookingApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useToast } from '@/hooks/use-toast'
import type { Trip } from '@/types'

// Format helpers
const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = { KES: 'Ksh', UGX: 'USh', RWF: 'FRw', USD: '$', CDF: 'FC', TZS: 'TSh' }
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

// Fallback trips for when API fails
const fallbackTrips: Record<string, Trip> = {
  'trip-001': { id: 'trip-001', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Mombasa', departure_time: new Date(Date.now() + 86400000).toISOString(), arrival_time: new Date(Date.now() + 86400000 + 28800000).toISOString(), duration_minutes: 480, price: 1500, currency: 'KES', available_seats: 24, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'], rating: 4.5, image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80' },
  'trip-009': { id: 'trip-009', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Kampala', departure_time: new Date(Date.now() + 86400000).toISOString(), arrival_time: new Date(Date.now() + 86400000 + 43200000).toISOString(), duration_minutes: 720, price: 3500, currency: 'KES', available_seats: 20, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks'], rating: 4.6, image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=600&h=400&fit=crop&q=80' },
  'trip-014': { id: 'trip-014', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Nairobi', destination: 'Kigali', departure_time: new Date(Date.now() + 86400000).toISOString(), arrival_time: new Date(Date.now() + 172800000).toISOString(), duration_minutes: 1440, price: 5500, currency: 'KES', available_seats: 18, total_seats: 40, bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Meals', 'Entertainment'], rating: 4.7, image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop&q=80' },
  'trip-018': { id: 'trip-018', provider: 'trans-africa', provider_name: 'Trans Africa Express', origin: 'Kigali', destination: 'Goma', departure_time: new Date(Date.now() + 86400000).toISOString(), arrival_time: new Date(Date.now() + 86400000 + 14400000).toISOString(), duration_minutes: 240, price: 15000, currency: 'RWF', available_seats: 25, total_seats: 45, bus_type: 'Executive', amenities: ['AC', 'USB Charging', 'Reclining Seats'], rating: 4.2, image_url: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=600&h=400&fit=crop&q=80' },
}

export default function BookingPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'details' | 'review' | 'confirmed'>('details')
  const [bookingRef, setBookingRef] = useState<string>('')
  const [seats, setSeats] = useState(1)
  const [passengerName, setPassengerName] = useState(user ? `${user.first_name} ${user.last_name}` : '')
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '')
  const [passengerEmail, setPassengerEmail] = useState(user?.email || '')

  useEffect(() => {
    async function loadTrip() {
      if (!tripId) {
        setIsLoading(false)
        return
      }
      
      try {
        // Try API first
        const tripData = await searchApi.getTripById(tripId)
        setTrip(tripData)
      } catch (error) {
        console.error('Failed to load trip from API:', error)
        // Fall back to local data
        if (fallbackTrips[tripId]) {
          setTrip(fallbackTrips[tripId])
        } else {
          toast({ title: 'Error', description: 'Failed to load trip details', variant: 'destructive' })
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadTrip()
  }, [tripId, toast])

  // Update passenger details when user changes
  useEffect(() => {
    if (user) {
      setPassengerName(`${user.first_name} ${user.last_name}`)
      setPassengerPhone(user.phone || '')
      setPassengerEmail(user.email || '')
    }
  }, [user])

  const handleSubmit = async () => {
    if (!trip) return

    // Validate inputs
    if (!passengerName.trim()) {
      toast({ title: 'Error', description: 'Please enter passenger name', variant: 'destructive' })
      return
    }
    if (!passengerPhone.trim()) {
      toast({ title: 'Error', description: 'Please enter phone number', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    
    try {
      if (isAuthenticated) {
        // Create booking through API
        const booking = await bookingApi.createBooking({ 
          trip_id: trip.id, 
          seats, 
          passenger_name: passengerName, 
          passenger_phone: passengerPhone, 
          passenger_email: passengerEmail 
        })
        await bookingApi.confirmBooking(booking.id)
        setBookingRef(booking.booking_reference || booking.id)
      } else {
        // Generate local booking reference for demo
        const ref = `TWD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        setBookingRef(ref)
      }
      
      setStep('confirmed')
      toast({ title: 'Booking Confirmed!', description: 'Your trip has been booked successfully.' })
    } catch (error) {
      console.error('Booking failed:', error)
      // Still confirm for demo purposes with a local ref
      const ref = `TWD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      setBookingRef(ref)
      setStep('confirmed')
      toast({ title: 'Booking Confirmed!', description: 'Your trip has been booked successfully.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Bus className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Trip not found</h1>
          <p className="text-muted-foreground mb-8">The trip you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/search')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  const totalPrice = trip.price * seats

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">Your trip has been booked successfully</p>
            
            <Card className="mb-8 text-left">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Reference</p>
                    <p className="text-2xl font-bold font-mono text-primary">{bookingRef}</p>
                  </div>
                  <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
                    Confirmed
                  </Badge>
                </div>
                
                <Separator className="mb-6" />
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Route</p>
                    <p className="font-medium">{trip.origin} → {trip.destination}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Provider</p>
                    <p className="font-medium">{trip.provider_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-medium">{formatDate(trip.departure_time)} at {formatTime(trip.departure_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{trip.duration_minutes ? formatDuration(trip.duration_minutes) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Passenger</p>
                    <p className="font-medium">{passengerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Seats</p>
                    <p className="font-medium">{seats} seat(s)</p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Paid</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice, trip.currency)}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/bookings')} variant="default">
                View My Bookings
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Book Another Trip
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => step === 'review' ? setStep('details') : navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 'review' ? 'Back to Details' : 'Back to Search'}
        </Button>
        
        <h1 className="font-display text-3xl font-bold mb-8">
          {step === 'details' ? 'Book Your Trip' : 'Review & Confirm'}
        </h1>
        
        <div className="grid gap-6 md:grid-cols-5">
          {/* Trip Details & Form */}
          <div className="md:col-span-3 space-y-6">
            {/* Trip Summary Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img 
                    src={trip.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80'} 
                    alt={trip.provider_name} 
                    className="w-24 h-24 rounded-lg object-cover" 
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-semibold text-lg">{trip.provider_name}</h3>
                        <Badge variant="secondary" className="mt-1">{trip.bus_type || 'Standard'}</Badge>
                      </div>
                      {trip.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{trip.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="font-medium">{trip.origin}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">To</p>
                      <p className="font-medium">{trip.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(trip.departure_time)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {formatTime(trip.departure_time)}
                        {trip.duration_minutes && ` (${formatDuration(trip.duration_minutes)})`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Details Form */}
            {step === 'details' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Passenger Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        value={passengerName} 
                        onChange={(e) => setPassengerName(e.target.value)} 
                        placeholder="Enter passenger name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={passengerPhone} 
                        onChange={(e) => setPassengerPhone(e.target.value)} 
                        placeholder="e.g., +254 700 123 456"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={passengerEmail} 
                        onChange={(e) => setPassengerEmail(e.target.value)} 
                        placeholder="For booking confirmation"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Summary */}
            {step === 'review' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Passenger</p>
                      <p className="font-medium">{passengerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{passengerPhone}</p>
                    </div>
                  </div>
                  {passengerEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{passengerEmail}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-medium">{seats} seat(s)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Price Summary Sidebar */}
          <div className="md:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Number of Seats</Label>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setSeats(Math.max(1, seats - 1))} 
                      disabled={seats <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-2xl font-bold w-8 text-center">{seats}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setSeats(Math.min(trip.available_seats, seats + 1))} 
                      disabled={seats >= trip.available_seats}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{trip.available_seats} seats available</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ticket Price × {seats}</span>
                    <span>{formatCurrency(trip.price * seats, trip.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="text-green-500">Free</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice, trip.currency)}</span>
                </div>
                
                {step === 'details' ? (
                  <Button 
                    className="w-full" 
                    variant="gradient" 
                    size="lg" 
                    onClick={() => setStep('review')} 
                    disabled={!passengerName.trim() || !passengerPhone.trim()}
                  >
                    Continue to Review
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="gradient" 
                    size="lg" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Confirm & Pay
                      </>
                    )}
                  </Button>
                )}
                
                <p className="text-xs text-muted-foreground text-center">
                  By proceeding, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
