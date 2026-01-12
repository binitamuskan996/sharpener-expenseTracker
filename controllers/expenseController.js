const Expense = require('../models/expense');
const User = require('../models/user');
let genai = require("@google/genai");
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
  try {
    const { amount, description, category } = req.body;

    const expense = await Expense.create({
      amount,
      description,
      category,
      UserDetId: req.user.id 
    });
    const user = await User.findByPk(req.user.id);
    user.totalExpense = user.totalExpense + Number(amount);
     await user.save();
    res.status(201).json({ expense });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({where: { UserDetId: req.user.id }  
});
    res.status(200).json({ expenses });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        UserDetId: req.user.id
      }
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findByPk(req.user.id);

    user.totalExpense -= Number(expense.amount);
    if (user.totalExpense < 0) user.totalExpense = 0;

    await user.save();

    await expense.destroy();

    res.status(200).json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: err });
  }
};

module.exports={addExpense,getExpenses,deleteExpense,categorizeExpense}