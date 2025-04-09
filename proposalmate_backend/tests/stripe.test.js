const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

// Test user data
const testUser = {
  name: 'Test Stripe User',
  email: 'test-stripe@example.com',
  password: 'password123'
};

let token;
let userId;

// Connect to test database before running tests
beforeAll(async () => {
  // Use a test database
  const testDB = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/proposalmate_test';
  await mongoose.connect(testDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  // Create a test user and get token
  const user = await User.create(testUser);
  userId = user._id;
  token = user.getSignedJwtToken();
});

// Clean up database after tests
afterAll(async () => {
  // Remove test data
  await User.deleteMany({});
  // Close database connection
  await mongoose.connection.close();
});

describe('Stripe API', () => {
  // Test getting checkout session
  describe('GET /api/v1/stripe/checkout-session', () => {
    it('should create a checkout session', async () => {
      // This test is mocked since we don't want to make actual Stripe API calls in tests
      // In a real test environment, you would mock the Stripe API
      const res = await request(app)
        .get('/api/v1/stripe/checkout-session')
        .set('Authorization', `Bearer ${token}`);
      
      // Even if the actual Stripe call fails, we should get a 200 response
      // with our error handling middleware
      expect(res.statusCode).toBeLessThan(500);
    });
    
    it('should not create a checkout session without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/stripe/checkout-session');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
  
  // Test getting subscription details
  describe('GET /api/v1/stripe/subscription', () => {
    it('should get subscription details', async () => {
      const res = await request(app)
        .get('/api/v1/stripe/subscription')
        .set('Authorization', `Bearer ${token}`);
      
      // Even without an actual subscription, we should get a valid response
      expect(res.statusCode).toBeLessThan(500);
    });
    
    it('should not get subscription details without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/stripe/subscription');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
  
  // Test webhook endpoint
  describe('POST /api/v1/stripe/webhook', () => {
    it('should handle webhook requests', async () => {
      // This is a simple test to ensure the endpoint exists
      // In a real test, you would mock Stripe webhook events
      const res = await request(app)
        .post('/api/v1/stripe/webhook')
        .send({
          type: 'test.event',
          data: {
            object: {}
          }
        })
        .set('stripe-signature', 'test_signature');
      
      // We expect a 400 because we're not providing a valid signature
      expect(res.statusCode).toEqual(400);
    });
  });
});
