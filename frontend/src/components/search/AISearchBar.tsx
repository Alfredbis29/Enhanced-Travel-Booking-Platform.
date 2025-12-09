import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, Lightbulb, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/store'
import { aiApi } from '@/lib/api'
import type { AIRecommendationResponse } from '@/types'

interface AISearchBarProps {
  className?: string
  onSearch?: (results: AIRecommendationResponse) => void
}

const SUGGESTIONS = ["Find me buses from Nairobi to Kampala", "Show VIP buses to Kigali tomorrow", "Cheapest route from Kampala to Goma", "Night coaches to Mombasa this weekend"]

export default function AISearchBar({ className, onSearch }: AISearchBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const { addRecentSearch, recentSearches } = useSearchStore()

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await aiApi.getRecommendations(query)
      addRecentSearch(query)
      if (onSearch) { onSearch(response) } 
      else {
        const params = new URLSearchParams()
        const { parsed_params } = response.ai_interpretation
        if (parsed_params.origin) params.set('origin', parsed_params.origin)
        if (parsed_params.destination) params.set('destination', parsed_params.destination)
        if (parsed_params.date) params.set('date', parsed_params.date)
        params.set('ai_query', query)
        navigate(`/search?${params.toString()}`)
      }
    } catch (err) {
      setError('Failed to process your request. Please try again.')
      console.error('AI search error:', err)
    } finally { setIsLoading(false) }
  }

  const handleSuggestionClick = (suggestion: string) => { setQuery(suggestion); setTimeout(() => handleSearch(), 100) }
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch() } }

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={cn("relative group", isFocused && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background rounded-2xl")}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative glass rounded-2xl p-2 flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shrink-0"><Sparkles className="h-5 w-5 text-white" /></div>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setTimeout(() => setIsFocused(false), 200)} onKeyDown={handleKeyDown} placeholder="Ask AI: 'Find me the cheapest bus to Mombasa tomorrow'" className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base py-2" />
          <Button onClick={handleSearch} disabled={isLoading || !query.trim()} variant="gradient" size="icon" className="shrink-0 h-10 w-10">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
        </div>
      </motion.div>
      <AnimatePresence>{error && (<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-destructive text-sm mt-2 text-center">{error}</motion.p>)}</AnimatePresence>
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 space-y-4">
            {recentSearches.length > 0 && (<div><p className="text-xs text-muted-foreground mb-2">Recent searches</p><div className="flex flex-wrap gap-2">{recentSearches.slice(0, 3).map((search, i) => (<button key={i} onClick={() => handleSuggestionClick(search)} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">{search}</button>))}</div></div>)}
            <div><p className="text-xs text-muted-foreground mb-2 flex items-center gap-2"><Lightbulb className="h-3 w-3" />Try asking</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{SUGGESTIONS.map((suggestion, i) => (<motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} onClick={() => handleSuggestionClick(suggestion)} className="group flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"><span className="text-muted-foreground flex-1">"{suggestion}"</span><ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></motion.button>))}</div></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

