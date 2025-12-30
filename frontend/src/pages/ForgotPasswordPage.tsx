import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Loader2, Bus, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({ title: 'Email required', description: 'Please enter your email address', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      await authApi.forgotPassword(email)
      setEmailSent(true)
      toast({ 
        title: 'Reset link sent!', 
        description: 'Check your email for password reset instructions', 
        variant: 'success' 
      })
    } catch (error: unknown) {
      console.error('Password reset failed:', error)
      let errorMessage = 'Failed to send reset email. Please try again.'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string } } }
        errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || errorMessage
      }
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-maroon-700/10 rounded-full blur-3xl" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="relative z-10 w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-sky-500 to-maroon-700 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold">
                <span className="text-gradient">Twende</span>
              </span>
            </Link>
          </div>
          <Card className="glass border-white/10">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="font-display text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in your email to reset your password. 
                The link will expire in 1 hour.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setEmailSent(false)}
                  className="w-full"
                >
                  Try a different email
                </Button>
                <Link to="/login" className="w-full">
                  <Button variant="gradient" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-sky-500 to-maroon-700 p-2 rounded-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold">
              <span className="text-gradient">Twende</span>
            </span>
          </Link>
        </div>
        <Card className="glass border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  icon={<Mail className="h-4 w-4" />} 
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                variant="gradient" 
                className="w-full" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-primary hover:underline font-medium flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

