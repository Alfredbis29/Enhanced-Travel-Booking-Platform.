import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, Loader2, Bus, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [isResending, setIsResending] = useState(false)
  
  // Check if user was redirected from booking page
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
  const isFromBooking = from.includes('/booking/')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) { toast({ title: 'Missing fields', description: 'Please fill in all required fields', variant: 'destructive' }); return }
    if (formData.password.length < 6) { toast({ title: 'Password too short', description: 'Password must be at least 6 characters', variant: 'destructive' }); return }
    if (formData.password !== formData.confirmPassword) { toast({ title: 'Passwords don\'t match', description: 'Please make sure your passwords match', variant: 'destructive' }); return }
    setIsLoading(true)
    try {
      const response = await authApi.register({ first_name: formData.first_name, last_name: formData.last_name, email: formData.email, password: formData.password, phone: formData.phone || undefined })
      
      // Check if email verification is required
      const requiresVerification = (response as { data?: { requiresVerification?: boolean } }).data?.requiresVerification
      
      if (requiresVerification) {
        // Show verification pending state
        setVerificationSent(true)
        toast({ title: '📧 Check Your Email!', description: 'We sent a verification link to your inbox.', variant: 'success' })
      } else if (response.data?.token) {
        // Demo mode or email already verified - auto login
        setAuth(response.data.user, response.data.token)
        toast({ title: 'Welcome to Twende!', description: 'Your account has been created. Let\'s Go!', variant: 'success' })
        navigate(from, { replace: true })
      }
    } catch (error: unknown) { 
      console.error('Registration failed:', error)
      // Extract error message from API response
      let errorMessage = 'Registration failed. Please try again.'
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
      toast({ title: 'Registration failed', description: errorMessage, variant: 'destructive' })
    } finally { setIsLoading(false) }
  }

  const handleResendVerification = async () => {
    if (!formData.email) return
    setIsResending(true)
    try {
      await authApi.resendVerification(formData.email)
      toast({ title: '📧 Email Sent!', description: 'Check your inbox for the verification link.', variant: 'success' })
    } catch (error) {
      toast({ title: 'Failed to send', description: 'Please try again later.', variant: 'destructive' })
    } finally {
      setIsResending(false)
    }
  }

  // Show verification pending state
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-sky-500 to-maroon-700 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold"><span className="text-gradient">Twende</span></span>
            </Link>
          </div>
          <Card className="glass border-white/10">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-4"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Mail className="h-10 w-10 text-green-500" />
                </div>
              </motion.div>
              <CardTitle className="font-display text-2xl">Check Your Email! 📧</CardTitle>
              <CardDescription>
                We sent a verification link to<br />
                <span className="font-semibold text-foreground">{formData.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-600 dark:text-green-400">Almost there!</p>
                    <p className="text-muted-foreground mt-1">
                      Click the link in your email to verify your account and start booking trips.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Didn't receive the email? Check your spam folder or</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'click here to resend'}
                </Button>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
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
                <p className="font-medium text-amber-600 dark:text-amber-400">Account Required</p>
                <p className="text-sm text-muted-foreground">Create an account to complete your booking and manage your trips.</p>
              </div>
            </div>
          )}
          <CardHeader className="text-center"><CardTitle className="font-display text-2xl flex items-center justify-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Create Account</CardTitle><CardDescription>Join Twende and start your journey across East Africa</CardDescription></CardHeader><CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="first_name">First Name</Label><Input id="first_name" name="first_name" placeholder="John" value={formData.first_name} onChange={handleChange} icon={<User className="h-4 w-4" />} /></div><div className="space-y-2"><Label htmlFor="last_name">Last Name</Label><Input id="last_name" name="last_name" placeholder="Doe" value={formData.last_name} onChange={handleChange} /></div></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} icon={<Mail className="h-4 w-4" />} autoComplete="email" /></div>
            <div className="space-y-2"><Label htmlFor="phone">Phone (Optional)</Label><Input id="phone" name="phone" type="tel" placeholder="+254 700 123 456" value={formData.phone} onChange={handleChange} icon={<Phone className="h-4 w-4" />} /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} icon={<Lock className="h-4 w-4" />} autoComplete="new-password" /></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} icon={<Lock className="h-4 w-4" />} autoComplete="new-password" /></div>
            <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>{isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>) : (<>Create Account<ArrowRight className="ml-2 h-4 w-4" /></>)}</Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground text-center">By signing up, you agree to our <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a></p>
          <div className="mt-6 text-center text-sm"><span className="text-muted-foreground">Already have an account? </span><Link to="/login" state={{ from: location.state?.from }} className="text-primary hover:underline font-medium">Sign in</Link></div>
        </CardContent></Card>
      </motion.div>
    </div>
  )
}
