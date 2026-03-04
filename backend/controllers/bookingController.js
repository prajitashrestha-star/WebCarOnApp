const Booking = require('../models/Booking'); // Controller updated
const Car = require('../models/Car');
const User = require('../models/User');
const { sequelize } = require('../database/db');

exports.createBooking = async (req, res) => {
    const { carId, startDate, endDate, totalAmount } = req.body;
    const t = await sequelize.transaction();

    try {
        const car = await Car.findByPk(carId);

        if (!car || !(car.stock > 0)) {
            await t.rollback();
            return res.status(400).json({ message: 'This car is currently out of stock. Please try another one.' });
        }

        // Check for existing pending booking for this user and car
        let booking = await Booking.findOne({
            where: {
                userId: req.user.id,
                carId: carId,
                status: 'pending'
            }
        });

        if (booking) {
            // Update existing booking quantity and total amount
            booking.quantity += 1;
            booking.totalAmount = parseFloat(booking.totalAmount) + parseFloat(totalAmount);
            await booking.save({ transaction: t });
        } else {
            // Create new booking
            booking = await Booking.create({
                userId: req.user.id,
                carId,
                startDate,
                endDate,
                totalAmount,
                quantity: 1,
                status: 'pending'
            }, { transaction: t });
        }

        // Decrement stock
        await car.update({ stock: car.stock - 1 }, { transaction: t });

        await t.commit();
        res.status(201).json(booking);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { userId: req.user.id },
            include: [{ model: Car }]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Car },
                { model: User, attributes: ['name', 'email'] }
            ]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRevenue = async (req, res) => {
    try {
        const totalRevenue = await Booking.sum('totalAmount');
        const totalBookings = await Booking.count();
        res.json({ totalRevenue: totalRevenue || 0, totalBookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const booking = await Booking.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Car }]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be edited' });
        }

        // Recalculate total amount based on new dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const pricePerDay = parseFloat(booking.Car.pricePerDay);
        const newTotal = days * pricePerDay * booking.quantity;

        await booking.update({ startDate, endDate, totalAmount: newTotal });

        // Reload with Car data so the frontend gets the full object
        const updated = await Booking.findByPk(booking.id, { include: [{ model: Car }] });
        res.json({ message: 'Booking updated successfully', booking: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const booking = await Booking.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Return stock to car
        const car = await Car.findByPk(booking.carId);
        if (car) {
            await car.update({ stock: car.stock + booking.quantity }, { transaction: t });
        }

        await booking.destroy({ transaction: t });
        await t.commit();
        res.json({ message: 'Booking deleted and stock restored' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
