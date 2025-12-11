import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Smartphone, CreditCard, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PaymentMethod, PAYMENT_METHOD_INFO, PAYMENT_METHODS_BY_COUNTRY } from '@/types'

interface PaymentMethodSelectorProps {
  country?: string
  selectedMethod: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
  className?: string
}

const methodIcons: Record<PaymentMethod, JSX.Element> = {
  mpesa: <Smartphone className="h-6 w-6" />,
  mtn_momo: <Smartphone className="h-6 w-6" />,
  airtel_money: <Smartphone className="h-6 w-6" />,
  paypal: <Wallet className="h-6 w-6" />,
  visa: <CreditCard className="h-6 w-6" />,
  mastercard: <CreditCard className="h-6 w-6" />
}

const methodLogos: Record<PaymentMethod, string> = {
  mpesa: '/payment-logos/mpesa.svg',
  mtn_momo: '/payment-logos/mtn.svg',
  airtel_money: '/payment-logos/airtel.svg',
  paypal: '/payment-logos/paypal.svg',
  visa: '/payment-logos/visa.svg',
  mastercard: '/payment-logos/mastercard.svg'
}

export default function PaymentMethodSelector({ 
  country, 
  selectedMethod, 
  onSelect,
  className 
}: PaymentMethodSelectorProps) {
  const availableMethods = country 
    ? PAYMENT_METHODS_BY_COUNTRY[country] || ['paypal', 'visa', 'mastercard']
    : Object.keys(PAYMENT_METHOD_INFO) as PaymentMethod[]

  // Group methods by type
  const mobileMoneyMethods = availableMethods.filter(m => ['mpesa', 'mtn_momo', 'airtel_money'].includes(m))
  const cardMethods = availableMethods.filter(m => ['visa', 'mastercard'].includes(m))
  const otherMethods = availableMethods.filter(m => m === 'paypal')

  return (
    <div className={cn("space-y-6", className)}>
      {/* Mobile Money Section */}
      {mobileMoneyMethods.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile Money
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mobileMoneyMethods.map((method, index) => (
              <PaymentMethodCard
                key={method}
                method={method}
                isSelected={selectedMethod === method}
                onSelect={onSelect}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Card Payment Section */}
      {cardMethods.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Card Payment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cardMethods.map((method, index) => (
              <PaymentMethodCard
                key={method}
                method={method}
                isSelected={selectedMethod === method}
                onSelect={onSelect}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Methods Section */}
      {otherMethods.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Digital Wallet
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherMethods.map((method, index) => (
              <PaymentMethodCard
                key={method}
                method={method}
                isSelected={selectedMethod === method}
                onSelect={onSelect}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface PaymentMethodCardProps {
  method: PaymentMethod
  isSelected: boolean
  onSelect: (method: PaymentMethod) => void
  index: number
}

function PaymentMethodCard({ method, isSelected, onSelect, index }: PaymentMethodCardProps) {
  const info = PAYMENT_METHOD_INFO[method]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected 
            ? "border-primary ring-2 ring-primary/20 bg-primary/5" 
            : "border-border hover:border-primary/50"
        )}
        onClick={() => onSelect(method)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-white",
            info.color
          )}>
            {methodIcons[method]}
          </div>
          <div className="flex-1">
            <div className="font-medium">{info.name}</div>
            <div className="text-xs text-muted-foreground">{info.description}</div>
          </div>
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}




