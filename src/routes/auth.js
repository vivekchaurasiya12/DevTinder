const express = require("express");
const validation = require("../utils/validation")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../modals/user");


const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  try {
    validation(req);
    const { firstName, emailId, password, age } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      emailId,
      password: hashPassword,
      age
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });

    if (!user) throw new Error("Email does not exist!!");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Wrong Password");

    const token = jwt.sign(
      { id: user._id, email: user.emailId },
      "fuefhecfindcjdifhurh",
      { expiresIn: "1h" } // expires in 1 hour
    );

    // Send token via cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true for https
      sameSite: "lax",
    });

    res.json({ message: "Login Successful", token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post("/logout",async(req,res)=>{
   try {
    // Clear the JWT cookie securely
    res.cookie("token", "", {
      httpOnly: true,         // prevents client-side JS access
      secure: true,           // ensures cookie is sent only over HTTPS (set false for local dev)
      sameSite: "strict",     // prevents CSRF
      expires: new Date(0),   // expires immediately
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed", details: err.message });
  }
})



module.exports = authRouter