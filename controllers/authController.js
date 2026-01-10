const User = require("../models/user");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
     const saltRounds = 10;

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ err });
      }
    await User.create({ name, email, password: hash });

    res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    const isMatch=await bcrypt.compare(password, user.password);
    //console.log(isMatch)
    if (!isMatch) {
      return res.status(401).json({
        message: "User not authorized"
      });
    }

    res.status(200).json({
      message: "User login sucessful",
      userId: user.id,
      name: user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong"
    });
  }
};
module.exports={signup,login};