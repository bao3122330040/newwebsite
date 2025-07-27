const express = require('express');
const Joi = require('joi');
const paymentService = require('../paymentService');
const dbService = require('../services/dbService');

const router = express.Router();

// Validation schemas
const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('usd'),
  productId: Joi.number().integer().positive(),
  userId: Joi.number().integer().positive(),
  metadata: Joi.object().default({})
});

const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
  paymentMethodId: Joi.string()
});

const refundPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
  amount: Joi.number().positive(),
  reason: Joi.string().valid('duplicate', 'fraudulent', 'requested_by_customer')
});

// Middleware to verify JWT token (reuse from auth routes)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const jwt = require('jsonwebtoken');
    const authService = require('../auth/authService');
    
    const decoded = authService.verifyToken(token);
    const user = await dbService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token - user not found',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({
      error: true,
      message: 'Invalid or expired token',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};

// POST /api/payment/create-intent - Create payment intent
router.post('/create-intent', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createPaymentIntentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: error.details.map(detail => detail.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { amount, currency, productId, userId, metadata } = value;

    // Verify user authorization
    if (userId && userId !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to create payment for another user',
        code: 'UNAUTHORIZED'
      });
    }

    // Verify product exists if productId provided
    let product = null;
    if (productId) {
      product = await dbService.getProductById(productId);
      if (!product) {
        return res.status(404).json({
          error: true,
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      // Verify amount matches product price
      if (Math.abs(amount - parseFloat(product.price)) > 0.01) {
        return res.status(400).json({
          error: true,
          message: 'Amount does not match product price',
          code: 'AMOUNT_MISMATCH'
        });
      }
    }

    // Add user and product info to metadata
    const enrichedMetadata = {
      ...metadata,
      userId: req.user.id,
      username: req.user.username,
      userEmail: req.user.email,
      ...(product && {
        productId: product.id,
        productName: product.name,
        productCategory: product.category
      })
    };

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      amount,
      currency,
      enrichedMetadata
    );

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      data: paymentIntent
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to create payment intent',
      code: 'PAYMENT_INTENT_ERROR'
    });
  }
});

// POST /api/payment/confirm - Confirm payment
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = confirmPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: error.details.map(detail => detail.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { paymentIntentId, paymentMethodId } = value;

    // Get payment intent to verify ownership
    const paymentStatus = await paymentService.getPaymentStatus(paymentIntentId);
    
    if (paymentStatus.metadata && paymentStatus.metadata.userId) {
      const paymentUserId = parseInt(paymentStatus.metadata.userId);
      if (paymentUserId !== req.user.id) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to confirm this payment',
          code: 'UNAUTHORIZED'
        });
      }
    }

    // Confirm payment
    const confirmedPayment = await paymentService.confirmPayment(
      paymentIntentId,
      paymentMethodId
    );

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: confirmedPayment
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to confirm payment',
      code: 'PAYMENT_CONFIRMATION_ERROR'
    });
  }
});

// GET /api/payment/status/:id - Check payment status
router.get('/status/:id', authenticateToken, async (req, res) => {
  try {
    const paymentIntentId = req.params.id;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: true,
        message: 'Payment intent ID is required',
        code: 'MISSING_PAYMENT_ID'
      });
    }

    // Get payment status
    const paymentStatus = await paymentService.getPaymentStatus(paymentIntentId);

    // Verify user authorization
    if (paymentStatus.metadata && paymentStatus.metadata.userId) {
      const paymentUserId = parseInt(paymentStatus.metadata.userId);
      if (paymentUserId !== req.user.id) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to view this payment',
          code: 'UNAUTHORIZED'
        });
      }
    }

    res.json({
      success: true,
      data: paymentStatus
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to retrieve payment status',
      code: 'PAYMENT_STATUS_ERROR'
    });
  }
});

// POST /api/payment/cancel/:id - Cancel payment
router.post('/cancel/:id', authenticateToken, async (req, res) => {
  try {
    const paymentIntentId = req.params.id;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: true,
        message: 'Payment intent ID is required',
        code: 'MISSING_PAYMENT_ID'
      });
    }

    // Get payment status to verify ownership
    const paymentStatus = await paymentService.getPaymentStatus(paymentIntentId);
    
    if (paymentStatus.metadata && paymentStatus.metadata.userId) {
      const paymentUserId = parseInt(paymentStatus.metadata.userId);
      if (paymentUserId !== req.user.id) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to cancel this payment',
          code: 'UNAUTHORIZED'
        });
      }
    }

    // Cancel payment
    const canceledPayment = await paymentService.cancelPayment(paymentIntentId);

    res.json({
      success: true,
      message: 'Payment canceled successfully',
      data: canceledPayment
    });

  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to cancel payment',
      code: 'PAYMENT_CANCEL_ERROR'
    });
  }
});

// POST /api/payment/refund - Refund payment (admin only or specific conditions)
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = refundPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: error.details.map(detail => detail.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { paymentIntentId, amount, reason } = value;

    // Get payment status to verify ownership
    const paymentStatus = await paymentService.getPaymentStatus(paymentIntentId);
    
    if (paymentStatus.metadata && paymentStatus.metadata.userId) {
      const paymentUserId = parseInt(paymentStatus.metadata.userId);
      if (paymentUserId !== req.user.id) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to refund this payment',
          code: 'UNAUTHORIZED'
        });
      }
    }

    // Check if payment is in a refundable state
    if (paymentStatus.status !== 'succeeded') {
      return res.status(400).json({
        error: true,
        message: 'Payment is not in a refundable state',
        code: 'NOT_REFUNDABLE'
      });
    }

    // Process refund
    const refund = await paymentService.refundPayment(paymentIntentId, amount, reason);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: refund
    });

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to process refund',
      code: 'REFUND_ERROR'
    });
  }
});

// POST /api/payment/webhook - Handle payment webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({
        error: true,
        message: 'Missing stripe signature',
        code: 'MISSING_SIGNATURE'
      });
    }

    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(req.body, signature);

    // Handle the event
    const result = await paymentService.handleWebhookEvent(event);

    // Log the event for monitoring
    console.log(`Webhook processed: ${event.type}`, {
      eventId: event.id,
      processed: result.processed,
      type: result.type
    });

    // Respond to Stripe
    res.json({
      success: true,
      message: 'Webhook processed',
      eventType: event.type,
      processed: result.processed
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({
      error: true,
      message: error.message || 'Webhook processing failed',
      code: 'WEBHOOK_ERROR'
    });
  }
});

// GET /api/payment/methods - Get user's payment methods (future enhancement)
router.get('/methods', authenticateToken, async (req, res) => {
  try {
    // This would require storing customer IDs and implementing payment method retrieval
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Payment methods endpoint - not yet implemented',
      data: {
        paymentMethods: []
      }
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve payment methods',
      code: 'PAYMENT_METHODS_ERROR'
    });
  }
});

module.exports = router;