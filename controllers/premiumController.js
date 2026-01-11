const Order = require('../models/order');
const User = require('../models/user');
const cashfreeService = require('../services/cashfreeServices');

exports.purchasePremium = async (req, res) => {
  try {
    const orderId = `order_${Date.now()}_${req.user.id}`;
    const orderAmount = 100;

    const cashfreeOrder = await cashfreeService.createOrder({
      orderId,
      orderAmount,
      customerID: req.user.id.toString(),
      customerPhone: "9876543210",
      customerName: req.user.name,
      customerEmail: req.user.email
    });

    await Order.create({
      id: orderId,
      orderAmount,
      orderCurrency: "INR",
      status: "PENDING",
      UserDetId: req.user.id
    });

    res.status(200).json({
      orderId,
      sessionId: cashfreeOrder.payment_session_id
    });

  } catch (err) {
    console.error("Order creation failed:", err.response?.data || err);
    res.status(500).json({ error: "Cashfree order creation failed" });
  }
};


exports.updateTransactionStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findOne({
      where: { id: orderId, UserDetId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'SUCCESS') {
      const paymentDetails = await cashfreeService.verifyPayment(orderId);
      
      if (paymentDetails && paymentDetails[0]?.payment_status === 'SUCCESS') {
        await order.update({ status: 'SUCCESSFUL' });
        
        await req.user.update({ isPremium: true });
        
        return res.status(200).json({ 
          message: 'Transaction Successful! You are now a premium user.',
          isPremium: true
        });
      }
    }

    await order.update({ status: 'FAILED' });
    res.status(400).json({ message: 'Transaction Failed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

module.exports = { purchasePremium: exports.purchasePremium, updateTransactionStatus: exports.updateTransactionStatus };