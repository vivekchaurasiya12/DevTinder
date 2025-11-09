// Importing essential modules
const express = require("express");
const { validation } = require("../utils/validation"); // Custom validation function (for checking input fields)
const jwt = require("jsonwebtoken"); // For creating/verifying JWT tokens
const bcrypt = require("bcrypt"); // For securely hashing and comparing passwords
const User = require("../modals/user"); // Mongoose User model for interacting with MongoDB

// Initialize Express router for authentication routes
const authRouter = express.Router();

/* ======================
      USER SIGNUP API
   ====================== */
authRouter.post('/signup', async (req, res) => {
  try {
    // 1️⃣ Validate input fields (checks like required keys, email format, etc.)
    validation(req);

    // 2️⃣ Extract user details from request body
    const { firstName, emailId, password, age } = req.body;

    // 3️⃣ Hash password before saving it into database for security
    const hashPassword = await bcrypt.hash(password, 10); // 10 = salt rounds (more rounds = stronger hash)

    // 4️⃣ Create new user object with hashed password
    const user = new User({
      firstName,
      emailId,
      password: hashPassword,
      age
    });

    // 5️⃣ Save user document to MongoDB
    await user.save();

    // 6️⃣ Send success response with user data
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    // Handle any errors like validation failure or MongoDB duplicate email
    res.status(400).json({ error: err.message });
  }
});


/* ======================
       USER LOGIN API
   ====================== */
authRouter.post('/login', async (req, res) => {
  try {
    // 1️⃣ Extract credentials from the request
    const { emailId, password } = req.body;

    // 2️⃣ Check if user exists
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Email does not exist!!");

    // 3️⃣ Compare provided password with the hashed password stored in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Wrong Password");

    // 4️⃣ Generate a signed JWT token containing user info (for authorization)
    const token = jwt.sign(
      { id: user._id, email: user.emailId },  // payload data
      "fuefhecfindcjdifhurh",                // secret key (should be in .env file)
      { expiresIn: "1h" }                    // token expires in 1 hour
    );

    // 5️⃣ Send token securely via cookie
    res.cookie("token", token, {
      httpOnly: true, // prevents client-side JS access — avoids XSS attacks
      secure: false,  // should be true in production (HTTPS only)
      sameSite: "lax", // helps protect against CSRF
    });

    // 6️⃣ Send successful response with token
    res.json({ message: "Login Successful", token });
  } catch (err) {
    // Handle login-related errors
    res.status(400).json({ error: err.message });
  }
});


/* ======================
       USER LOGOUT API
   ====================== */
authRouter.post("/logout", async (req, res) => {
  try {
    // ✅ To logout, we just need to clear the JWT cookie on the client
    res.cookie("token", "", {
      httpOnly: true,        // keep it secure — prevent JS access
      secure: true,          // send only over HTTPS (set to false during local development)
      sameSite: "strict",    // avoids CSRF attacks
      expires: new Date(0),  // immediately expires the cookie
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed", details: err.message });
  }
});


/* ======================
    EXPORTING THE ROUTER
   ====================== */
module.exports = authRouter;
