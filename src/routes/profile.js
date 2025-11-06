const express = require("express");
const { userAuth } = require("../middleware/Auth");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../modals/user");
const {validateProfileEdit, passwordValidation} = require("../utils/validation")

profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    // ✅ Validate editable fields
    const isEditAllowed = validateProfileEdit(req);
    if (!isEditAllowed) {
      throw new Error("Invalid Edit Request");
    }

    // ✅ Ensure ID is present
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Find user in DB
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Dynamically update allowed fields
    Object.keys(req.body).forEach((key) => {
      if (key !== "_id") {
        user[key] = req.body[key];
      }
    });

    // ✅ Save changes
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
     // ✅ Step 1: Validate inputs
    passwordValidation(oldPassword, newPassword, confirmPassword);
    

    // ✅ Step 2: Find the logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Step 3: Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // ✅ Step 4: Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Step 5: Update user password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
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