const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for development and test, PostgreSQL for production
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction ? new Sequelize(
  process.env.DB_NAME || 'bitespeed_identity',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
) : new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'test' ? ':memory:' : './database.sqlite',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true
  }
});

module.exports = sequelize;
