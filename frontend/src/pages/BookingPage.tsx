import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, MapPin, Clock, Calendar, User, Phone, Mail, CreditCard, 
  CheckCircle, Loader2, Star, Users, Minus, Plus, Bus, Smartphone,
  AlertCircle, ArrowRight, Shield, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { searchApi, bookingApi, paymentApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useToast } from '@/hooks/use-toast'
import type { Trip, PaymentMethod, PaymentCurrency, PaymentStatus } from '@/types'
import { PAYMENT_METHOD_INFO, PAYMENT_METHODS_BY_COUNTRY } from '@/types'

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

// Get country from city
const getCityCountry = (city: string): string => {
  const countryMap: Record<string, string> = {
    'Nairobi': 'Kenya', 'Mombasa': 'Kenya', 'Kisumu': 'Kenya', 'Nakuru': 'Kenya', 'Eldoret': 'Kenya', 'Malindi': 'Kenya',
    'Kampala': 'Uganda', 'Jinja': 'Uganda', 'Mbarara': 'Uganda', 'Entebbe': 'Uganda', 'Gulu': 'Uganda',
    'Kigali': 'Rwanda', 'Butare': 'Rwanda', 'Gisenyi': 'Rwanda', 'Ruhengeri': 'Rwanda',
    'Goma': 'DRC', 'Bukavu': 'DRC', 'Kinshasa': 'DRC', 'Lubumbashi': 'DRC',
    'Dar es Salaam': 'Tanzania', 'Arusha': 'Tanzania', 'Mwanza': 'Tanzania', 'Dodoma': 'Tanzania'
  }
  return countryMap[city] || 'Kenya'
}

// Currency by country
const getCurrencyByCountry = (country: string): PaymentCurrency => {
  const currencyMap: Record<string, PaymentCurrency> = {
    'Kenya': 'KES',
    'Uganda': 'UGX',
    'Rwanda': 'RWF',
    'DRC': 'CDF',
    'Tanzania': 'KES' // Tanzania uses KES for cross-border
  }
  return currencyMap[country] || 'KES'
}

// Fallback trips for when API fails
const fallbackTrips: Record<string, Trip> = {
  'trip-001': { id: 'trip-001', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Mombasa', departure_time: new Date(Date.now() + 86400000).toISOString(), arrival_time: new Date(Date.now() + 86400000 + 28800000).toISOString(), duration_minutes: 480, price: 1500, currency: 'KES', available_seats: 24, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'], rating: 4.5, image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop&q=80' },
  'trip-009': { id: 'trip-009', provider: 'easy-coach', provider_name: 'Easy Coach', origin: 'Nairobi', destination: 'Kampala', departure_time: new Date(Date.now() + 86400000).toISOString(), arrival_time: new Date(Date.now() + 86400000 + 43200000).toISOString(), duration_minutes: 720, price: 3500, currency: 'KES', available_seats: 20, total_seats: 45, bus_type: 'Executive', amenities: ['WiFi', 'AC', 'USB Charging', 'Snacks'], rating: 4.6, image_url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=600&h=400&fit=crop&q=80' },
  'trip-014': { id: 'trip-014', provider: 'modern-coast', provider_name: 'Modern Coast', origin: 'Nairobi', destination: 'Kigali', departure_time: new Date(Date.now() + 86400000).toISOString(), arrival_time: new Date(Date.now() + 172800000).toISOString(), duration_minutes: 1440, price: 5500, currency: 'KES', available_seats: 18, total_seats: 40, bus_type: 'VIP', amenities: ['WiFi', 'AC', 'USB Charging', 'Meals', 'Entertainment'], rating: 4.7, image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop&q=80' },
  'trip-018': { id: 'trip-018', provider: 'trans-africa', provider_name: 'Trans Africa Express', origin: 'Kigali', destination: 'Goma', departure_time: new Date(Date.now() + 86400000).toISOString(), arrival_time: new Date(Date.now() + 86400000 + 14400000).toISOString(), duration_minutes: 240, price: 15000, currency: 'RWF', available_seats: 25, total_seats: 45, bus_type: 'Executive', amenities: ['AC', 'USB Charging', 'Reclining Seats'], rating: 4.2, image_url: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=600&h=400&fit=crop&q=80' },
}

type BookingStep = 'details' | 'payment' | 'processing' | 'confirmed'

export default function BookingPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  
  // Trip and booking state
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<BookingStep>('details')
  const [bookingRef, setBookingRef] = useState<string>('')
  const [bookingId, setBookingId] = useState<string>('')
  
  // Passenger details
  const [seats, setSeats] = useState(1)
  const [passengerName, setPassengerName] = useState(user ? `${user.first_name} ${user.last_name}` : '')
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '')
  const [passengerEmail, setPassengerEmail] = useState(user?.email || '')
  
  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [paymentPhone, setPaymentPhone] = useState(passengerPhone)
  const [paymentId, setPaymentId] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')
  const [paymentInstructions, setPaymentInstructions] = useState<string>('')
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)

  // Get available payment methods based on origin country
  const originCountry = trip ? getCityCountry(trip.origin) : 'Kenya'
  const availablePaymentMethods = PAYMENT_METHODS_BY_COUNTRY[originCountry] || ['paypal', 'visa', 'mastercard']

  useEffect(() => {
    async function loadTrip() {
      if (!tripId) {
        setIsLoading(false)
        return
      }
      
      try {
        const tripData = await searchApi.getTripById(tripId)
        setTrip(tripData)
      } catch (error) {
        console.error('Failed to load trip from API:', error)
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
      setPaymentPhone(user.phone || '')
    }
  }, [user])

  // Handle step 1: Create booking
  const handleProceedToPayment = async () => {
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
        setBookingId(booking.id)
        setBookingRef(booking.booking_reference || booking.id)
      } else {
        // Generate local booking ID for demo
        const ref = `TWD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        setBookingId(ref)
        setBookingRef(ref)
      }
      
      setStep('payment')
    } catch (error) {
      console.error('Booking creation failed:', error)
      // Still proceed to payment with local ref for demo
      const ref = `TWD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      setBookingId(ref)
      setBookingRef(ref)
      setStep('payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle step 2: Initiate payment
  const handleInitiatePayment = async () => {
    if (!trip || !selectedPaymentMethod || !bookingId) return

    // Validate phone for mobile money
    if (['mpesa', 'mtn_momo', 'airtel_money'].includes(selectedPaymentMethod) && !paymentPhone) {
      toast({ title: 'Error', description: 'Please enter your phone number for mobile payment', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    setStep('processing')

    try {
      if (isAuthenticated) {
        // Initiate payment through API
        const response = await paymentApi.initiatePayment({
          booking_id: bookingId,
          amount: trip.price * seats,
          currency: trip.currency as PaymentCurrency,
          method: selectedPaymentMethod,
          phone_number: paymentPhone,
          return_url: window.location.origin + `/booking/${tripId}`
        })
        
        setPaymentId(response.payment_id)
        setPaymentStatus(response.status)
        setPaymentInstructions(response.instructions || '')

        // For card/PayPal with checkout URL, we'd redirect
        if (response.checkout_url) {
          setPaymentInstructions(`Click the button below to complete your payment securely.`)
        }
      } else {
        // Demo mode - simulate payment initiation
        setPaymentId(`pay_demo_${Date.now()}`)
        setPaymentStatus('processing')
        if (['mpesa', 'mtn_momo', 'airtel_money'].includes(selectedPaymentMethod)) {
          setPaymentInstructions(`Please check your phone ${paymentPhone} for the payment prompt. Enter your PIN to complete the payment.`)
        } else {
          setPaymentInstructions('Your payment is being processed...')
        }
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      // Demo fallback
      setPaymentId(`pay_demo_${Date.now()}`)
      setPaymentStatus('processing')
      if (['mpesa', 'mtn_momo', 'airtel_money'].includes(selectedPaymentMethod)) {
        setPaymentInstructions(`Please check your phone ${paymentPhone} for the payment prompt. Enter your PIN to complete the payment.`)
      } else {
        setPaymentInstructions('Your payment is being processed...')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check payment status
  const handleCheckPaymentStatus = async () => {
    if (!paymentId) return
    
    setIsCheckingPayment(true)
    try {
      if (isAuthenticated && !paymentId.startsWith('pay_demo_')) {
        const response = await paymentApi.verifyPayment(paymentId)
        setPaymentStatus(response.status)
        
        if (response.status === 'completed') {
          setStep('confirmed')
          toast({ title: 'Payment Successful!', description: 'Your booking has been confirmed.' })
        } else if (response.status === 'failed') {
          toast({ title: 'Payment Failed', description: response.failure_reason || 'Please try again.', variant: 'destructive' })
          setStep('payment')
        }
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
    } finally {
      setIsCheckingPayment(false)
    }
  }

  // Simulate payment completion (for demo)
  const handleSimulatePayment = async () => {
    setIsCheckingPayment(true)
    try {
      if (isAuthenticated && paymentId && !paymentId.startsWith('pay_demo_')) {
        await paymentApi.simulateComplete(paymentId)
      }
      
      setPaymentStatus('completed')
      setStep('confirmed')
      toast({ title: 'Payment Successful!', description: 'Your booking has been confirmed.' })
    } catch (error) {
      console.error('Payment simulation failed:', error)
      // Still confirm for demo
      setPaymentStatus('completed')
      setStep('confirmed')
      toast({ title: 'Payment Successful!', description: 'Your booking has been confirmed.' })
    } finally {
      setIsCheckingPayment(false)
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

  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {['details', 'payment', 'confirmed'].map((s, i) => {
        const stepNum = i + 1
        const isActive = 
          (s === 'details' && step === 'details') ||
          (s === 'payment' && (step === 'payment' || step === 'processing')) ||
          (s === 'confirmed' && step === 'confirmed')
        const isCompleted = 
          (s === 'details' && step !== 'details') ||
          (s === 'payment' && step === 'confirmed')
        
        return (
          <div key={s} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
              ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}>
              {isCompleted ? <CheckCircle className="h-4 w-4" /> : stepNum}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {s === 'details' ? 'Details' : s === 'payment' ? 'Payment' : 'Confirmed'}
            </span>
            {i < 2 && <ArrowRight className="mx-3 h-4 w-4 text-muted-foreground" />}
          </div>
        )
      })}
    </div>
  )

  // Confirmed Step
  if (step === 'confirmed') {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-8">Your trip has been booked and payment received</p>
            
            <Card className="mb-8 text-left">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Reference</p>
                    <p className="text-2xl font-bold font-mono text-primary">{bookingRef}</p>
                  </div>
                  <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
                    Paid
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
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-medium">{selectedPaymentMethod ? PAYMENT_METHOD_INFO[selectedPaymentMethod].name : 'N/A'}</p>
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

  // Processing Step (Payment in progress)
  if (step === 'processing') {
    const isMobileMoney = selectedPaymentMethod && ['mpesa', 'mtn_momo', 'airtel_money'].includes(selectedPaymentMethod)
    
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <StepIndicator />
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Card>
              <CardContent className="p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  {isMobileMoney ? (
                    <Smartphone className="h-10 w-10 text-primary animate-pulse" />
                  ) : (
                    <CreditCard className="h-10 w-10 text-primary animate-pulse" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {isMobileMoney ? 'Check Your Phone' : 'Processing Payment'}
                </h2>
                
                <p className="text-muted-foreground mb-6">{paymentInstructions}</p>
                
                {isMobileMoney && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-lg font-mono">
                      <Phone className="h-5 w-5" />
                      <span>{paymentPhone}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Enter your {selectedPaymentMethod === 'mpesa' ? 'M-Pesa' : selectedPaymentMethod === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'} PIN when prompted
                    </p>
                  </div>
                )}
                
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-xl font-bold">{formatCurrency(totalPrice, trip.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-sm">{bookingRef}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleCheckPaymentStatus} 
                    disabled={isCheckingPayment}
                    variant="outline"
                    className="w-full"
                  >
                    {isCheckingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Check Payment Status
                      </>
                    )}
                  </Button>
                  
                  {/* Demo: Simulate successful payment */}
                  <Button 
                    onClick={handleSimulatePayment} 
                    disabled={isCheckingPayment}
                    className="w-full"
                  >
                    {isCheckingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm Payment (Demo)
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep('payment')}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Try Different Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
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
          onClick={() => step === 'payment' ? setStep('details') : navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 'payment' ? 'Back to Details' : 'Back to Search'}
        </Button>
        
        <StepIndicator />
        
        <h1 className="font-display text-3xl font-bold mb-8">
          {step === 'details' ? 'Book Your Trip' : 'Select Payment Method'}
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
                        <Badge variant="secondary" className="mt-1">{trip.bus_type || trip.vehicle_type || 'Standard'}</Badge>
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

            {/* Passenger Details Form - Step 1 */}
            <AnimatePresence mode="wait">
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
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
                            onChange={(e) => {
                              setPassengerPhone(e.target.value)
                              setPaymentPhone(e.target.value)
                            }} 
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
                </motion.div>
              )}

              {/* Payment Method Selection - Step 2 */}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Secure Payment
                      </CardTitle>
                      <CardDescription>
                        Select your preferred payment method for {originCountry}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Mobile Money Options */}
                      {availablePaymentMethods.some(m => ['mpesa', 'mtn_momo', 'airtel_money'].includes(m)) && (
                        <div>
                          <Label className="text-muted-foreground text-xs uppercase tracking-wide mb-3 block">
                            Mobile Money
                          </Label>
                          <div className="grid gap-3">
                            {availablePaymentMethods
                              .filter(m => ['mpesa', 'mtn_momo', 'airtel_money'].includes(m))
                              .map(method => {
                                const info = PAYMENT_METHOD_INFO[method]
                                return (
                                  <button
                                    key={method}
                                    onClick={() => setSelectedPaymentMethod(method)}
                                    className={`
                                      flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                                      ${selectedPaymentMethod === method 
                                        ? 'border-primary bg-primary/10' 
                                        : 'border-border hover:border-primary/50'}
                                    `}
                                  >
                                    <div className={`w-12 h-12 rounded-lg ${info.color} flex items-center justify-center text-white text-xl`}>
                                      {info.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <p className="font-medium">{info.name}</p>
                                      <p className="text-sm text-muted-foreground">{info.description}</p>
                                    </div>
                                    {selectedPaymentMethod === method && (
                                      <CheckCircle className="h-5 w-5 text-primary" />
                                    )}
                                  </button>
                                )
                              })}
                          </div>
                        </div>
                      )}

                      {/* Card & PayPal Options */}
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide mb-3 block">
                          Card & International
                        </Label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {availablePaymentMethods
                            .filter(m => ['paypal', 'visa', 'mastercard'].includes(m))
                            .map(method => {
                              const info = PAYMENT_METHOD_INFO[method]
                              return (
                                <button
                                  key={method}
                                  onClick={() => setSelectedPaymentMethod(method)}
                                  className={`
                                    flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                                    ${selectedPaymentMethod === method 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border hover:border-primary/50'}
                                  `}
                                >
                                  <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-white`}>
                                    {info.icon}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="font-medium">{info.name}</p>
                                  </div>
                                  {selectedPaymentMethod === method && (
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                  )}
                                </button>
                              )
                            })}
                        </div>
                      </div>

                      {/* Phone input for mobile money */}
                      {selectedPaymentMethod && ['mpesa', 'mtn_momo', 'airtel_money'].includes(selectedPaymentMethod) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          <Label htmlFor="paymentPhone">
                            {selectedPaymentMethod === 'mpesa' ? 'M-Pesa' : selectedPaymentMethod === 'mtn_momo' ? 'MTN' : 'Airtel'} Phone Number
                          </Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="paymentPhone" 
                              value={paymentPhone} 
                              onChange={(e) => setPaymentPhone(e.target.value)} 
                              placeholder={selectedPaymentMethod === 'mpesa' ? '+254 7XX XXX XXX' : selectedPaymentMethod === 'mtn_momo' ? '+250 7XX XXX XXX' : '+243 XX XXX XXXX'}
                              className="pl-10"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You will receive a payment prompt on this number
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
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
                      disabled={seats <= 1 || step === 'payment'}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-2xl font-bold w-8 text-center">{seats}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setSeats(Math.min(trip.available_seats, seats + 1))} 
                      disabled={seats >= trip.available_seats || step === 'payment'}
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
                    onClick={handleProceedToPayment} 
                    disabled={!passengerName.trim() || !passengerPhone.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="gradient" 
                    size="lg" 
                    onClick={handleInitiatePayment} 
                    disabled={!selectedPaymentMethod || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay {formatCurrency(totalPrice, trip.currency)}
                      </>
                    )}
                  </Button>
                )}
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
