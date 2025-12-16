import { paymentService } from '../../services/payment';
import { PaymentMethod, PaymentCurrency } from '../../types';

describe('PaymentService', () => {
  describe('getAvailablePaymentMethods', () => {
    it('should return M-Pesa for Kenya', () => {
      const methods = paymentService.getAvailablePaymentMethods('Kenya');
      expect(methods).toContain('mpesa');
      expect(methods).toContain('paypal');
      expect(methods).toContain('visa');
      expect(methods).toContain('mastercard');
    });

    it('should return MTN MoMo for Rwanda', () => {
      const methods = paymentService.getAvailablePaymentMethods('Rwanda');
      expect(methods).toContain('mtn_momo');
      expect(methods).toContain('paypal');
      expect(methods).not.toContain('mpesa');
    });

    it('should return MTN MoMo and Airtel for Uganda', () => {
      const methods = paymentService.getAvailablePaymentMethods('Uganda');
      expect(methods).toContain('mtn_momo');
      expect(methods).toContain('airtel_money');
    });

    it('should return Airtel Money for DRC', () => {
      const methods = paymentService.getAvailablePaymentMethods('DRC');
      expect(methods).toContain('airtel_money');
      expect(methods).not.toContain('mpesa');
      expect(methods).not.toContain('mtn_momo');
    });

    it('should return default methods for unknown country', () => {
      const methods = paymentService.getAvailablePaymentMethods('Unknown');
      expect(methods).toContain('paypal');
      expect(methods).toContain('visa');
      expect(methods).toContain('mastercard');
    });
  });

  describe('getPaymentMethodInfo', () => {
    it('should return M-Pesa info', () => {
      const info = paymentService.getPaymentMethodInfo('mpesa');
      expect(info).toBeDefined();
      expect(info.name).toBe('M-Pesa');
      expect(info.description).toContain('Safaricom');
    });

    it('should return MTN MoMo info', () => {
      const info = paymentService.getPaymentMethodInfo('mtn_momo');
      expect(info).toBeDefined();
      expect(info.name).toBe('MTN Mobile Money');
    });

    it('should return PayPal info', () => {
      const info = paymentService.getPaymentMethodInfo('paypal');
      expect(info).toBeDefined();
      expect(info.name).toBe('PayPal');
    });

    it('should return Visa info', () => {
      const info = paymentService.getPaymentMethodInfo('visa');
      expect(info).toBeDefined();
      expect(info.name).toBe('Visa');
    });
  });

  describe('initiatePayment', () => {
    const mockUserId = 'user-123';
    
    it('should initiate M-Pesa payment successfully', async () => {
      const request = {
        booking_id: 'booking-123',
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      };

      const response = await paymentService.initiatePayment(request, mockUserId);

      expect(response).toBeDefined();
      expect(response.payment_id).toBeDefined();
      expect(response.status).toBe('processing');
      expect(response.stk_push_sent).toBe(true);
      expect(response.instructions).toContain('254712345678');
    });

    it('should throw error for M-Pesa without phone number', async () => {
      const request = {
        booking_id: 'booking-123',
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod
      };

      await expect(paymentService.initiatePayment(request, mockUserId))
        .rejects.toThrow('Phone number is required for M-Pesa payment');
    });

    it('should initiate MTN MoMo payment successfully', async () => {
      const request = {
        booking_id: 'booking-123',
        amount: 5000,
        currency: 'RWF' as PaymentCurrency,
        method: 'mtn_momo' as PaymentMethod,
        phone_number: '+250788123456'
      };

      const response = await paymentService.initiatePayment(request, mockUserId);

      expect(response).toBeDefined();
      expect(response.payment_id).toBeDefined();
      expect(response.status).toBe('processing');
      expect(response.stk_push_sent).toBe(true);
    });

    it('should initiate Airtel Money payment successfully', async () => {
      const request = {
        booking_id: 'booking-123',
        amount: 10000,
        currency: 'CDF' as PaymentCurrency,
        method: 'airtel_money' as PaymentMethod,
        phone_number: '+243812345678'
      };

      const response = await paymentService.initiatePayment(request, mockUserId);

      expect(response).toBeDefined();
      expect(response.payment_id).toBeDefined();
      expect(response.status).toBe('processing');
    });

    it('should initiate PayPal payment with checkout URL', async () => {
      const request = {
        booking_id: 'booking-123',
        amount: 50,
        currency: 'USD' as PaymentCurrency,
        method: 'paypal' as PaymentMethod
      };

      const response = await paymentService.initiatePayment(request, mockUserId);

      expect(response).toBeDefined();
      expect(response.payment_id).toBeDefined();
      expect(response.status).toBe('pending');
      expect(response.checkout_url).toContain('paypal');
    });

    it('should initiate Visa card payment', async () => {
      const request = {
        booking_id: 'booking-123',
        amount: 100,
        currency: 'USD' as PaymentCurrency,
        method: 'visa' as PaymentMethod,
        return_url: 'https://example.com/return'
      };

      const response = await paymentService.initiatePayment(request, mockUserId);

      expect(response).toBeDefined();
      expect(response.payment_id).toBeDefined();
    });

    it('should throw error for unsupported payment method', async () => {
      const request = {
        booking_id: 'booking-123',
        amount: 100,
        currency: 'USD' as PaymentCurrency,
        method: 'bitcoin' as PaymentMethod
      };

      await expect(paymentService.initiatePayment(request, mockUserId))
        .rejects.toThrow('Unsupported payment method');
    });
  });

  describe('verifyPayment', () => {
    it('should verify existing payment', async () => {
      // First create a payment
      const request = {
        booking_id: 'booking-verify-123',
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      };

      const initResponse = await paymentService.initiatePayment(request, 'user-verify');
      
      // Then verify it
      const verifyResponse = await paymentService.verifyPayment(initResponse.payment_id);

      expect(verifyResponse).toBeDefined();
      expect(verifyResponse.payment_id).toBe(initResponse.payment_id);
      expect(verifyResponse.status).toBe('processing');
      expect(verifyResponse.amount).toBe(1500);
      expect(verifyResponse.currency).toBe('KES');
      expect(verifyResponse.method).toBe('mpesa');
    });

    it('should throw error for non-existent payment', async () => {
      await expect(paymentService.verifyPayment('non-existent-id'))
        .rejects.toThrow('Payment not found');
    });
  });

  describe('getPayment', () => {
    it('should return payment details', async () => {
      const request = {
        booking_id: 'booking-get-123',
        amount: 2000,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      };

      const initResponse = await paymentService.initiatePayment(request, 'user-get');
      const payment = await paymentService.getPayment(initResponse.payment_id);

      expect(payment).toBeDefined();
      expect(payment?.id).toBe(initResponse.payment_id);
      expect(payment?.booking_id).toBe('booking-get-123');
      expect(payment?.user_id).toBe('user-get');
      expect(payment?.amount).toBe(2000);
    });

    it('should return null for non-existent payment', async () => {
      const payment = await paymentService.getPayment('non-existent-id');
      expect(payment).toBeNull();
    });
  });

  describe('simulatePaymentCompletion', () => {
    it('should complete a pending payment', async () => {
      const request = {
        booking_id: 'booking-sim-123',
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      };

      const initResponse = await paymentService.initiatePayment(request, 'user-sim');
      const completedPayment = await paymentService.simulatePaymentCompletion(initResponse.payment_id);

      expect(completedPayment.status).toBe('completed');
      expect(completedPayment.provider_transaction_id).toBeDefined();
      expect(completedPayment.completed_at).toBeDefined();
    });

    it('should throw error for non-existent payment', async () => {
      await expect(paymentService.simulatePaymentCompletion('non-existent-id'))
        .rejects.toThrow('Payment not found');
    });
  });

  describe('simulatePaymentFailure', () => {
    it('should fail a pending payment', async () => {
      const request = {
        booking_id: 'booking-fail-123',
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      };

      const initResponse = await paymentService.initiatePayment(request, 'user-fail');
      const failedPayment = await paymentService.simulatePaymentFailure(
        initResponse.payment_id, 
        'Insufficient funds'
      );

      expect(failedPayment.status).toBe('failed');
      expect(failedPayment.failure_reason).toBe('Insufficient funds');
    });
  });

  describe('initiateRefund', () => {
    it('should refund a completed payment', async () => {
      const request = {
        booking_id: 'booking-refund-123',
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      };

      const initResponse = await paymentService.initiatePayment(request, 'user-refund');
      await paymentService.simulatePaymentCompletion(initResponse.payment_id);
      
      const refundedPayment = await paymentService.initiateRefund(
        initResponse.payment_id, 
        'Customer requested refund'
      );

      expect(refundedPayment.status).toBe('refunded');
    });

    it('should throw error for non-completed payment refund', async () => {
      const request = {
        booking_id: 'booking-refund-fail-123',
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      };

      const initResponse = await paymentService.initiatePayment(request, 'user-refund-fail');
      
      await expect(paymentService.initiateRefund(initResponse.payment_id, 'Test'))
        .rejects.toThrow('Only completed payments can be refunded');
    });
  });

  describe('getPaymentsByBooking', () => {
    it('should return payments for a booking', async () => {
      const bookingId = 'booking-list-123';
      
      // Create multiple payments for the same booking
      await paymentService.initiatePayment({
        booking_id: bookingId,
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      }, 'user-list');

      const payments = await paymentService.getPaymentsByBooking(bookingId);

      expect(payments).toBeDefined();
      expect(payments.length).toBeGreaterThanOrEqual(1);
      expect(payments[0].booking_id).toBe(bookingId);
    });

    it('should return empty array for booking with no payments', async () => {
      const payments = await paymentService.getPaymentsByBooking('non-existent-booking');
      expect(payments).toEqual([]);
    });
  });

  describe('getPaymentsByUser', () => {
    it('should return payments for a user', async () => {
      const userId = 'user-list-by-user';
      
      await paymentService.initiatePayment({
        booking_id: 'booking-user-list-123',
        amount: 1500,
        currency: 'KES' as PaymentCurrency,
        method: 'mpesa' as PaymentMethod,
        phone_number: '+254712345678'
      }, userId);

      const payments = await paymentService.getPaymentsByUser(userId);

      expect(payments).toBeDefined();
      expect(payments.length).toBeGreaterThanOrEqual(1);
      expect(payments[0].user_id).toBe(userId);
    });
  });
});


