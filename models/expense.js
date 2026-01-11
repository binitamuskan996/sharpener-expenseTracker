const { DataTypes } = require("sequelize");
const sequelize = require('../utils/db-connection');

const Expense = sequelize.define('expense', {
    id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Expense;
