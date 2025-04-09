const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Proposal = require('../src/models/Proposal');

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test-proposals@example.com',
  password: 'password123'
};

// Test proposal data
const testProposal = {
  title: 'Test Proposal',
  client: {
    name: 'Test Client',
    email: 'client@example.com',
    company: 'Test Company'
  },
  projectDetails: {
    description: 'This is a test project description',
    scope: 'Test scope of work'
  },
  pricing: {
    total: 1000,
    currency: 'GBP'
  }
};

let token;
let userId;
let proposalId;

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
  
  // Set user as in trial period
  user.subscriptionStatus = 'trialing';
  user.trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  await user.save();
  
  token = user.getSignedJwtToken();
});

// Clean up database after tests
afterAll(async () => {
  // Remove test data
  await User.deleteMany({});
  await Proposal.deleteMany({});
  // Close database connection
  await mongoose.connection.close();
});

describe('Proposals API', () => {
  // Test creating a proposal
  describe('POST /api/v1/proposals', () => {
    it('should create a new proposal', async () => {
      const res = await request(app)
        .post('/api/v1/proposals')
        .set('Authorization', `Bearer ${token}`)
        .send(testProposal);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('title', testProposal.title);
      expect(res.body.data).toHaveProperty('user', userId.toString());
      
      // Save proposal ID for later tests
      proposalId = res.body.data._id;
    });
    
    it('should not create a proposal without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/proposals')
        .send(testProposal);
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
  
  // Test getting all proposals
  describe('GET /api/v1/proposals', () => {
    it('should get all user proposals', async () => {
      const res = await request(app)
        .get('/api/v1/proposals')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('count');
      expect(res.body.count).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
    
    it('should not get proposals without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/proposals');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
  
  // Test getting a single proposal
  describe('GET /api/v1/proposals/:id', () => {
    it('should get a single proposal by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/proposals/${proposalId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', proposalId);
      expect(res.body.data).toHaveProperty('title', testProposal.title);
    });
    
    it('should not get a proposal with invalid ID', async () => {
      const res = await request(app)
        .get('/api/v1/proposals/invalidid')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
  
  // Test updating a proposal
  describe('PUT /api/v1/proposals/:id', () => {
    it('should update a proposal', async () => {
      const updatedData = {
        title: 'Updated Test Proposal',
        client: {
          name: 'Updated Client',
          email: 'updated@example.com'
        }
      };
      
      const res = await request(app)
        .put(`/api/v1/proposals/${proposalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('title', updatedData.title);
      expect(res.body.data.client).toHaveProperty('name', updatedData.client.name);
    });
  });
  
  // Test PDF generation endpoint
  describe('GET /api/v1/proposals/:id/pdf', () => {
    it('should generate a PDF for a proposal', async () => {
      const res = await request(app)
        .get(`/api/v1/proposals/${proposalId}/pdf`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('application/pdf');
      expect(res.headers['content-disposition']).toContain(`proposal-${proposalId}.pdf`);
    });
  });
  
  // Test deleting a proposal
  describe('DELETE /api/v1/proposals/:id', () => {
    it('should delete a proposal', async () => {
      const res = await request(app)
        .delete(`/api/v1/proposals/${proposalId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toEqual({});
      
      // Verify proposal is deleted
      const checkRes = await request(app)
        .get(`/api/v1/proposals/${proposalId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(checkRes.statusCode).toEqual(404);
    });
  });
});
