const User = require("../models/user");
const bcrypt = require("bcrypt");
const Sib = require('sib-api-v3-sdk');
const ForgotPasswordRequest = require("../models/forgotpassword");
require('dotenv').config(); 


const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const request = await ForgotPasswordRequest.create({
      UserDetId: user.id,
      isActive: true
    });
    console.log("request_id:",request.id)
    const resetLink = `http://127.0.0.1:5501/public/resetpassword.html?uuid=${request.id}`;

    const client = Sib.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.API_KEY;

    const tranEmailApi = new Sib.TransactionalEmailsApi();
    await tranEmailApi.sendTransacEmail({
      sender: { email: 'binitabini05@gmail.com' },
      to: [{ email }],
      subject: 'Reset your password',
      htmlContent: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
      `
    });

    res.status(200).json({ message: 'Reset email sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params; 
    console.log("id",id)
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const request = await ForgotPasswordRequest.findOne({ where: { id } });
    if (!request || !request.isActive) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByPk(request.UserDetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = hashedPassword;
    await user.save();

    request.isActive = false;
    await request.save();

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


module.exports = { forgotpassword, resetPassword };
