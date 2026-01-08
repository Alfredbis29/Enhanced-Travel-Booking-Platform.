import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket, Calendar, MapPin, Clock, ChevronRight, Filter, Loader2, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { bookingApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

const statusConfig: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'secondary' }
}

export default function BookingsListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { loadBookings() }, [statusFilter])

  async function loadBookings() {
    setIsLoading(true)
    try { const response = await bookingApi.getBookings({ status: statusFilter !== 'all' ? statusFilter : undefined, limit: 50 }); setBookings(response.bookings) } 
    catch (error) { console.error('Failed to load bookings:', error); toast({ title: 'Error', description: 'Failed to load bookings', variant: 'destructive' }) } 
    finally { setIsLoading(false) }
  }

  async function handleCancelBooking() {
    if (!selectedBooking) return
    setIsCancelling(true)
    try { await bookingApi.cancelBooking(selectedBooking.id); toast({ title: 'Booking Cancelled', description: 'Your booking has been cancelled successfully.', variant: 'success' }); loadBookings() } 
    catch (error) { console.error('Failed to cancel booking:', error); toast({ title: 'Error', description: 'Failed to cancel booking', variant: 'destructive' }) } 
    finally { setIsCancelling(false); setCancelDialogOpen(false); setSelectedBooking(null) }
  }

  const openCancelDialog = (booking: Booking) => { setSelectedBooking(booking); setCancelDialogOpen(true) }

  async function handleDeleteBooking() {
    if (!selectedBooking) return
    setIsDeleting(true)
    try { 
      await bookingApi.deleteBooking(selectedBooking.id)
      toast({ title: 'Booking Deleted', description: 'Your booking has been permanently deleted.', variant: 'success' })
      loadBookings() 
    } 
    catch (error: unknown) { 
      console.error('Failed to delete booking:', error)
      const errorMessage = error instanceof Error && 'response' in error 
        ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete booking')
        : 'Failed to delete booking'
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' }) 
    } 
    finally { setIsDeleting(false); setDeleteDialogOpen(false); setSelectedBooking(null) }
  }

  const openDeleteDialog = (booking: Booking) => { setSelectedBooking(booking); setDeleteDialogOpen(true) }

  return (
    <div className="min-h-screen py-8"><div className="container mx-auto px-4 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div><h1 className="font-display text-3xl font-bold mb-2">My <span className="text-gradient">Bookings</span></h1><p className="text-muted-foreground">View and manage your travel bookings</p></div>
        <div className="flex items-center gap-3"><Filter className="h-4 w-4 text-muted-foreground" /><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue placeholder="All bookings" /></SelectTrigger><SelectContent><SelectItem value="all">All Bookings</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
      </div>

      {isLoading ? (<div className="space-y-4">{[1, 2, 3].map((i) => (<Card key={i}><CardContent className="p-6"><div className="flex gap-4"><Skeleton className="h-16 w-16 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/4" /></div></div></CardContent></Card>))}</div>) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="overflow-hidden hover:border-primary/20 transition-colors"><CardContent className="p-0"><div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4"><div><p className="text-sm text-muted-foreground mb-1">Booking Reference</p><p className="font-mono font-bold text-lg">{booking.booking_reference}</p></div><Badge variant={statusConfig[booking.status].variant}>{statusConfig[booking.status].label}</Badge></div>
                  <div className="flex items-center gap-4 mb-4"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span className="font-medium">{booking.origin}</span></div><ChevronRight className="h-4 w-4 text-muted-foreground" /><div className="flex items-center gap-2"><span className="font-medium">{booking.destination}</span><div className="w-2 h-2 rounded-full bg-accent" /></div></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"><div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>{formatDate(booking.departure_time)}</span></div><div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /><span>{formatTime(booking.departure_time)}</span></div><div className="flex items-center gap-2 text-muted-foreground"><Ticket className="h-4 w-4" /><span>{booking.seats} seat(s)</span></div><div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /><span>{booking.trip_provider}</span></div></div>
                </div>
                <div className="md:w-48 p-6 bg-secondary/30 flex flex-col justify-between"><div><p className="text-sm text-muted-foreground">Total Price</p><p className="text-2xl font-bold text-primary">{formatCurrency(booking.price, booking.currency)}</p></div><div className="flex flex-col gap-2 mt-4">{(booking.status === 'pending' || booking.status === 'confirmed') && (<Button variant="outline" size="sm" onClick={() => openCancelDialog(booking)}><X className="h-4 w-4 mr-1" />Cancel</Button>)}{(booking.status === 'cancelled' || booking.status === 'completed') && (<Button variant="destructive" size="sm" onClick={() => openDeleteDialog(booking)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>)}</div></div>
              </div></CardContent></Card>
            </motion.div>
          ))}
        </div>
      ) : (<Card className="p-12 text-center"><Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-display text-xl font-semibold mb-2">No bookings yet</h3><p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p><Button onClick={() => navigate('/search')}>Search Trips</Button></Card>)}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}><DialogContent><DialogHeader><DialogTitle>Cancel Booking</DialogTitle><DialogDescription>Are you sure you want to cancel this booking?</DialogDescription></DialogHeader>{selectedBooking && (<div className="py-4"><div className="rounded-lg bg-secondary p-4 space-y-2"><p className="font-mono font-bold">{selectedBooking.booking_reference}</p><p className="text-sm">{selectedBooking.origin} → {selectedBooking.destination}</p><p className="text-sm text-muted-foreground">{formatDate(selectedBooking.departure_time)} at {formatTime(selectedBooking.departure_time)}</p></div></div>)}<DialogFooter><Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={isCancelling}>Keep Booking</Button><Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>{isCancelling ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling...</>) : 'Cancel Booking'}</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><DialogContent><DialogHeader><DialogTitle>Delete Booking</DialogTitle><DialogDescription>Are you sure you want to permanently delete this booking? This action cannot be undone.</DialogDescription></DialogHeader>{selectedBooking && (<div className="py-4"><div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-2"><p className="font-mono font-bold">{selectedBooking.booking_reference}</p><p className="text-sm">{selectedBooking.origin} → {selectedBooking.destination}</p><p className="text-sm text-muted-foreground">{formatDate(selectedBooking.departure_time)} at {formatTime(selectedBooking.departure_time)}</p><Badge variant={statusConfig[selectedBooking.status].variant} className="mt-2">{statusConfig[selectedBooking.status].label}</Badge></div></div>)}<DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Keep Booking</Button><Button variant="destructive" onClick={handleDeleteBooking} disabled={isDeleting}>{isDeleting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>) : (<><Trash2 className="mr-2 h-4 w-4" />Delete Permanently</>)}</Button></DialogFooter></DialogContent></Dialog>
    </div></div>
  )
}

