const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getAllBookings,
    getRevenue
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('./authMiddleware');

router.post('/', protect, createBooking);
router.get('/list', protect, adminOnly, getAllBookings);
router.get('/my', protect, getMyBookings);
router.get('/revenue', protect, adminOnly, getRevenue);

module.exports = router;
