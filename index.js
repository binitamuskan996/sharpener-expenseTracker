const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
// const helmet=require('helmet');
// const compression=require('compression');
const morgan = require('morgan');
const { GoogleGenAI } = require('@google/genai');
dotenv.config();

const PORT = process.env.PORT || 3000;

const sequelize = require('./utils/db-connection');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const premiumRoutes = require('./routes/premiumRoute');
const forgotpasswordRoutes = require('./routes/forgotpasswordRoutes');

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const ForgotPasswordRequest = require('./models/forgotpassword');
const Stream = require('stream');

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
//app.use(helmet());
//app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }))

app.use('/dashboard', authRoutes);
app.use('/expense', expenseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', forgotpasswordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

sequelize.sync({ force: false })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
