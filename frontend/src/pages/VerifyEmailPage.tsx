import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Bus, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useToast } from '@/hooks/use-toast'

type VerificationStatus = 'verifying' | 'success' | 'error' | 'expired'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const { toast } = useToast()
  
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus('error')
        setErrorMessage('Invalid verification link. Please check your email for the correct link.')
        return
      }

      try {
        const response = await authApi.verifyEmail(token, email)
        setStatus('success')
        
        // Auto-login after verification
        if (response.data?.token) {
          setAuth(response.data.user, response.data.token)
          toast({ 
            title: '🎉 Email Verified!', 
            description: 'Welcome to Twende! Your account is now active.',
            variant: 'success'
          })
          
          // Redirect after a short delay
          setTimeout(() => navigate('/'), 3000)
        }
      } catch (error: unknown) {
        console.error('Verification failed:', error)
        
        let message = 'Verification failed. Please try again.'
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } }
          message = axiosError.response?.data?.message || message
          
          if (message.toLowerCase().includes('expired')) {
            setStatus('expired')
          } else {
            setStatus('error')
          }
        } else {
          setStatus('error')
        }
        setErrorMessage(message)
      }
    }

    verifyEmail()
  }, [token, email, setAuth, toast, navigate])

  const handleResendVerification = async () => {
    if (!email) return
    
    setIsResending(true)
    try {
      await authApi.resendVerification(email)
      toast({ 
        title: 'Email Sent!', 
        description: 'Please check your inbox for a new verification link.',
        variant: 'success'
      })
    } catch (error) {
      console.error('Resend failed:', error)
      toast({ 
        title: 'Failed to send', 
        description: 'Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setIsResending(false)
    }
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
            {status === 'verifying' && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-4"
                >
                  <Loader2 className="h-16 w-16 text-primary" />
                </motion.div>
                <CardTitle className="font-display text-2xl">Verifying Your Email</CardTitle>
                <CardDescription>Please wait while we verify your account...</CardDescription>
              </>
            )}
            
            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </motion.div>
                <CardTitle className="font-display text-2xl text-green-600 dark:text-green-400">
                  Email Verified! 🎉
                </CardTitle>
                <CardDescription>
                  Your account is now active. Redirecting you to the homepage...
                </CardDescription>
              </>
            )}
            
            {status === 'error' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4"
                >
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="h-12 w-12 text-red-500" />
                  </div>
                </motion.div>
                <CardTitle className="font-display text-2xl text-red-600 dark:text-red-400">
                  Verification Failed
                </CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </>
            )}
            
            {status === 'expired' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4"
                >
                  <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <Mail className="h-12 w-12 text-amber-500" />
                  </div>
                </motion.div>
                <CardTitle className="font-display text-2xl text-amber-600 dark:text-amber-400">
                  Link Expired
                </CardTitle>
                <CardDescription>
                  This verification link has expired. Request a new one below.
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  variant="gradient" 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Start Exploring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
            
            {(status === 'error' || status === 'expired') && email && (
              <div className="space-y-3">
                <Button 
                  variant="gradient" 
                  className="w-full" 
                  size="lg"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </div>
            )}
            
            {(status === 'error' || status === 'expired') && !email && (
              <Button 
                variant="gradient" 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/register')}
              >
                Create New Account
              </Button>
            )}
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact{' '}
          <a href="mailto:support@twende.travel" className="text-primary hover:underline">
            support@twende.travel
          </a>
        </p>
      </motion.div>
    </div>
  )
}

