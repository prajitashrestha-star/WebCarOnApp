const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getAllBookings,
    getRevenue,
    updateBooking,
    deleteBooking
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('./authMiddleware');

router.get('/list', protect, adminOnly, getAllBookings);
router.get('/my', protect, getMyBookings);
router.get('/revenue', protect, adminOnly, getRevenue);
router.post('/', protect, createBooking);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
