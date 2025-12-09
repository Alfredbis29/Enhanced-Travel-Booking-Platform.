import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  variant?: 'default' | 'hero'
}

const DESTINATIONS = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Nyeri', 'Thika']

export default function SearchBar({ className, variant = 'default' }: SearchBarProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [origin, setOrigin] = useState(searchParams.get('origin') || '')
  const [destination, setDestination] = useState(searchParams.get('destination') || '')
  const [date, setDate] = useState(searchParams.get('date') || '')

  useEffect(() => {
    setOrigin(searchParams.get('origin') || '')
    setDestination(searchParams.get('destination') || '')
    setDate(searchParams.get('date') || '')
  }, [searchParams])

  const handleSwap = () => { const temp = origin; setOrigin(destination); setDestination(temp) }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (origin) params.set('origin', origin)
    if (destination) params.set('destination', destination)
    if (date) params.set('date', date)
    navigate(`/search?${params.toString()}`)
  }

  const isHero = variant === 'hero'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className={cn("w-full", isHero ? "max-w-4xl mx-auto" : "", className)}>
      <div className={cn("flex flex-col gap-4 p-4 rounded-2xl", isHero ? "glass md:flex-row md:items-end md:gap-2 md:p-2" : "bg-card border border-border md:flex-row md:items-end md:gap-3")}>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 px-1"><MapPin className="h-3 w-3" />From</label>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className={cn("w-full", isHero && "bg-white/10 border-white/20")}><SelectValue placeholder="Select origin" /></SelectTrigger>
            <SelectContent>{DESTINATIONS.map((city) => (<SelectItem key={city} value={city}>{city}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={handleSwap} className={cn("shrink-0 self-center md:self-end md:mb-1", isHero && "text-white hover:bg-white/10")}><ArrowRightLeft className="h-4 w-4" /></Button>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 px-1"><MapPin className="h-3 w-3" />To</label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className={cn("w-full", isHero && "bg-white/10 border-white/20")}><SelectValue placeholder="Select destination" /></SelectTrigger>
            <SelectContent>{DESTINATIONS.filter(city => city !== origin).map((city) => (<SelectItem key={city} value={city}>{city}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-2 px-1"><Calendar className="h-3 w-3" />Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={cn(isHero && "bg-white/10 border-white/20")} />
        </div>
        <Button onClick={handleSearch} variant={isHero ? "default" : "gradient"} size={isHero ? "lg" : "default"} className={cn("shrink-0", isHero && "md:w-auto w-full bg-primary hover:bg-primary/90")}><Search className="h-4 w-4 mr-2" />Search</Button>
      </div>
    </motion.div>
  )
}

