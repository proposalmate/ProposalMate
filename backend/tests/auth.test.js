const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

let token;

// Connect to test database before running tests
beforeAll(async () => {
  // Use a test database
  const testDB = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/proposalmate_test';
  await mongoose.connect(testDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Clean up database after tests
afterAll(async () => {
  // Remove test user
  await User.deleteMany({});
  // Close database connection
  await mongoose.connection.close();
});

describe('Auth API', () => {
  // Test user registration
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      
      // Save token for later tests
      token = res.body.token;
    });
    
    it('should not register a user with existing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });
  
  // Test user login
  describe('POST /api/v1/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });
    
    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
  
  // Test get current user
  describe('GET /api/v1/auth/me', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('name', testUser.name);
      expect(res.body.data).toHaveProperty('email', testUser.email);
    });
    
    it('should not access profile without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
