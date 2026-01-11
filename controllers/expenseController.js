const Expense = require('../models/expense');

const addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    const expense = await Expense.create({
      amount,
      description,
      category
    });

    res.status(201).json({ expense });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.status(200).json({ expenses });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await Expense.destroy({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
module.exports={addExpense,getExpenses,deleteExpense}