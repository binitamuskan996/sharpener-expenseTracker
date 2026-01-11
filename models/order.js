const { DataTypes } = require("sequelize");
const sequelize = require('../utils/db-connection');

const Order = sequelize.define('order', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  orderAmount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  orderCurrency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
    defaultValue: 'PENDING'
  }
});

module.exports = Order;