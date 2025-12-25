import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { paymentService } from '../services/payment.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { 
  PaymentMethod, 
  PaymentCurrency,
  PAYMENT_METHODS_BY_COUNTRY,
  PAYMENT_METHOD_INFO 
} from '../types/index.js';

// Use AuthenticatedRequest from middleware
type AuthRequest = AuthenticatedRequest;

const router = Router();

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ==================== GET AVAILABLE PAYMENT METHODS ====================

/**
 * GET /api/payments/methods
 * Get available payment methods (optionally filtered by country)
 */
router.get('/methods', [
  query('country').optional().isString()
], validate, async (req: Request, res: Response) => {
  try {
    const country = req.query.country as string;

    if (country) {
      const methods = paymentService.getAvailablePaymentMethods(country);
      const methodsWithInfo = methods.map(method => ({
        id: method,
        ...paymentService.getPaymentMethodInfo(method)
      }));

      return res.json({
        success: true,
        data: {
          country,
          methods: methodsWithInfo
        }
      });
    }

    // Return all methods with country availability
    const allMethods = Object.entries(PAYMENT_METHOD_INFO).map(([id, info]) => ({
      id,
      ...info,
      available_in: Object.entries(PAYMENT_METHODS_BY_COUNTRY)
        .filter(([_, methods]) => methods.includes(id as PaymentMethod))
        .map(([country]) => country)
    }));

    res.json({
      success: true,
      data: {
        methods: allMethods,
        by_country: PAYMENT_METHODS_BY_COUNTRY
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payment methods' });
  }
});

// ==================== INITIATE PAYMENT ====================

/**
 * POST /api/payments/initiate
 * Initiate a new payment
 */
router.post('/initiate', authenticate, [
  body('booking_id').notEmpty().withMessage('Booking ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['KES', 'UGX', 'RWF', 'USD', 'CDF']).withMessage('Invalid currency'),
  body('method').isIn(['mpesa', 'mtn_momo', 'airtel_money', 'paypal', 'visa', 'mastercard']).withMessage('Invalid payment method'),
  body('phone_number').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('return_url').optional().isURL().withMessage('Invalid return URL'),
  body('callback_url').optional().isURL().withMessage('Invalid callback URL')
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, amount, currency, method, phone_number, card_token, return_url, callback_url } = req.body;
    const userId = req.user!.userId;

    // Validate phone number for mobile money payments
    if (['mpesa', 'mtn_momo', 'airtel_money'].includes(method) && !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required for mobile money payments'
      });
    }

    const response = await paymentService.initiatePayment({
      booking_id,
      amount,
      currency: currency as PaymentCurrency,
      method: method as PaymentMethod,
      phone_number,
      card_token,
      return_url,
      callback_url
    }, userId);

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: response
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to initiate payment' 
    });
  }
});

// ==================== VERIFY PAYMENT ====================

/**
 * GET /api/payments/:paymentId/verify
 * Verify payment status
 */
router.get('/:paymentId/verify', authenticate, [
  param('paymentId').notEmpty().withMessage('Payment ID is required')
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;

    const verification = await paymentService.verifyPayment(paymentId);

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to verify payment' 
    });
  }
});

// ==================== GET PAYMENT DETAILS ====================

/**
 * GET /api/payments/:paymentId
 * Get payment details
 */
router.get('/:paymentId', authenticate, [
  param('paymentId').notEmpty().withMessage('Payment ID is required')
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user!.userId;

    const payment = await paymentService.getPayment(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Ensure user owns this payment
    if (payment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this payment'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payment' });
  }
});

// ==================== GET USER'S PAYMENTS ====================

/**
 * GET /api/payments
 * Get all payments for authenticated user
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const payments = await paymentService.getPaymentsByUser(userId);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payments' });
  }
});

// ==================== GET PAYMENTS BY BOOKING ====================

/**
 * GET /api/payments/booking/:bookingId
 * Get all payments for a booking
 */
router.get('/booking/:bookingId', authenticate, [
  param('bookingId').notEmpty().withMessage('Booking ID is required')
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const payments = await paymentService.getPaymentsByBooking(bookingId);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get booking payments error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payments' });
  }
});

// ==================== PAYPAL CAPTURE ====================

/**
 * POST /api/payments/:paymentId/paypal/capture
 * Capture PayPal payment after user approval
 */
router.post('/:paymentId/paypal/capture', authenticate, [
  param('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('paypal_order_id').notEmpty().withMessage('PayPal order ID is required')
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { paypal_order_id } = req.body;

    const result = await paymentService.capturePayPalPayment(paymentId, paypal_order_id);

    res.json({
      success: true,
      message: 'Payment captured successfully',
      data: result
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to capture PayPal payment' 
    });
  }
});

// ==================== REFUND PAYMENT ====================

/**
 * POST /api/payments/:paymentId/refund
 * Request a refund for a payment
 */
router.post('/:paymentId/refund', authenticate, [
  param('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('reason').notEmpty().withMessage('Refund reason is required')
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const userId = req.user!.userId;

    // Get payment and verify ownership
    const payment = await paymentService.getPayment(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to refund this payment'
      });
    }

    const refundedPayment = await paymentService.initiateRefund(paymentId, reason);

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: refundedPayment
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to process refund' 
    });
  }
}
);

// ==================== WEBHOOK ENDPOINTS ====================

/**
 * POST /api/payments/webhooks/mpesa
 * M-Pesa callback webhook
 */
router.post('/webhooks/mpesa', async (req: Request, res: Response) => {
  try {
    const callbackData = req.body.Body?.stkCallback;
    
    if (callbackData) {
      await paymentService.handleMpesaCallback({
        merchant_request_id: callbackData.MerchantRequestID,
        checkout_request_id: callbackData.CheckoutRequestID,
        result_code: callbackData.ResultCode,
        result_desc: callbackData.ResultDesc,
        amount: callbackData.CallbackMetadata?.Item?.find((i: { Name: string }) => i.Name === 'Amount')?.Value,
        mpesa_receipt_number: callbackData.CallbackMetadata?.Item?.find((i: { Name: string }) => i.Name === 'MpesaReceiptNumber')?.Value,
        transaction_date: callbackData.CallbackMetadata?.Item?.find((i: { Name: string }) => i.Name === 'TransactionDate')?.Value,
        phone_number: callbackData.CallbackMetadata?.Item?.find((i: { Name: string }) => i.Name === 'PhoneNumber')?.Value
      });
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa webhook error:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
});

/**
 * POST /api/payments/webhooks/stripe
 * Stripe webhook for card payments
 */
router.post('/webhooks/stripe', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    // In production, verify webhook signature with Stripe
    await paymentService.handleStripeWebhook(event);

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/payments/webhooks/mtn
 * MTN MoMo callback webhook
 */
router.post('/webhooks/mtn', async (req: Request, res: Response) => {
  try {
    // Handle MTN MoMo callback
    console.log('MTN callback received:', req.body);
    res.json({ status: 'received' });
  } catch (error) {
    console.error('MTN webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/payments/webhooks/airtel
 * Airtel Money callback webhook
 */
router.post('/webhooks/airtel', async (req: Request, res: Response) => {
  try {
    // Handle Airtel Money callback
    console.log('Airtel callback received:', req.body);
    res.json({ status: 'received' });
  } catch (error) {
    console.error('Airtel webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ==================== DEMO/TEST ENDPOINTS ====================

/**
 * POST /api/payments/:paymentId/simulate/complete
 * Simulate payment completion (for testing)
 */
router.post('/:paymentId/simulate/complete', authenticate, [
  param('paymentId').notEmpty().withMessage('Payment ID is required')
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentService.simulatePaymentCompletion(paymentId);

    res.json({
      success: true,
      message: 'Payment simulated as completed',
      data: payment
    });
  } catch (error) {
    console.error('Simulate completion error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to simulate payment' 
    });
  }
});

/**
 * POST /api/payments/:paymentId/simulate/fail
 * Simulate payment failure (for testing)
 */
router.post('/:paymentId/simulate/fail', authenticate, [
  param('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('reason').optional().isString()
], validate, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const payment = await paymentService.simulatePaymentFailure(paymentId, reason || 'Simulated failure');

    res.json({
      success: true,
      message: 'Payment simulated as failed',
      data: payment
    });
  } catch (error) {
    console.error('Simulate failure error:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to simulate payment' 
    });
  }
});

export default router;


