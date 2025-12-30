import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Loader2, Bus, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)

  useEffect(() => {
    if (!token || !email) {
      setIsInvalid(true)
    }
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }
    
    if (password !== confirmPassword) {
      toast({ title: 'Passwords don\'t match', description: 'Please make sure your passwords match', variant: 'destructive' })
      return
    }
    
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      await authApi.resetPassword(token, email, password)
      setIsSuccess(true)
      toast({ 
        title: 'Password reset!', 
        description: 'Your password has been successfully reset', 
        variant: 'success' 
      })
    } catch (error: unknown) {
      console.error('Password reset failed:', error)
      let errorMessage = 'Failed to reset password. The link may have expired.'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string } } }
        errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || errorMessage
      }
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  // Invalid token state
  if (isInvalid) {
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
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="font-display text-2xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/forgot-password" className="w-full">
                <Button variant="gradient" className="w-full" size="lg">
                  Request New Reset Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
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
              <CardTitle className="font-display text-2xl">Password Reset!</CardTitle>
              <CardDescription>
                Your password has been successfully reset. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="gradient" 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/login')}
              >
                Sign In Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Reset password form
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
            <CardTitle className="font-display text-2xl">Create New Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    icon={<Lock className="h-4 w-4" />} 
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    icon={<Lock className="h-4 w-4" />} 
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

