import { useState, useEffect, useRef } from 'react'
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

// Typing placeholder phrases
const PLACEHOLDER_PHRASES = [
  "Find me the cheapest bus to Mombasa tomorrow",
  "Book a flight from Nairobi to Kigali",
  "Show trains to Dar es Salaam this weekend",
  "VIP sleeper bus to Kampala tonight",
  "Ferry from Kisumu to Mwanza",
  "Cross-border shuttle to Arusha"
]

export default function AISearchBar({ className, onSearch }: AISearchBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const { addRecentSearch, recentSearches } = useSearchStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // Typing effect for placeholder
  useEffect(() => {
    if (query || isFocused) {
      setPlaceholder('')
      return
    }

    const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex]
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < currentPhrase.length) {
          setPlaceholder(currentPhrase.slice(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        } else {
          // Pause at the end
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setPlaceholder(currentPhrase.slice(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        } else {
          setIsDeleting(false)
          setPhraseIndex((phraseIndex + 1) % PLACEHOLDER_PHRASES.length)
        }
      }
    }, isDeleting ? 30 : 80)

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex, query, isFocused])

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
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }} 
        className={cn(
          "relative group transition-all duration-300",
          isFocused && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background rounded-2xl"
        )}
      >
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1.02 : 1
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Pulsing ring animation when focused */}
        {isFocused && (
          <motion.div 
            className="absolute inset-0 rounded-2xl border-2 border-primary/30"
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        <div className="relative glass rounded-2xl p-2 flex items-center gap-2">
          {/* Animated AI icon */}
          <motion.div 
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shrink-0 overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ 
                rotate: isLoading ? 360 : [0, 15, -15, 0]
              }}
              transition={isLoading 
                ? { duration: 1, repeat: Infinity, ease: "linear" }
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
          </motion.div>
          
          {/* Input with animated placeholder */}
          <div className="flex-1 relative">
            <input 
              ref={inputRef}
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onFocus={() => setIsFocused(true)} 
              onBlur={() => setTimeout(() => setIsFocused(false), 200)} 
              onKeyDown={handleKeyDown} 
              placeholder=""
              className="w-full bg-transparent border-0 text-foreground focus:outline-none text-sm md:text-base py-2" 
            />
            {/* Animated typing placeholder */}
            {!query && !isFocused && (
              <motion.div 
                className="absolute inset-0 flex items-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-muted-foreground text-sm md:text-base">
                  Ask AI: '<span className="text-muted-foreground/80">{placeholder}</span>
                  <motion.span 
                    className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  '
                </span>
              </motion.div>
            )}
            {!query && isFocused && (
              <span className="absolute inset-0 flex items-center pointer-events-none text-muted-foreground/50 text-sm md:text-base">
                Type your travel query...
              </span>
            )}
          </div>
          
          {/* Send button with animations */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !query.trim()} 
              variant="gradient" 
              size="icon" 
              className="shrink-0 h-10 w-10 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '100%', opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    whileHover={{ x: 2 }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -10, scale: 0.95 }} 
            className="text-destructive text-sm mt-2 text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-xs text-muted-foreground mb-2">Recent searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 3).map((search, i) => (
                    <motion.button 
                      key={i} 
                      onClick={() => handleSuggestionClick(search)} 
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors hover:ring-2 hover:ring-primary/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Lightbulb className="h-3 w-3" />
                </motion.div>
                Try asking
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <motion.button 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 100 }} 
                    onClick={() => handleSuggestionClick(suggestion)} 
                    className="group flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all hover:ring-2 hover:ring-primary/20"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-muted-foreground flex-1">"{suggestion}"</span>
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

