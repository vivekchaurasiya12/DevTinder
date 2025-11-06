const express = require("express");
const { userAuth } = require("../middleware/Auth");
const profileRouter = express.Router();
const User = require("../modals/user");

profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Update user (pass id through body instead of params)
profileRouter.put('/profile', userAuth, async (req, res) => {
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
profileRouter.delete('/profile', userAuth, async (req, res) => {
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



module.exports = profileRouter