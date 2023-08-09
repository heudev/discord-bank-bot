const { Sequelize } = require('sequelize');
const db = require('../db');

const User = db.define('user', {
    userId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        primaryKey: true
    },
    balance: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});

module.exports = User;