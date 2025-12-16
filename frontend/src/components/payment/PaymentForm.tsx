import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, CreditCard, Loader2, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  PaymentMethod, 
  PaymentCurrency, 
  PaymentStatus,
  PAYMENT_METHOD_INFO,
  CURRENCY_SYMBOLS 
} from '@/types'

interface PaymentFormProps {
  method: PaymentMethod
  amount: number
  currency: PaymentCurrency
  onSubmit: (data: PaymentFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  paymentStatus?: PaymentStatus
  checkoutUrl?: string
  instructions?: string
}

export interface PaymentFormData {
  phone_number?: string
  card_number?: string
  card_expiry?: string
  card_cvc?: string
  card_name?: string
}

export default function PaymentForm({
  method,
  amount,
  currency,
  onSubmit,
  onCancel,
  isLoading = false,
  paymentStatus,
  checkoutUrl,
  instructions
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const methodInfo = PAYMENT_METHOD_INFO[method]
  const isMobileMoney = ['mpesa', 'mtn_momo', 'airtel_money'].includes(method)
  const isCard = ['visa', 'mastercard'].includes(method)
  const isPayPal = method === 'paypal'

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (isMobileMoney) {
      if (!formData.phone_number) {
        newErrors.phone_number = 'Phone number is required'
      } else if (!/^\+?\d{10,15}$/.test(formData.phone_number.replace(/\s/g, ''))) {
        newErrors.phone_number = 'Invalid phone number'
      }
    }

    if (isCard) {
      if (!formData.card_number) {
        newErrors.card_number = 'Card number is required'
      }
      if (!formData.card_expiry) {
        newErrors.card_expiry = 'Expiry date is required'
      }
      if (!formData.card_cvc) {
        newErrors.card_cvc = 'CVC is required'
      }
      if (!formData.card_name) {
        newErrors.card_name = 'Cardholder name is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit(formData)
    }
  }

  // Show payment status
  if (paymentStatus === 'processing') {
    return (
      <PaymentProcessing 
        method={method} 
        instructions={instructions} 
        checkoutUrl={checkoutUrl}
      />
    )
  }

  if (paymentStatus === 'completed') {
    return <PaymentSuccess amount={amount} currency={currency} />
  }

  if (paymentStatus === 'failed') {
    return <PaymentFailed onRetry={onCancel} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="glass border-white/10">
        <CardHeader className="text-center">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white",
            methodInfo.color
          )}>
            {isMobileMoney ? <Phone className="h-8 w-8" /> : <CreditCard className="h-8 w-8" />}
          </div>
          <CardTitle className="font-display text-xl">Pay with {methodInfo.name}</CardTitle>
          <CardDescription>{methodInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Amount Display */}
          <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount to pay</p>
            <p className="text-3xl font-bold text-primary">
              {CURRENCY_SYMBOLS[currency]} {amount.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Money Form */}
            {isMobileMoney && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={
                      method === 'mpesa' ? '+254 7XX XXX XXX' :
                      method === 'mtn_momo' ? '+250 7XX XXX XXX' :
                      '+243 9XX XXX XXX'
                    }
                    value={formData.phone_number || ''}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    className={errors.phone_number ? 'border-destructive' : ''}
                    icon={<Phone className="h-4 w-4" />}
                  />
                </div>
                {errors.phone_number && (
                  <p className="text-xs text-destructive">{errors.phone_number}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  You will receive a payment prompt on this number
                </p>
              </div>
            )}

            {/* Card Payment Form */}
            {isCard && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="card_name">Cardholder Name</Label>
                  <Input
                    id="card_name"
                    placeholder="John Doe"
                    value={formData.card_name || ''}
                    onChange={(e) => handleChange('card_name', e.target.value)}
                    className={errors.card_name ? 'border-destructive' : ''}
                  />
                  {errors.card_name && (
                    <p className="text-xs text-destructive">{errors.card_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card_number">Card Number</Label>
                  <Input
                    id="card_number"
                    placeholder="4242 4242 4242 4242"
                    value={formData.card_number || ''}
                    onChange={(e) => handleChange('card_number', e.target.value)}
                    className={errors.card_number ? 'border-destructive' : ''}
                    icon={<CreditCard className="h-4 w-4" />}
                  />
                  {errors.card_number && (
                    <p className="text-xs text-destructive">{errors.card_number}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="card_expiry">Expiry Date</Label>
                    <Input
                      id="card_expiry"
                      placeholder="MM/YY"
                      value={formData.card_expiry || ''}
                      onChange={(e) => handleChange('card_expiry', e.target.value)}
                      className={errors.card_expiry ? 'border-destructive' : ''}
                    />
                    {errors.card_expiry && (
                      <p className="text-xs text-destructive">{errors.card_expiry}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card_cvc">CVC</Label>
                    <Input
                      id="card_cvc"
                      placeholder="123"
                      type="password"
                      maxLength={4}
                      value={formData.card_cvc || ''}
                      onChange={(e) => handleChange('card_cvc', e.target.value)}
                      className={errors.card_cvc ? 'border-destructive' : ''}
                    />
                    {errors.card_cvc && (
                      <p className="text-xs text-destructive">{errors.card_cvc}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* PayPal Info */}
            {isPayPal && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
                <div className="flex justify-center gap-2 text-2xl">
                  <span>🔒</span>
                  <span className="text-blue-500 font-bold">PayPal</span>
                </div>
              </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Your payment is secured with 256-bit encryption</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gradient" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${CURRENCY_SYMBOLS[currency]} ${amount.toLocaleString()}`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Payment Processing Component
function PaymentProcessing({ method, instructions, checkoutUrl }: { 
  method: PaymentMethod
  instructions?: string
  checkoutUrl?: string 
}) {
  const methodInfo = PAYMENT_METHOD_INFO[method]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-20 h-20 mx-auto mb-6 relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        <div className={cn(
          "relative w-full h-full rounded-full flex items-center justify-center text-white",
          methodInfo.color
        )}>
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
      <p className="text-muted-foreground mb-4">
        {instructions || `Please complete the payment on your ${methodInfo.name}`}
      </p>
      {checkoutUrl && (
        <Button asChild variant="gradient">
          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
            Complete Payment <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      )}
    </motion.div>
  )
}

// Payment Success Component
function PaymentSuccess({ amount, currency }: { amount: number; currency: PaymentCurrency }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-green-500">Payment Successful!</h3>
      <p className="text-muted-foreground mb-2">
        Your payment of {CURRENCY_SYMBOLS[currency]} {amount.toLocaleString()} has been received.
      </p>
      <p className="text-sm text-muted-foreground">
        You will receive a confirmation shortly.
      </p>
    </motion.div>
  )
}

// Payment Failed Component
function PaymentFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-20 h-20 mx-auto mb-6 bg-destructive rounded-full flex items-center justify-center">
        <AlertCircle className="h-12 w-12 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-destructive">Payment Failed</h3>
      <p className="text-muted-foreground mb-4">
        We couldn't process your payment. Please try again.
      </p>
      <Button onClick={onRetry} variant="gradient">
        Try Again
      </Button>
    </motion.div>
  )
}






