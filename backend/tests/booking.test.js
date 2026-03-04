// Booking CRUD Tests - Create, Read, Update, Delete
const request = require('supertest');
const app = require('../index');
const { connectDB, disconnectDB } = require('../database/db');
const User = require('../models/User');

describe('Booking CRUD API', () => {
    let userToken = '';
    let adminToken = '';
    let testCarId = '';
    let testBookingId = '';

    // Connect to test DB
    beforeAll(async () => {
        await connectDB();

        // Register a normal user and get token
        const userRes = await request(app)
            .post('/api/users/register')
            .send({
                name: 'BookingTestUser',
                email: `bookinguser_${Date.now()}@example.com`,
                password: 'password123',
                phone: '9800000001'
            });
        userToken = userRes.body.token;

        // Register admin user
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@carrental.com';
        const adminRes = await request(app)
            .post('/api/users/register')
            .send({
                name: 'AdminTestUser',
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || 'admin123',
                phone: '9800000002'
            });

        // Set admin role in DB (registration defaults to 'user')
        await User.update({ role: 'admin' }, { where: { email: adminEmail } });

        // Login again to get token with updated role
        const loginRes = await request(app)
            .post('/api/users/login')
            .send({
                email: adminEmail,
                password: process.env.ADMIN_PASSWORD || 'admin123'
            });
        adminToken = loginRes.body.token;

        // Admin creates a car for booking tests
        const carRes = await request(app)
            .post('/api/cars')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Sedan',
                brand: 'Toyota',
                model: 'Camry',
                year: 2025,
                pricePerDay: 100,
                registrationNumber: `TEST-${Date.now()}`,
                description: 'A car for testing bookings',
                stock: 5
            });
        testCarId = carRes.body.id;
    });

    afterAll(async () => {
        await disconnectDB();
    });

    // Test 1: CREATE - Book a car successfully
    it('should create a new booking', async () => {
        const res = await request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                carId: testCarId,
                startDate: '2026-04-01',
                endDate: '2026-04-05',
                totalAmount: 400
            });

        expect(res.status).toBe(201);
        expect(res.body.carId).toBe(testCarId);
        expect(res.body.status).toBe('pending');
        expect(res.body.quantity).toBe(1);
        testBookingId = res.body.id;
    });

    // Test 2: READ - Get my bookings
    it('should return the user bookings list', async () => {
        const res = await request(app)
            .get('/api/bookings/my')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].Car).toBeDefined();
    });

    // Test 3: UPDATE - Edit booking dates (auto-recalculates total)
    it('should update booking dates and recalculate total', async () => {
        const res = await request(app)
            .put(`/api/bookings/${testBookingId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                startDate: '2026-04-01',
                endDate: '2026-04-14'
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Booking updated successfully');
        // 13 days * $100/day * 1 quantity = $1300
        expect(parseFloat(res.body.booking.totalAmount)).toBe(1300);
    });

    // Test 4: UPDATE - Fail to update non-existent booking
    it('should return 404 for updating a non-existent booking', async () => {
        const res = await request(app)
            .put('/api/bookings/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                startDate: '2026-05-01',
                endDate: '2026-05-05'
            });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Booking not found');
    });

    // Test 5: DELETE - Cancel booking and restore stock
    it('should delete booking and restore car stock', async () => {
        const res = await request(app)
            .delete(`/api/bookings/${testBookingId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Booking deleted and stock restored');
    });

    // Test 6: Verify booking is gone after deletion
    it('should return empty list after booking is deleted', async () => {
        const res = await request(app)
            .get('/api/bookings/my')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
    });

    // Test 7: Fail to book an out-of-stock car
    it('should return 400 when booking an out-of-stock car', async () => {
        // Update car stock to 0 via admin
        await request(app)
            .put(`/api/cars/${testCarId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ stock: 0 });

        const res = await request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                carId: testCarId,
                startDate: '2026-05-01',
                endDate: '2026-05-03',
                totalAmount: 200
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('out of stock');
    });
});
