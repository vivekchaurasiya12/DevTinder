// ============================
//  Profile Routes (profileRouter.js)
//  Handles profile view, edit, password update, and account deletion
// ============================

// ✅ Import dependencies
const express = require("express");
const { userAuth } = require("../middleware/Auth"); // Middleware to verify JWT and attach user data
const bcrypt = require("bcrypt"); // For password hashing and comparison
const User = require("../modals/user"); // Mongoose model for user collection
const { validateProfileEdit, passwordValidation } = require("../utils/validation"); // Custom validation utilities

// ✅ Initialize Express Router
const profileRouter = express.Router();

/* ===================================================================
   GET /profile
   Description: Fetch all user profiles (should be restricted in production)
   Auth: Protected — only logged-in users can access
=================================================================== */
profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    // Fetch all user documents from the database
    const users = await User.find();

    res.json(users); // Send data back as JSON
  } catch (err) {
    // Handle server or DB errors
    res.status(500).json({ error: err.message });
  }
});


/* ===================================================================
   PATCH /profile/edit
   Description: Allow logged-in user to update their profile information
   Auth: Protected
=================================================================== */
profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
  try {
    // ✅ Step 1: Validate fields that can be edited
    const isEditAllowed = validateProfileEdit(req);
    if (!isEditAllowed) {
      throw new Error("Invalid Edit Request"); // Prevent editing restricted fields like password, _id, etc.
    }

    // ✅ Step 2: Ensure the user ID is provided in the request
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // ✅ Step 3: Find the user document by ID
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Step 4: Dynamically update only allowed fields
    Object.keys(req.body).forEach((key) => {
      if (key !== "_id") {
        user[key] = req.body[key];
      }
    });

    // ✅ Step 5: Save the updated document to the database
    await user.save();

    // ✅ Step 6: Return a success response
    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ===================================================================
   PATCH /profile/password
   Description: Allow logged-in user to change their password securely
   Auth: Protected
=================================================================== */
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // ✅ Step 1: Validate inputs (ensures all fields exist & match)
    passwordValidation(oldPassword, newPassword, confirmPassword);

    // ✅ Step 2: Find the logged-in user's record
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Step 3: Verify old password matches stored hash
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // ✅ Step 4: Hash new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Step 5: Update user document with new password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


/* ===================================================================
   DELETE /profile
   Description: Delete user account by ID
   Auth: Protected
=================================================================== */
profileRouter.delete('/profile', userAuth, async (req, res) => {
  try {
    const { id } = req.body; // Expecting user ID in request body

    // ✅ Validate that ID is provided
    if (!id) return res.status(400).json({ message: "User ID is required" });

    // ✅ Delete user record from MongoDB
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ===================================================================
   EXPORT ROUTER
=================================================================== */
module.exports = profileRouter;
