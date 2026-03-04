const { Sequelize } = require('sequelize');
require('dotenv').config();

const isTestEnvironment = process.env.NODE_ENV === 'test';
console.log(`Running in ${isTestEnvironment ? 'TEST' : 'DEVELOPMENT'} mode.`);

const dbName = isTestEnvironment && process.env.TEST_DB_NAME
  ? process.env.TEST_DB_NAME
  : (process.env.DB_NAME || 'webprajita_car_rental_db');

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      // Keeping camelCase for consistency with previous models or switch to underscored if preferred
      // The previous models used camelCase (e.g., profileImage), so I will stick to default info
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully.');

    const isTest = process.env.NODE_ENV === 'test';
    const isUsingTestDB = sequelize.getDatabaseName() === process.env.TEST_DB_NAME;

    if (isTest && isUsingTestDB) {
      await sequelize.sync({ force: true });
      console.log('Database Synchronized (TEST MODE - DATA RESET)');
    } else {
      await sequelize.sync({ alter: true });
      console.log('Database Synchronized (Altering tables to match models)');
    }

    return sequelize;
  } catch (error) {
    console.error('PostgreSQL Connection Error:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await sequelize.close();
    console.log('PostgreSQL Disconnected');
  } catch (error) {
    console.error('Error disconnecting from PostgreSQL:', error.message);
  }
};

module.exports = { sequelize, connectDB, disconnectDB };
