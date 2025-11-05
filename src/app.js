const express = require("express");
const connectDb = require("./config/database");
const User = require("./modals/user");
const { validation } = require("./utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middleware/Auth");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
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

// ✅ Protected Route
app.get('/users', userAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update user (pass id through body instead of params)
app.put('/users', userAuth, async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    if (!id) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete user (pass id through body)
app.delete('/users', userAuth, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "User ID is required" });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectDb()
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(3000, () => {
      console.log("🚀 Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
