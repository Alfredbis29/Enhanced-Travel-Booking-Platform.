import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, SlidersHorizontal, X, Sparkles, Search as SearchIcon, Bus, Plane, Train, Ship, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SearchBar from '@/components/search/SearchBar'
import AISearchBar from '@/components/search/AISearchBar'
import TripCard from '@/components/trips/TripCard'
import { SearchResultsSkeleton } from '@/components/ui/skeleton'
import { searchApi, aiApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { Trip, SearchParams, AIRecommendationResponse, TravelMode } from '@/types'

const TRAVEL_MODES = [
  { id: 'all', name: 'All', icon: null, emoji: '🎫' },
  { id: 'bus', name: 'Buses', icon: Bus, emoji: '🚌' },
  { id: 'flight', name: 'Flights', icon: Plane, emoji: '✈️' },
  { id: 'train', name: 'Trains', icon: Train, emoji: '🚂' },
  { id: 'ferry', name: 'Ferries', icon: Ship, emoji: '⛴️' },
  { id: 'shuttle', name: 'Shuttles', icon: Car, emoji: '🚐' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [trips, setTrips] = useState<Trip[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'departure_time')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'asc')
  const [travelMode, setTravelMode] = useState<string>(searchParams.get('mode') || 'all')

  const loadTrips = useCallback(async () => {
    setIsLoading(true)
    try {
      const aiQuery = searchParams.get('ai_query')
      if (aiQuery) {
        const response = await aiApi.getRecommendations(aiQuery)
        setTrips(response.search_results.trips); setTotal(response.search_results.total); setAiExplanation(response.ai_interpretation.explanation)
      } else {
        const params: SearchParams = { 
          origin: searchParams.get('origin') || undefined, 
          destination: searchParams.get('destination') || undefined, 
          date: searchParams.get('date') || undefined, 
          mode: travelMode !== 'all' ? travelMode as TravelMode : undefined,
          min_price: priceRange[0] > 0 ? priceRange[0] : undefined, 
          max_price: priceRange[1] < 50000 ? priceRange[1] : undefined, 
          sort_by: sortBy as SearchParams['sort_by'], 
          sort_order: sortOrder as SearchParams['sort_order'], 
          page: parseInt(searchParams.get('page') || '1'), 
          limit: 20 
        }
        const response = await searchApi.searchTrips(params)
        setTrips(response.trips); setTotal(response.total); setAiExplanation(null)
      }
    } catch (error) { console.error('Failed to load trips:', error) } 
    finally { setIsLoading(false) }
  }, [searchParams, priceRange, sortBy, sortOrder, travelMode])

  useEffect(() => { loadTrips() }, [loadTrips])

  const handleAISearch = (results: AIRecommendationResponse) => {
    setTrips(results.search_results.trips); setTotal(results.search_results.total); setAiExplanation(results.ai_interpretation.explanation)
    const newParams = new URLSearchParams(searchParams)
    const { parsed_params } = results.ai_interpretation
    if (parsed_params.origin) newParams.set('origin', parsed_params.origin)
    if (parsed_params.destination) newParams.set('destination', parsed_params.destination)
    if (parsed_params.date) newParams.set('date', parsed_params.date)
    newParams.set('ai_query', results.ai_interpretation.original_query)
    setSearchParams(newParams)
  }

  const clearFilters = () => { setPriceRange([0, 50000]); setSortBy('departure_time'); setSortOrder('asc'); setTravelMode('all'); setSearchParams({}); setAiExplanation(null) }
  const hasActiveFilters = searchParams.get('origin') || searchParams.get('destination') || searchParams.get('date') || priceRange[0] > 0 || priceRange[1] < 50000 || travelMode !== 'all'

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8"><h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Find Your <span className="text-gradient">Trip</span></h1><p className="text-muted-foreground">Search from hundreds of bus routes across Kenya</p></div>
        <div className="mb-8"><AISearchBar onSearch={handleAISearch} /></div>
        <SearchBar className="mb-8" />
        <AnimatePresence>{aiExplanation && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6"><div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20"><Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" /><div className="flex-1"><p className="text-sm font-medium">AI Interpretation</p><p className="text-sm text-muted-foreground">{aiExplanation}</p></div><Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => setAiExplanation(null)}><X className="h-4 w-4" /></Button></div></motion.div>)}</AnimatePresence>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-72 shrink-0">
            <Button variant="outline" className="lg:hidden w-full mb-4" onClick={() => setShowFilters(!showFilters)}><Filter className="h-4 w-4 mr-2" />{showFilters ? 'Hide Filters' : 'Show Filters'}</Button>
            <AnimatePresence>{(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:sticky lg:top-24"><Card><CardHeader className="pb-4"><div className="flex items-center justify-between"><CardTitle className="text-lg flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" />Filters</CardTitle>{hasActiveFilters && (<Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">Clear all</Button>)}</div></CardHeader><CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Travel Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRAVEL_MODES.map((mode) => (
                      <Button
                        key={mode.id}
                        variant={travelMode === mode.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTravelMode(mode.id)}
                        className="justify-start text-xs"
                      >
                        <span className="mr-1">{mode.emoji}</span>
                        {mode.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div><label className="text-sm font-medium mb-4 block">Price Range</label><Slider value={priceRange} onValueChange={(value) => setPriceRange(value as [number, number])} max={50000} min={0} step={500} className="mb-2" /><div className="flex justify-between text-xs text-muted-foreground"><span>{formatCurrency(priceRange[0])}</span><span>{formatCurrency(priceRange[1])}</span></div></div><div><label className="text-sm font-medium mb-2 block">Sort By</label><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="departure_time">Departure Time</SelectItem><SelectItem value="price">Price</SelectItem><SelectItem value="duration">Duration</SelectItem><SelectItem value="rating">Rating</SelectItem></SelectContent></Select></div><div><label className="text-sm font-medium mb-2 block">Order</label><Select value={sortOrder} onValueChange={setSortOrder}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asc">Ascending</SelectItem><SelectItem value="desc">Descending</SelectItem></SelectContent></Select></div><Button onClick={loadTrips} className="w-full">Apply Filters</Button></CardContent></Card></motion.div>)}</AnimatePresence>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3"><p className="text-sm text-muted-foreground">{isLoading ? 'Searching...' : `${total} trips found`}</p>{hasActiveFilters && (<div className="flex items-center gap-2 flex-wrap">{travelMode !== 'all' && (<Badge variant="default">{TRAVEL_MODES.find(m => m.id === travelMode)?.emoji} {TRAVEL_MODES.find(m => m.id === travelMode)?.name}</Badge>)}{searchParams.get('origin') && (<Badge variant="secondary">From: {searchParams.get('origin')}</Badge>)}{searchParams.get('destination') && (<Badge variant="secondary">To: {searchParams.get('destination')}</Badge>)}{searchParams.get('date') && (<Badge variant="secondary">{searchParams.get('date')}</Badge>)}</div>)}</div>
            </div>
            {isLoading ? (<SearchResultsSkeleton />) : trips.length > 0 ? (<div className="space-y-4">{trips.map((trip, index) => (<TripCard key={trip.id} trip={trip} index={index} />))}</div>) : (<Card className="p-12 text-center"><SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-display text-xl font-semibold mb-2">No trips found</h3><p className="text-muted-foreground mb-4">Try adjusting your search filters</p><Button onClick={clearFilters}>Clear Filters</Button></Card>)}
          </div>
        </div>
      </div>
    </div>
  )
}

