const User = require("../models/user");
const bcrypt = require("bcrypt");
const Sib = require('sib-api-v3-sdk');
require('dotenv').config(); 

const forgotpassword=async (req, res) => {
  try {
    const { email } = req.body;
    //console.log(process.env.API_KEY)
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const client = Sib.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.API_KEY;

    const tranEmailApi = new Sib.TransactionalEmailsApi();

    await tranEmailApi.sendTransacEmail({
      sender: { email: 'binitabini05@gmail.com' },
      to: [{ email }],
      subject: 'Reset your password',
      htmlContent: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password</p>
        <a href="http://127.0.0.1:5500/public/resetpassword.html?email=${email}">Reset Password</a>
      `
    });

    res.status(200).json({ message: 'Reset email sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
const resetPassword = async (req, res) => {
  try {
    const { email,password } = req.body;
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const [updatedRows] = await User.update(
      { password: hash },        
      { where: { email } }       
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports = { forgotpassword, resetPassword };
