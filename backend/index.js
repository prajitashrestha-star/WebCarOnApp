const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./database/db');

const app = express();

// 1. Logger Middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
});

// 2. Standard Middleware
app.use(cors());
app.use(express.json());

// 3. Register Routes
const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);

// 4. Diagnostic/Root Route
app.get('/api/ping', (req, res) => res.json({ message: "pong", time: new Date() }));
app.get('/', (req, res) => {
    res.json({ message: "Car Rental API is running!", status: "OK" });
});

// 5. 404 Catch-all
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.url} not found on this server` });
});

const PORT = process.env.PORT || 5000;

// Only start listening when run directly (not during tests)
if (require.main === module) {
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error('FAILED TO START SERVER:', err.message);
            process.exit(1);
        });
}

module.exports = app;
