const express = require('express');
const router = express.Router();
const userAuthentication=require('../middleware/auth')
const expenseController = require('../controllers/expenseController');

router.post('/add', userAuthentication.authenticate,expenseController.addExpense);
router.get('/get', userAuthentication.authenticate,expenseController.getExpenses);
router.delete('/delete/:id',userAuthentication.authenticate, expenseController.deleteExpense);
router.post('/categorize', userAuthentication.authenticate,expenseController.categorizeExpense); 
router.get('/download', userAuthentication.authenticate, expenseController.downloadExpense);
router.get('/download/history', userAuthentication.authenticate, expenseController.getDownloadHistory);
router.get('/download/file/:id', userAuthentication.authenticate, expenseController.getFileDownloadUrl);

module.exports = router;
