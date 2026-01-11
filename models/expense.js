const Sequelize = require('sequelize');
const sequelize = require('../utils/db-connection');

const Expense = sequelize.define('expenseDetail', {
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Expense;
