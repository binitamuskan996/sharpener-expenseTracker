const Expense = require('../models/expense');
const User = require('../models/user');
let genai = require("@google/genai");
const sequelize = require('../utils/db-connection');
const { uploadToS3, getPresignedUrl } = require('../services/s3');
const DownloadedFile = require('../models/downloadHistory');

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
    const { amount, description, category,note } = req.body;

    const expense = await Expense.create({
      amount,
      description,
      category,
      note,
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

const downloadExpense = async (req, res) => {
  try {
    if (!req.user.isPremium) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const expenses = await Expense.findAll({
      where: { UserDetId: req.user.id }
    });

    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense-${req.user.id}-${Date.now()}.txt`;

    await uploadToS3(stringifiedExpenses, filename);

    const newDownload = await DownloadedFile.create({
      UserDetId: req.user.id,
      fileURL: filename 
    });

    const presignedUrl = getPresignedUrl(filename);

    res.status(200).json({ 
      fileURL: presignedUrl,
      downloadId: newDownload.id 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download expenses" });
  }
};


const getDownloadHistory = async (req, res) => {
  try {
    if (!req.user.isPremium) return res.status(401).json({ message: "Unauthorized" });

    const files = await DownloadedFile.findAll({
      where: { UserDetId: req.user.id },
      order: [['createdAt', 'DESC']] 
    });

    res.status(200).json({ files });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch download history" });
  }
};

const getFileDownloadUrl = async (req, res) => {
  try {
    if (!req.user.isPremium) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const fileId = req.params.id;

    const file = await DownloadedFile.findOne({
      where: { id: fileId, UserDetId: req.user.id }
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const freshUrl = getPresignedUrl(file.fileURL);
    res.status(200).json({ url: freshUrl });

  } catch (err) {
    console.error("Error generating fresh URL:", err);
    res.status(500).json({ error: "Failed to get download URL" });
  }
};


module.exports={addExpense,getExpenses,deleteExpense,categorizeExpense,downloadExpense,getDownloadHistory, getFileDownloadUrl}