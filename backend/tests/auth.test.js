// Authentication Tests - Register, Login, Wrong Password
const request = require('supertest');
const app = require('../index');
const { connectDB, disconnectDB } = require('../database/db');

describe('Authentication API', () => {
    let testToken = '';
    const testUser = {
        name: `TestUser_${Date.now()}`,
        email: `testuser_${Date.now()}@example.com`,
        password: 'password123',
        phone: '9800000000'
    };

    // Connect to test DB before running tests
    beforeAll(async () => {
        await connectDB();
    });

    // Disconnect after all tests
    afterAll(async () => {
        await disconnectDB();
    });

    // Test 1: Register a new user
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body.name).toBe(testUser.name);
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.token).toBeDefined();
    });

    // Test 2: Prevent duplicate registration
    it('should return 400 for duplicate email', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send(testUser);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });

    // Test 3: Login with correct credentials
    it('should login and return a JWT token', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.email).toBe(testUser.email);
        testToken = res.body.token;
    });

    // Test 4: Login with wrong password
    it('should return 401 for incorrect password', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });

    // Test 5: Access protected route without token
    it('should return 401 when accessing protected route without token', async () => {
        const res = await request(app)
            .get('/api/bookings/my');

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Not authorized, no token');
    });
});
