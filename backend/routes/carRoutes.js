const express = require('express');
const router = express.Router();
const {
    getCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar
} = require('../controllers/carController');
const { protect, adminOnly } = require('./authMiddleware');

router.route('/')
    .get(getCars)
    .post(protect, adminOnly, createCar);

router.route('/:id')
    .get(getCarById)
    .put(protect, adminOnly, updateCar)
    .delete(protect, adminOnly, deleteCar);

module.exports = router;
