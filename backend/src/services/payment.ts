import crypto from 'crypto';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentCurrency,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentVerifyResponse,
  MpesaSTKPushRequest,
  MpesaSTKPushResponse,
  MpesaCallbackData,
  MTNMomoRequest,
  AirtelMoneyRequest,
  PAYMENT_METHODS_BY_COUNTRY,
  PAYMENT_METHOD_INFO
} from '../types/index.js';

// In-memory storage for demo (use database in production)
const payments: Map<string, Payment> = new Map();

class PaymentService {
  // ==================== M-PESA (KENYA) ====================
  private mpesaConsumerKey: string;
  private mpesaConsumerSecret: string;
  private mpesaPasskey: string;
  private mpesaShortcode: string;
  private mpesaCallbackUrl: string;

  // ==================== MTN MOMO (RWANDA/UGANDA) ====================
  private mtnApiKey: string;
  private mtnUserId: string;
  private mtnEnvironment: string;

  // ==================== AIRTEL MONEY (CONGO) ====================
  private airtelClientId: string;
  private airtelClientSecret: string;

  // ==================== PAYPAL ====================
  private paypalClientId: string;
  private paypalClientSecret: string;
  private paypalEnvironment: string;

  // ==================== STRIPE (VISA/MASTERCARD) ====================
  private stripeSecretKey: string;

  constructor() {
    // M-Pesa credentials
    this.mpesaConsumerKey = process.env.MPESA_CONSUMER_KEY || '';
    this.mpesaConsumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    this.mpesaPasskey = process.env.MPESA_PASSKEY || '';
    this.mpesaShortcode = process.env.MPESA_SHORTCODE || '174379';
    this.mpesaCallbackUrl = process.env.MPESA_CALLBACK_URL || '';

    // MTN MoMo credentials
    this.mtnApiKey = process.env.MTN_API_KEY || '';
    this.mtnUserId = process.env.MTN_USER_ID || '';
    this.mtnEnvironment = process.env.MTN_ENVIRONMENT || 'sandbox';

    // Airtel Money credentials
    this.airtelClientId = process.env.AIRTEL_CLIENT_ID || '';
    this.airtelClientSecret = process.env.AIRTEL_CLIENT_SECRET || '';

    // PayPal credentials
    this.paypalClientId = process.env.PAYPAL_CLIENT_ID || '';
    this.paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.paypalEnvironment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

    // Stripe credentials
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  }

  // ==================== MAIN PAYMENT METHODS ====================

  async initiatePayment(request: PaymentInitiateRequest, userId: string): Promise<PaymentInitiateResponse> {
    const paymentId = this.generatePaymentId();
    
    // Create payment record
    const payment: Payment = {
      id: paymentId,
      booking_id: request.booking_id,
      user_id: userId,
      amount: request.amount,
      currency: request.currency,
      method: request.method,
      status: 'pending',
      phone_number: request.phone_number,
      created_at: new Date(),
      updated_at: new Date()
    };

    payments.set(paymentId, payment);

    // Route to appropriate payment provider
    switch (request.method) {
      case 'mpesa':
        return this.initiateMpesaPayment(payment, request);
      case 'mtn_momo':
        return this.initiateMTNPayment(payment, request);
      case 'airtel_money':
        return this.initiateAirtelPayment(payment, request);
      case 'paypal':
        return this.initiatePayPalPayment(payment, request);
      case 'visa':
      case 'mastercard':
        return this.initiateCardPayment(payment, request);
      default:
        throw new Error(`Unsupported payment method: ${request.method}`);
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerifyResponse> {
    const payment = payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // For demo, simulate verification
    // In production, call the respective payment provider API
    return {
      payment_id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      provider_transaction_id: payment.provider_transaction_id,
      completed_at: payment.completed_at,
      failure_reason: payment.failure_reason
    };
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    return payments.get(paymentId) || null;
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return Array.from(payments.values()).filter(p => p.booking_id === bookingId);
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return Array.from(payments.values()).filter(p => p.user_id === userId);
  }

  // ==================== M-PESA IMPLEMENTATION ====================

  private async initiateMpesaPayment(payment: Payment, request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    if (!request.phone_number) {
      throw new Error('Phone number is required for M-Pesa payment');
    }

    // Format phone number (remove leading 0 or +254)
    const formattedPhone = this.formatKenyanPhone(request.phone_number);

    // In production, this would call the actual M-Pesa API
    // For demo, simulate STK push
    const stkRequest: MpesaSTKPushRequest = {
      phone_number: formattedPhone,
      amount: request.amount,
      account_reference: `TWD-${payment.booking_id.slice(0, 8)}`,
      transaction_desc: 'Twende Bus Ticket Payment'
    };

    // Simulate M-Pesa STK Push
    const stkResponse = await this.simulateMpesaSTKPush(stkRequest);

    // Update payment with M-Pesa reference
    payment.status = 'processing';
    payment.provider_reference = stkResponse.checkout_request_id;
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    return {
      payment_id: payment.id,
      status: 'processing',
      stk_push_sent: true,
      instructions: `Please check your phone ${formattedPhone} for the M-Pesa payment prompt. Enter your PIN to complete the payment.`,
      expires_at: new Date(Date.now() + 60000) // 1 minute expiry
    };
  }

  private async simulateMpesaSTKPush(request: MpesaSTKPushRequest): Promise<MpesaSTKPushResponse> {
    // In production, call actual M-Pesa API:
    // POST https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
    
    return {
      merchant_request_id: `MR-${Date.now()}`,
      checkout_request_id: `CR-${Date.now()}`,
      response_code: '0',
      response_description: 'Success. Request accepted for processing',
      customer_message: 'Success. Request accepted for processing'
    };
  }

  async handleMpesaCallback(data: MpesaCallbackData): Promise<void> {
    // Find payment by checkout_request_id
    const payment = Array.from(payments.values()).find(
      p => p.provider_reference === data.checkout_request_id
    );

    if (!payment) {
      console.error('Payment not found for M-Pesa callback:', data.checkout_request_id);
      return;
    }

    if (data.result_code === 0) {
      payment.status = 'completed';
      payment.provider_transaction_id = data.mpesa_receipt_number;
      payment.completed_at = new Date();
    } else {
      payment.status = 'failed';
      payment.failure_reason = data.result_desc;
    }

    payment.updated_at = new Date();
    payments.set(payment.id, payment);
  }

  private formatKenyanPhone(phone: string): string {
    // Remove any spaces or special characters
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Convert to 254 format
    if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  // ==================== MTN MOMO IMPLEMENTATION ====================

  private async initiateMTNPayment(payment: Payment, request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    if (!request.phone_number) {
      throw new Error('Phone number is required for MTN Mobile Money payment');
    }

    const momoRequest: MTNMomoRequest = {
      phone_number: this.formatRwandanPhone(request.phone_number),
      amount: request.amount,
      currency: request.currency,
      external_id: payment.id,
      payer_message: 'Twende Bus Ticket Payment',
      payee_note: `Booking: ${payment.booking_id}`
    };

    // Simulate MTN MoMo request
    const referenceId = await this.simulateMTNPayment(momoRequest);

    payment.status = 'processing';
    payment.provider_reference = referenceId;
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    return {
      payment_id: payment.id,
      status: 'processing',
      stk_push_sent: true,
      instructions: `Please approve the payment request on your phone ${request.phone_number}. Check your MTN Mobile Money menu.`,
      expires_at: new Date(Date.now() + 120000) // 2 minutes expiry
    };
  }

  private async simulateMTNPayment(request: MTNMomoRequest): Promise<string> {
    // In production, call actual MTN MoMo API:
    // POST https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay
    
    return `MTN-${Date.now()}`;
  }

  private formatRwandanPhone(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleaned.startsWith('+250')) {
      cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('0')) {
      cleaned = '250' + cleaned.substring(1);
    } else if (!cleaned.startsWith('250')) {
      cleaned = '250' + cleaned;
    }
    
    return cleaned;
  }

  // ==================== AIRTEL MONEY IMPLEMENTATION ====================

  private async initiateAirtelPayment(payment: Payment, request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    if (!request.phone_number) {
      throw new Error('Phone number is required for Airtel Money payment');
    }

    const airtelRequest: AirtelMoneyRequest = {
      phone_number: this.formatCongoPhone(request.phone_number),
      amount: request.amount,
      currency: request.currency,
      reference: `TWD-${payment.booking_id.slice(0, 8)}`,
      transaction_id: payment.id
    };

    // Simulate Airtel Money request
    const referenceId = await this.simulateAirtelPayment(airtelRequest);

    payment.status = 'processing';
    payment.provider_reference = referenceId;
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    return {
      payment_id: payment.id,
      status: 'processing',
      stk_push_sent: true,
      instructions: `Please approve the payment request on your phone ${request.phone_number}. Dial *151# to check Airtel Money.`,
      expires_at: new Date(Date.now() + 120000)
    };
  }

  private async simulateAirtelPayment(request: AirtelMoneyRequest): Promise<string> {
    // In production, call actual Airtel Money API
    return `AIRTEL-${Date.now()}`;
  }

  private formatCongoPhone(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleaned.startsWith('+243')) {
      cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('0')) {
      cleaned = '243' + cleaned.substring(1);
    } else if (!cleaned.startsWith('243')) {
      cleaned = '243' + cleaned;
    }
    
    return cleaned;
  }

  // ==================== PAYPAL IMPLEMENTATION ====================

  private async initiatePayPalPayment(payment: Payment, request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    // Convert amount to USD if needed
    const usdAmount = await this.convertToUSD(request.amount, request.currency);

    // Simulate PayPal order creation
    const orderId = await this.simulatePayPalOrder(usdAmount, payment.booking_id);

    payment.status = 'pending';
    payment.provider_reference = orderId;
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    // Generate PayPal checkout URL
    const checkoutUrl = this.paypalEnvironment === 'production'
      ? `https://www.paypal.com/checkoutnow?token=${orderId}`
      : `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;

    return {
      payment_id: payment.id,
      status: 'pending',
      checkout_url: checkoutUrl,
      instructions: 'Click the button to complete your payment securely with PayPal.',
      expires_at: new Date(Date.now() + 3600000) // 1 hour expiry
    };
  }

  private async simulatePayPalOrder(amount: number, bookingId: string): Promise<string> {
    // In production, call actual PayPal API:
    // POST https://api-m.sandbox.paypal.com/v2/checkout/orders
    
    return `PAYPAL-${Date.now()}`;
  }

  async capturePayPalPayment(paymentId: string, paypalOrderId: string): Promise<PaymentVerifyResponse> {
    const payment = payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // In production, call PayPal capture API
    // POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture

    payment.status = 'completed';
    payment.provider_transaction_id = `TXN-${paypalOrderId}`;
    payment.completed_at = new Date();
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    return {
      payment_id: payment.id,
      status: 'completed',
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      provider_transaction_id: payment.provider_transaction_id,
      completed_at: payment.completed_at
    };
  }

  // ==================== CARD PAYMENT IMPLEMENTATION ====================

  private async initiateCardPayment(payment: Payment, request: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    if (!request.card_token && !request.return_url) {
      // Create a Stripe Checkout Session
      const sessionId = await this.createStripeCheckoutSession(payment, request);

      payment.status = 'pending';
      payment.provider_reference = sessionId;
      payment.updated_at = new Date();
      payments.set(payment.id, payment);

      const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

      return {
        payment_id: payment.id,
        status: 'pending',
        checkout_url: checkoutUrl,
        instructions: 'Click to securely enter your card details.',
        expires_at: new Date(Date.now() + 1800000) // 30 minutes expiry
      };
    }

    // Direct card charge with token
    const chargeId = await this.simulateStripeCharge(request.card_token!, payment.amount, payment.currency);

    payment.status = 'completed';
    payment.provider_transaction_id = chargeId;
    payment.card_brand = request.method === 'visa' ? 'Visa' : 'Mastercard';
    payment.completed_at = new Date();
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    return {
      payment_id: payment.id,
      status: 'completed',
      instructions: 'Payment completed successfully!'
    };
  }

  private async createStripeCheckoutSession(payment: Payment, request: PaymentInitiateRequest): Promise<string> {
    // In production, call Stripe API:
    // POST https://api.stripe.com/v1/checkout/sessions
    
    return `cs_${Date.now()}`;
  }

  private async simulateStripeCharge(cardToken: string, amount: number, currency: string): Promise<string> {
    // In production, call Stripe API:
    // POST https://api.stripe.com/v1/charges
    
    return `ch_${Date.now()}`;
  }

  async handleStripeWebhook(event: { type: string; data: { object: { id: string; metadata?: { payment_id?: string } } } }): Promise<void> {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentId = session.metadata?.payment_id;

      if (paymentId) {
        const payment = payments.get(paymentId);
        if (payment) {
          payment.status = 'completed';
          payment.provider_transaction_id = session.id;
          payment.completed_at = new Date();
          payment.updated_at = new Date();
          payments.set(payment.id, payment);
        }
      }
    }
  }

  // ==================== UTILITY METHODS ====================

  private generatePaymentId(): string {
    return `pay_${crypto.randomBytes(16).toString('hex')}`;
  }

  private async convertToUSD(amount: number, currency: PaymentCurrency): Promise<number> {
    // Exchange rates (simplified - use real API in production)
    const rates: Record<PaymentCurrency, number> = {
      'USD': 1,
      'KES': 0.0065,    // 1 KES ≈ 0.0065 USD
      'UGX': 0.00027,   // 1 UGX ≈ 0.00027 USD
      'RWF': 0.00078,   // 1 RWF ≈ 0.00078 USD
      'CDF': 0.00036    // 1 CDF ≈ 0.00036 USD
    };

    return Math.round(amount * rates[currency] * 100) / 100;
  }

  getAvailablePaymentMethods(country: string): PaymentMethod[] {
    return PAYMENT_METHODS_BY_COUNTRY[country] || ['paypal', 'visa', 'mastercard'];
  }

  getPaymentMethodInfo(method: PaymentMethod) {
    return PAYMENT_METHOD_INFO[method];
  }

  // ==================== REFUND METHODS ====================

  async initiateRefund(paymentId: string, reason: string): Promise<Payment> {
    const payment = payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }

    // In production, call respective payment provider refund API
    payment.status = 'refunded';
    payment.metadata = { ...payment.metadata, refund_reason: reason };
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    return payment;
  }

  // ==================== DEMO/SIMULATION METHODS ====================

  async simulatePaymentCompletion(paymentId: string): Promise<Payment> {
    const payment = payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = 'completed';
    payment.provider_transaction_id = `TXN-${Date.now()}`;
    payment.completed_at = new Date();
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    return payment;
  }

  async simulatePaymentFailure(paymentId: string, reason: string): Promise<Payment> {
    const payment = payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = 'failed';
    payment.failure_reason = reason;
    payment.updated_at = new Date();
    payments.set(payment.id, payment);

    return payment;
  }
}

export const paymentService = new PaymentService();




