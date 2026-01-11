const express = require('express');
const app = express();
const cors = require('cors');
const sequelize = require('./utils/db-connection');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const User = require('./models/user');
const Expense = require('./models/expense');

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use('/dashboard', authRoutes);
app.use('/expense', expenseRoutes);
User.hasMany(Expense);
Expense.belongsTo(User);
sequelize.sync({ force: false }) 
  .then(() => {
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
