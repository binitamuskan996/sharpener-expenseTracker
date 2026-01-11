const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const { authenticate } = require('../middleware/auth');

router.post('/purchasepremium', authenticate, premiumController.purchasePremium);
router.post('/updatetransaction', authenticate, premiumController.updateTransactionStatus);
router.get('/status', authenticate, premiumController.getUserStatus);
router.get('/showleaderboard',authenticate,premiumController.showLeaderboard);

module.exports = router;