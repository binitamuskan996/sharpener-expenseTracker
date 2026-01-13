const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai'); 

dotenv.config();
const sequelize = require('./utils/db-connection');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const premiumRoutes = require('./routes/premiumRoute');
const forgotpasswordRoutes=require('./routes/forgotpasswordRoutes');

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use('/dashboard', authRoutes);
app.use('/expense', expenseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password',forgotpasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

sequelize.sync({ force: false}) 
  .then(() => {
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
