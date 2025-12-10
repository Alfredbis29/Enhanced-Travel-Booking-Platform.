import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Ticket, Settings, Bus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store'
import { cn, getInitials } from '@/lib/utils'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }
  const navLinks = [{ href: '/', label: 'Home' }, { href: '/search', label: 'Search Trips' }]
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl group-hover:bg-primary/30 transition-colors" />
              <div className="relative bg-gradient-to-br from-sky-500 to-maroon-700 p-2 rounded-lg">
                <Bus className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-gradient">Twende</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className={cn("text-sm font-medium transition-colors hover:text-primary", isActive(link.href) ? "text-primary" : "text-muted-foreground")}>{link.label}</Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-maroon-700 text-white font-semibold">
                      {user ? getInitials(user.first_name, user.last_name) : 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/bookings')}><Ticket className="mr-2 h-4 w-4" />My Bookings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
                <Button variant="gradient" onClick={() => navigate('/register')}><Sparkles className="mr-2 h-4 w-4" />Get Started</Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="md:hidden border-t border-border">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (<Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className={cn("block py-2 text-sm font-medium", isActive(link.href) ? "text-primary" : "text-muted-foreground")}>{link.label}</Link>))}
              <div className="pt-4 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/bookings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-sm"><Ticket className="h-4 w-4" />My Bookings</Link>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 py-2 text-sm"><User className="h-4 w-4" />Profile</Link>
                    <button onClick={() => { handleLogout(); setIsOpen(false) }} className="flex items-center gap-2 py-2 text-sm text-destructive w-full"><LogOut className="h-4 w-4" />Log out</button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/login'); setIsOpen(false) }}>Sign in</Button>
                    <Button variant="gradient" className="w-full" onClick={() => { navigate('/register'); setIsOpen(false) }}><Sparkles className="mr-2 h-4 w-4" />Get Started</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
