import request from 'supertest';
import express from 'express';
import paymentRoutes from '../../routes/payments';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

// Generate a test JWT token
const generateTestToken = (userId: string = 'test-user-123') => {
  return jwt.sign(
    { userId, email: 'test@example.com' },
    process.env.JWT_SECRET || 'test-jwt-secret-key',
    { expiresIn: '1h' }
  );
};

describe('Payment Routes', () => {
  describe('GET /api/payments/methods', () => {
    it('should return all payment methods without country filter', async () => {
      const response = await request(app)
        .get('/api/payments/methods')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.methods).toBeDefined();
      expect(Array.isArray(response.body.data.methods)).toBe(true);
      expect(response.body.data.by_country).toBeDefined();
    });

    it('should return payment methods for Kenya', async () => {
      const response = await request(app)
        .get('/api/payments/methods')
        .query({ country: 'Kenya' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.country).toBe('Kenya');
      expect(response.body.data.methods).toBeDefined();
      
      const methodIds = response.body.data.methods.map((m: { id: string }) => m.id);
      expect(methodIds).toContain('mpesa');
    });

    it('should return payment methods for Rwanda', async () => {
      const response = await request(app)
        .get('/api/payments/methods')
        .query({ country: 'Rwanda' })
        .expect(200);

      const methodIds = response.body.data.methods.map((m: { id: string }) => m.id);
      expect(methodIds).toContain('mtn_momo');
      expect(methodIds).not.toContain('mpesa');
    });

    it('should return payment methods for DRC', async () => {
      const response = await request(app)
        .get('/api/payments/methods')
        .query({ country: 'DRC' })
        .expect(200);

      const methodIds = response.body.data.methods.map((m: { id: string }) => m.id);
      expect(methodIds).toContain('airtel_money');
    });
  });

  describe('POST /api/payments/initiate', () => {
    const validToken = generateTestToken();

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .send({
          booking_id: 'booking-123',
          amount: 1500,
          currency: 'KES',
          method: 'mpesa',
          phone_number: '+254712345678'
        })
        .expect(401);

      expect(response.body.message).toContain('token');
    });

    it('should initiate M-Pesa payment with valid data', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-123',
          amount: 1500,
          currency: 'KES',
          method: 'mpesa',
          phone_number: '+254712345678'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment_id).toBeDefined();
      expect(response.body.data.status).toBe('processing');
    });

    it('should require phone number for mobile money', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-123',
          amount: 1500,
          currency: 'KES',
          method: 'mpesa'
          // phone_number missing
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Phone number');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate currency', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-123',
          amount: 1500,
          currency: 'INVALID',
          method: 'mpesa',
          phone_number: '+254712345678'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate payment method', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-123',
          amount: 1500,
          currency: 'KES',
          method: 'bitcoin', // Invalid method
          phone_number: '+254712345678'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate amount is positive', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-123',
          amount: -100,
          currency: 'KES',
          method: 'mpesa',
          phone_number: '+254712345678'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should initiate PayPal payment', async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-paypal-123',
          amount: 50,
          currency: 'USD',
          method: 'paypal'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.checkout_url).toBeDefined();
    });
  });

  describe('GET /api/payments/:paymentId/verify', () => {
    const validToken = generateTestToken();
    let paymentId: string;

    beforeAll(async () => {
      // Create a payment first
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-verify-test',
          amount: 1500,
          currency: 'KES',
          method: 'mpesa',
          phone_number: '+254712345678'
        });
      
      paymentId = response.body.data.payment_id;
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/payments/${paymentId}/verify`)
        .expect(401);
    });

    it('should verify existing payment', async () => {
      const response = await request(app)
        .get(`/api/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payment_id).toBe(paymentId);
      expect(response.body.data.status).toBeDefined();
    });
  });

  describe('POST /api/payments/:paymentId/simulate/complete', () => {
    const validToken = generateTestToken();
    let paymentId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-sim-complete',
          amount: 1500,
          currency: 'KES',
          method: 'mpesa',
          phone_number: '+254712345678'
        });
      
      paymentId = response.body.data.payment_id;
    });

    it('should simulate payment completion', async () => {
      const response = await request(app)
        .post(`/api/payments/${paymentId}/simulate/complete`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('POST /api/payments/:paymentId/simulate/fail', () => {
    const validToken = generateTestToken();
    let paymentId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-sim-fail',
          amount: 1500,
          currency: 'KES',
          method: 'mpesa',
          phone_number: '+254712345678'
        });
      
      paymentId = response.body.data.payment_id;
    });

    it('should simulate payment failure', async () => {
      const response = await request(app)
        .post(`/api/payments/${paymentId}/simulate/fail`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ reason: 'Test failure' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('failed');
    });
  });

  describe('POST /api/payments/:paymentId/refund', () => {
    const validToken = generateTestToken();
    let paymentId: string;

    beforeAll(async () => {
      // Create and complete a payment
      const initResponse = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          booking_id: 'booking-refund-test',
          amount: 1500,
          currency: 'KES',
          method: 'mpesa',
          phone_number: '+254712345678'
        });
      
      paymentId = initResponse.body.data.payment_id;

      // Complete the payment
      await request(app)
        .post(`/api/payments/${paymentId}/simulate/complete`)
        .set('Authorization', `Bearer ${validToken}`);
    });

    it('should require reason for refund', async () => {
      const response = await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should refund completed payment', async () => {
      const response = await request(app)
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ reason: 'Customer requested refund' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('refunded');
    });
  });

  describe('Webhook endpoints', () => {
    describe('POST /api/payments/webhooks/mpesa', () => {
      it('should handle M-Pesa callback', async () => {
        const response = await request(app)
          .post('/api/payments/webhooks/mpesa')
          .send({
            Body: {
              stkCallback: {
                MerchantRequestID: 'MR-123',
                CheckoutRequestID: 'CR-123',
                ResultCode: 0,
                ResultDesc: 'Success'
              }
            }
          })
          .expect(200);

        expect(response.body.ResultCode).toBe(0);
      });
    });

    describe('POST /api/payments/webhooks/stripe', () => {
      it('should handle Stripe webhook', async () => {
        const response = await request(app)
          .post('/api/payments/webhooks/stripe')
          .send({
            type: 'checkout.session.completed',
            data: {
              object: {
                id: 'session-123',
                metadata: {}
              }
            }
          })
          .expect(200);

        expect(response.body.received).toBe(true);
      });
    });

    describe('POST /api/payments/webhooks/mtn', () => {
      it('should handle MTN callback', async () => {
        const response = await request(app)
          .post('/api/payments/webhooks/mtn')
          .send({ status: 'completed' })
          .expect(200);

        expect(response.body.status).toBe('received');
      });
    });

    describe('POST /api/payments/webhooks/airtel', () => {
      it('should handle Airtel callback', async () => {
        const response = await request(app)
          .post('/api/payments/webhooks/airtel')
          .send({ status: 'completed' })
          .expect(200);

        expect(response.body.status).toBe('received');
      });
    });
  });
});


