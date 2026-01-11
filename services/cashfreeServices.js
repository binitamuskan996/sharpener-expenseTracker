const { Cashfree, CFEnvironment } = require('cashfree-pg');

const cashfree = new Cashfree(CFEnvironment.SANDBOX, "TEST430329ae80e0f32e41a393d78b923034", "TESTaf195616268bd6202eeb3bf8dc458956e7192a85");


exports.createOrder = async ({
  orderId,
  orderAmount,
  orderCurrency = "INR",
  customerID,
  customerPhone,
  customerName,
  customerEmail
}) => {
  try {
    const request = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: orderCurrency,
      customer_details: {
        customer_id: customerID,
        customer_phone: customerPhone,
        customer_name: customerName,
        customer_email: customerEmail
      }
    };

    const response = await cashfree.PGCreateOrder(request, "2023-08-01");
    return response.data;

  } catch (err) {
    console.error("Cashfree Error:", err.response?.data || err);
    throw err;
  }
};
exports.verifyPayment = async (orderId) => {
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);
    return response.data;
  } catch (err) {
    console.error("Cashfree verifyPayment error:", err.response?.data || err);
    throw err;
  }
}
