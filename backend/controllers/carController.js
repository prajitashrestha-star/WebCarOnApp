const Car = require('../models/Car');

exports.getCars = async (req, res) => {
    try {
        const cars = await Car.findAll();
        // Defensive: ensure existing cars without stock are treated as in-stock (default 1)
        const sanitizedCars = cars.map(car => ({
            ...car.toJSON(),
            stock: (car.stock === null || car.stock === undefined) ? 1 : Number(car.stock)
        }));
        res.json(sanitizedCars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (car) res.json(car);
        else res.status(404).json({ message: 'Car not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCar = async (req, res) => {
    try {
        const { name, brand, model, year, pricePerDay, registrationNumber, description, image, stock } = req.body;
        const car = await Car.create({
            name, brand, model, year, pricePerDay, registrationNumber, description, image, stock
        });
        res.status(201).json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (car) {
            await car.update(req.body);
            res.json(car);
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (car) {
            await car.destroy();
            res.json({ message: 'Car removed' });
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
