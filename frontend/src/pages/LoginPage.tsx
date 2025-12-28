import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, Bus, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
  
  // Check if user was redirected from booking page
  const isFromBooking = from.includes('/booking/')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast({ title: 'Missing fields', description: 'Please fill in all fields', variant: 'destructive' }); return }
    setIsLoading(true)
    try {
      const response = await authApi.login(email, password)
      setAuth(response.data.user, response.data.token)
      toast({ title: 'Welcome back!', description: `Logged in as ${response.data.user.first_name}`, variant: 'success' })
      navigate(from, { replace: true })
    } catch (error: unknown) { 
      console.error('Login failed:', error)
      // Extract error message from API response
      let errorMessage = 'Invalid credentials. Please try again.'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string } } }
        errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || errorMessage
      } else if (error instanceof Error) {
        // Handle network errors
        if (error.message.includes('Network Error')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.'
        } else {
          errorMessage = error.message
        }
      }
      toast({ title: 'Login failed', description: errorMessage, variant: 'destructive' })
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-maroon-700/10 rounded-full blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8"><Link to="/" className="flex items-center gap-2"><div className="bg-gradient-to-br from-sky-500 to-maroon-700 p-2 rounded-lg"><Bus className="h-6 w-6 text-white" /></div><span className="font-display text-2xl font-bold"><span className="text-gradient">Twende</span></span></Link></div>
        <Card className="glass border-white/10">
          {isFromBooking && (
            <div className="mx-6 mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">Login Required</p>
                <p className="text-sm text-muted-foreground">Please sign in or create an account to complete your booking.</p>
              </div>
            </div>
          )}
          <CardHeader className="text-center"><CardTitle className="font-display text-2xl">Welcome Back</CardTitle><CardDescription>Sign in to your account to continue</CardDescription></CardHeader><CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="h-4 w-4" />} autoComplete="email" /></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link></div><Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="h-4 w-4" />} autoComplete="current-password" /></div>
            <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : (<>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>)}</Button>
          </form>
          <div className="mt-6 text-center text-sm"><span className="text-muted-foreground">Don't have an account? </span><Link to="/register" state={{ from: location.state?.from }} className="text-primary hover:underline font-medium">Sign up</Link></div>
        </CardContent></Card>
      </motion.div>
    </div>
  )
}
