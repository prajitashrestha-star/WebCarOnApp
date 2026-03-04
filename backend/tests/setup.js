const { connectDB, disconnectDB } = require('../database/db');

// Connect to test database before all tests
beforeAll(async () => {
    await connectDB();
});

// Disconnect after all tests are done
afterAll(async () => {
    await disconnectDB();
});
