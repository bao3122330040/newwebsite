// Enhanced Payment Gateway Integration with Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables');
    }
  }

  // Create payment intent
  async createPaymentIntent(amount, currency = "usd", metadata = {}) {
    try {
      if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Convert amount to cents (Stripe expects amounts in cents)
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          ...metadata,
          created_at: new Date().toISOString()
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        status: paymentIntent.status
      };

    } catch (error) {
      console.error('Create payment intent error:', error);
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId, paymentMethodId = null) {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }

      const confirmParams = {};
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      };

    } catch (error) {
      console.error('Confirm payment error:', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId) {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata,
        last_payment_error: paymentIntent.last_payment_error
      };

    } catch (error) {
      console.error('Get payment status error:', error);
      throw new Error(`Failed to retrieve payment status: ${error.message}`);
    }
  }

  // Cancel payment intent
  async cancelPayment(paymentIntentId) {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }

      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        cancellation_reason: paymentIntent.cancellation_reason
      };

    } catch (error) {
      console.error('Cancel payment error:', error);
      throw new Error(`Payment cancellation failed: ${error.message}`);
    }
  }

  // Refund payment
  async refundPayment(paymentIntentId, amount = null, reason = null) {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }

      const refundParams = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      if (reason) {
        refundParams.reason = reason;
      }

      const refund = await stripe.refunds.create(refundParams);

      return {
        success: true,
        refundId: refund.id,
        paymentIntentId: paymentIntentId,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason
      };

    } catch (error) {
      console.error('Refund payment error:', error);
      throw new Error(`Payment refund failed: ${error.message}`);
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return event;

    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw new Error(`Webhook verification failed: ${error.message}`);
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded:', event.data.object.id);
          return { processed: true, type: 'payment_success' };

        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object.id);
          return { processed: true, type: 'payment_failed' };

        case 'payment_intent.canceled':
          console.log('Payment canceled:', event.data.object.id);
          return { processed: true, type: 'payment_canceled' };

        case 'payment_intent.requires_action':
          console.log('Payment requires action:', event.data.object.id);
          return { processed: true, type: 'payment_requires_action' };

        default:
          console.log('Unhandled webhook event type:', event.type);
          return { processed: false, type: 'unhandled' };
      }

    } catch (error) {
      console.error('Webhook event handling error:', error);
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  // Create customer
  async createCustomer(email, name = null, metadata = {}) {
    try {
      const customerParams = { email };
      
      if (name) customerParams.name = name;
      if (Object.keys(metadata).length > 0) customerParams.metadata = metadata;

      const customer = await stripe.customers.create(customerParams);

      return {
        success: true,
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        created: new Date(customer.created * 1000)
      };

    } catch (error) {
      console.error('Create customer error:', error);
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  }

  // Get customer
  async getCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);

      return {
        success: true,
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        created: new Date(customer.created * 1000),
        metadata: customer.metadata
      };

    } catch (error) {
      console.error('Get customer error:', error);
      throw new Error(`Failed to retrieve customer: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
