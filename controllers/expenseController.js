const Expense = require('../models/expense');
const User = require('../models/user');
let genai = require("@google/genai");
const sequelize = require('../utils/db-connection');
require('dotenv').config(); 

let ai = new genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const categorizeExpense = async (req, res) => {
  try {
    const { description } = req.body;
  console.log(description )
    const prompt = `Categorize this expense: "${description}". 
    Return ONLY one word from these exact categories: Food, Fuel, Shopping,Entertainment, Travel, Bills, Healthcare, Education, Other.
    Just respond with the category name, nothing else.`;

   const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    let category = response.text.trim();
 
    res.status(200).json({ category });

  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ 
      error: "Failed to categorize",
    });
  }
};
const addExpense = async (req, res) => {
    const t=await sequelize.transaction()
  try {
    const { amount, description, category } = req.body;

    const expense = await Expense.create({
      amount,
      description,
      category,
      UserDetId: req.user.id ,
    },{ transaction: t }
  );
    const user = await User.findByPk(req.user.id, { transaction: t });
    user.totalExpense = user.totalExpense + Number(amount);
     await user.save({ transaction: t });
    await t.commit();
    res.status(201).json({ expense });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err });
  }
};

const getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const offset = (page - 1) * limit;

    const { count, rows } = await Expense.findAndCountAll({
      where: { UserDetId: req.user.id },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      expenses: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalExpenses: count
    });

  } catch (err) {
    res.status(500).json({ error: err });
  }
};


const deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        UserDetId: req.user.id
      },      transaction: t
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findByPk(req.user.id,{ transaction: t });

    user.totalExpense -= Number(expense.amount);
    if (user.totalExpense < 0) user.totalExpense = 0;

    await user.save({ transaction: t });

    await expense.destroy({ transaction: t });
    await t.commit();
    res.status(200).json({ message: "Deleted" });

  } catch (err) {
     await t.rollback();
    res.status(500).json({ error: err });
  }
};

module.exports={addExpense,getExpenses,deleteExpense,categorizeExpense}