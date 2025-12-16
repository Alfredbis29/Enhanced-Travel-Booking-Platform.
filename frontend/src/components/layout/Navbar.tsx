import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Menu, X, User, LogOut, Ticket, Settings, Bus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store'
import { cn, getInitials } from '@/lib/utils'

// Animation variants
const logoVariants = {
  initial: { rotate: 0 },
  hover: { 
    rotate: [0, -10, 10, -10, 0],
    transition: { duration: 0.5 }
  }
}

const navLinkVariants = {
  initial: { y: 0 },
  hover: { 
    y: -2,
    transition: { type: "spring", stiffness: 300 }
  }
}

const mobileMenuVariants = {
  hidden: { 
    opacity: 0, 
    height: 0,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1, 
    height: 'auto',
    transition: { 
      duration: 0.3,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Scroll-based animations
  const { scrollY } = useScroll()
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.95)']
  )
  const navBorderOpacity = useTransform(scrollY, [0, 100], [0.1, 0.4])

  // Track scroll for compact mode
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }
  const navLinks = [{ href: '/', label: 'Home' }, { href: '/search', label: 'Search Trips' }]
  const isActive = (path: string) => location.pathname === path

  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b backdrop-blur-xl"
      style={{ 
        backgroundColor: navBackground,
        borderColor: `rgba(255, 255, 255, ${navBorderOpacity})`
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex items-center justify-between"
          animate={{ height: isScrolled ? 56 : 64 }}
          transition={{ duration: 0.2 }}
        >
          {/* Logo with animations */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              className="relative"
              variants={logoVariants}
              initial="initial"
              whileHover="hover"
            >
              <motion.div 
                className="absolute inset-0 bg-primary/20 rounded-lg blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="relative bg-gradient-to-br from-sky-500 to-maroon-700 p-2 rounded-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <motion.div
                  animate={{ 
                    rotateY: [0, 360],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Bus className="h-5 w-5 text-white relative z-10" />
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.span 
              className="font-display text-xl font-bold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-gradient">Twende</span>
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                variants={navLinkVariants}
                initial="initial"
                whileHover="hover"
              >
                <Link 
                  to={link.href} 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative",
                    isActive(link.href) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    {link.label}
                  </motion.span>
                  {/* Active indicator */}
                  {isActive(link.href) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      layoutId="activeNavIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden">
                      <motion.div 
                        className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-maroon-700 text-white font-semibold"
                        animate={{ 
                          boxShadow: [
                            '0 0 0 0 rgba(56, 189, 248, 0)',
                            '0 0 0 4px rgba(56, 189, 248, 0.3)',
                            '0 0 0 0 rgba(56, 189, 248, 0)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {user ? getInitials(user.first_name, user.last_name) : 'U'}
                      </motion.div>
                    </Button>
                  </motion.div>
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
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="gradient" onClick={() => navigate('/register')} className="relative overflow-hidden group">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                    </motion.span>
                    Get Started
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden p-2 relative" 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={menuItemVariants}>
                  <Link 
                    to={link.href} 
                    onClick={() => setIsOpen(false)} 
                    className={cn(
                      "block py-2 text-sm font-medium transition-colors",
                      isActive(link.href) ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                variants={menuItemVariants}
                className="pt-4 border-t border-border space-y-2"
              >
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
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
