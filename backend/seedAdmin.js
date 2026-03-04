const { sequelize } = require('./database/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected for seeding.');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@carrental.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin already exists
        const adminExists = await User.findOne({ where: { email: adminEmail } });

        if (adminExists) {
            console.log('Admin user already exists.');
            // Ensure the role is admin
            if (adminExists.role !== 'admin') {
                adminExists.role = 'admin';
                await adminExists.save();
                console.log('User role updated to admin.');
            }
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                phone: '0000000000'
            });
            console.log('Admin user created successfully.');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
