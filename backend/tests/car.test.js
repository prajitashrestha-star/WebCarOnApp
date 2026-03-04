// Car CRUD Tests - Create, Read, Update, Delete
const request = require('supertest');
const app = require('../index');
const { connectDB, disconnectDB } = require('../database/db');
const User = require('../models/User');

describe('Car CRUD API', () => {
    let adminToken = '';
    let userToken = '';
    let testCarId = '';

    // Connect to test DB and create admin + user tokens
    beforeAll(async () => {
        await connectDB();

        // Register admin
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@carrental.com';
        await request(app)
            .post('/api/users/register')
            .send({
                name: 'CarAdminUser',
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || 'admin123',
                phone: '9800000010'
            });

        // Set admin role in DB (registration defaults to 'user')
        await User.update({ role: 'admin' }, { where: { email: adminEmail } });

        // Login to get admin token
        const adminLogin = await request(app)
            .post('/api/users/login')
            .send({
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || 'admin123'
            });
        adminToken = adminLogin.body.token;

        // Register normal user
        const userRes = await request(app)
            .post('/api/users/register')
            .send({
                name: 'CarNormalUser',
                email: `caruser_${Date.now()}@example.com`,
                password: 'password123',
                phone: '9800000011'
            });
        userToken = userRes.body.token;
    });

    afterAll(async () => {
        await disconnectDB();
    });

    // Test 1: CREATE - Admin adds a new car
    it('should create a new car (admin only)', async () => {
        const res = await request(app)
            .post('/api/cars')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Model X',
                brand: 'Tesla',
                model: 'X',
                year: 2026,
                pricePerDay: 200,
                registrationNumber: `CAR-${Date.now()}`,
                description: 'Electric SUV',
                stock: 3
            });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Model X');
        expect(res.body.brand).toBe('Tesla');
        expect(res.body.stock).toBe(3);
        testCarId = res.body.id;
    });

    // Test 2: CREATE - Normal user cannot add a car
    it('should return 403 when normal user tries to create a car', async () => {
        const res = await request(app)
            .post('/api/cars')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Hacker Car',
                brand: 'Fake',
                model: 'None',
                year: 2026,
                pricePerDay: 10,
                registrationNumber: 'HACK-001',
                stock: 1
            });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Not authorized as an admin');
    });

    // Test 3: READ - Get all cars (public)
    it('should get all available cars', async () => {
        const res = await request(app)
            .get('/api/cars');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    // Test 4: READ - Get a single car by ID
    it('should get a single car by ID', async () => {
        const res = await request(app)
            .get(`/api/cars/${testCarId}`);

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Model X');
        expect(parseFloat(res.body.pricePerDay)).toBe(200);
    });

    // Test 5: UPDATE - Admin updates a car
    it('should update car details (admin only)', async () => {
        const res = await request(app)
            .put(`/api/cars/${testCarId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                pricePerDay: 250,
                stock: 10
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Car updated successfully');
        expect(parseFloat(res.body.car.pricePerDay)).toBe(250);
        expect(res.body.car.stock).toBe(10);
    });

    // Test 6: UPDATE - Normal user cannot update a car
    it('should return 403 when normal user tries to update a car', async () => {
        const res = await request(app)
            .put(`/api/cars/${testCarId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ pricePerDay: 1 });

        expect(res.status).toBe(403);
    });

    // Test 7: DELETE - Admin deletes a car with no bookings
    it('should delete a car with no bookings (admin only)', async () => {
        const res = await request(app)
            .delete(`/api/cars/${testCarId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Car removed successfully');
    });

    // Test 8: Verify car is actually gone
    it('should return 404 for deleted car', async () => {
        const res = await request(app)
            .get(`/api/cars/${testCarId}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Car not found');
    });

    // Test 9: DELETE - Cannot delete car that has bookings
    it('should return 400 when deleting a car with existing bookings', async () => {
        // First create a car
        const carRes = await request(app)
            .post('/api/cars')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Booked Car',
                brand: 'Honda',
                model: 'Civic',
                year: 2025,
                pricePerDay: 80,
                registrationNumber: `BOOKED-${Date.now()}`,
                stock: 2
            });
        const bookedCarId = carRes.body.id;

        // Book it as user
        await request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                carId: bookedCarId,
                startDate: '2026-06-01',
                endDate: '2026-06-03',
                totalAmount: 160
            });

        // Try to delete it as admin
        const res = await request(app)
            .delete(`/api/cars/${bookedCarId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('cannot be deleted');
        expect(res.body.message).toContain('existing bookings');
    });
});
