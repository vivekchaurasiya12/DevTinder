// Import required dependencies
const express = require("express");

// Import authentication middleware to verify the logged-in user
const { userAuth } = require("../middleware/Auth");

// Import the Mongoose models for connection requests and users
const ConnectionRequest = require("../modals/connections");
const User = require("../modals/user");

// Create a new Express Router instance
const requestRouter = express.Router();

/*
  ============================================================
   📌 API: POST /request/send/:status/:toUserId
   PURPOSE: Send a connection request (ignored/interested) to another user.
   MIDDLEWARE: userAuth → ensures the user is authenticated before proceeding.
  ============================================================
*/
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    // Get the sender's ID (from the authenticated user)
    const fromUserId = req.user.id;

    // Get the receiver's ID from the route parameter
    const toUserId = req.params.toUserId;

    // Get the desired status type from the route parameter (ignored / interested)
    const status = req.params.status;

    // Step 1️⃣ - Check if status is valid (only "ignored" or "interested" allowed)
    const allowedRequest = ["ignored", "interested"];
    if (!allowedRequest.includes(status)) {
      throw new Error("Request not allowed. Status must be 'ignored' or 'interested'.");
    }

    // Step 2️⃣ - Prevent user from sending request to themselves
    // This is also checked by pre method which is mongoose midle ware
    if (fromUserId.toString() === toUserId.toString()) {
      throw new Error("You cannot send a connection request to yourself!");
    }

    // Step 3️⃣ - Check if the receiver exists in the database
    const isExistToUserId = await User.findById(toUserId);
    if (!isExistToUserId) {
      throw new Error("User not found!");
    }

    // Step 4️⃣ - Check if there is already an existing connection request
    // This ensures that no duplicate or reversed requests exist between two users
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },               // Same direction (A → B)
        { fromUserId: toUserId, toUserId: fromUserId } // Reverse direction (B → A)
      ],
    });

    if (existingRequest) {
      throw new Error("Connection request already exists!");
    }

    // Step 5️⃣ - Create a new connection request document
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    // Step 6️⃣ - Save it to the database
    const data = await connectionRequest.save();

    // Step 7️⃣ - Send success response to client
    res.json({
      message: "Connection request sent successfully!",
      data,
    });

  } catch (err) {
    // Handle all errors gracefully
    res.status(400).json({ error: err.message });
  }
});

 /*
  ============================================================
   📌 API: POST /request/review/:status/:requestId
   PURPOSE: Review a received connection request (accept or reject).
   MIDDLEWARE: userAuth → ensures the user is authenticated.
  ============================================================
*/
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    // Step 1️⃣ - Extract parameters and logged-in user info
    const { status, requestId } = req.params;
   
    const loggedInUser = req.user;
    console.log(loggedInUser)

    // Step 2️⃣ - Allow only accepted/rejected as valid statuses
    const allowedRequest = ["accepted", "rejected"];
    if (!allowedRequest.includes(status)) {
      throw new Error("Request not allowed. Status must be 'accepted' or 'rejected'.");
    }

    // Step 3️⃣ - Find the connection request in DB
    // The logged-in user should be the recipient (toUserId)
    // And request must currently be in 'interested' state
    const connectionUser = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser.id,
      status: "interested" // must match the enum spelling
    });

    if (!connectionUser) {
      throw new Error("Connection request not found or already reviewed.");
    }

    // Step 4️⃣ - Update the status to accepted/rejected
    connectionUser.status = status;

    // Step 5️⃣ - Save the updated document
    const data = await connectionUser.save();

    // Step 6️⃣ - Send success response
    res.json({
      message: `Connection request ${status === "accepted" ? "accepted 🎉" : "rejected ❌"}`,
      data,
    });

  } catch (err) {
    // Step 7️⃣ - Handle errors gracefully
    res.status(400).json({ error: err.message });
  }
});

// Export the router so it can be used in main app.js / server.js
module.exports = requestRouter;
