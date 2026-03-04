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
