// Import express and create a new router instance
const express = require("express");
const userRouter = express.Router();

// Import the authentication middleware to verify the logged-in user
const { userAuth } = require("../middleware/Auth");

// Import MongoDB models
const ConnectionRequest = require("../modals/connections");
const User = require("../modals/user");

// Define which user fields are safe to share publicly (avoid leaking passwords/emails)
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

/*
  ============================================================
   📌 ROUTE 1: GET /user/requests/received
   PURPOSE: Fetch all pending (i.e., 'interested') connection requests 
            that the logged-in user has received from other users.
   MIDDLEWARE: userAuth → ensures only logged-in users can access this data
  ============================================================
*/
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    // 1️⃣ Extract the logged-in user's details from the verified JWT
    const loggedInUser = req.user;

    // 2️⃣ Fetch all requests where this user is the receiver (toUserId)
    // and the status is "interested" — meaning they are still pending.
    // We populate the 'fromUserId' field to get the sender's user info.
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser.id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    // ✅ Example result:
    // [
    //   {
    //     _id: "123abc",
    //     fromUserId: { firstName: "John", lastName: "Doe", age: 25, ... },
    //     toUserId: "loggedInUserId",
    //     status: "interested"
    //   }
    // ]

    // 3️⃣ Return all pending requests to the frontend
    res.json({
      message: "Pending connection requests fetched successfully ✅",
      data: connectionRequests,
    });
  } catch (err) {
    // ❌ Handle errors such as DB connection failure, etc.
    res.status(400).json({ error: "Error fetching requests: " + err.message });
  }
});

/*
  ============================================================
   📌 ROUTE 2: GET /user/connections
   PURPOSE: Fetch all users who are already connected (status = 'accepted')
            with the logged-in user.
   MIDDLEWARE: userAuth → ensures only authenticated users can access this data
  ============================================================
*/
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    // 1️⃣ Get logged-in user info from the JWT
    const loggedInUser = req.user;

    // 2️⃣ Find all accepted connections where:
    //   - either the user received and accepted a request (toUserId)
    //   - or the user sent a request that got accepted (fromUserId)
    //
    // Using $or lets us match both cases in one query.
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser.id, status: "accepted" },
        { fromUserId: loggedInUser.id, status: "accepted" },
      ],
    })
      // 3️⃣ Populate both user fields to get readable user info
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    // ✅ Example result:
    // [
    //   { fromUserId: { name: "John" }, toUserId: { name: "You" }, status: "accepted" },
    //   { fromUserId: { name: "You" }, toUserId: { name: "Alice" }, status: "accepted" }
    // ]

    // 4️⃣ Map over results to extract the *connected user* (not yourself)
    // For each record:
    // - If you are the sender (fromUserId), return the receiver (toUserId)
    // - Otherwise, return the sender (fromUserId)
    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser.id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    // ✅ Example output to frontend:
    // [
    //   { firstName: "Alice", age: 22, gender: "female", skills: ["React", "Node"] },
    //   { firstName: "John", age: 27, gender: "male", skills: ["Java", "MongoDB"] }
    // ]

    // 5️⃣ Send all connection data
    res.json({
      message: "Active connections fetched successfully ✅",
      data,
    });
  } catch (err) {
    // ❌ Gracefully handle runtime or DB errors
    res.status(400).json({ error: "Error fetching connections: " + err.message });
  }
});

/*
  ============================================================
   📦 MODULE EXPORT
   Exports this router so it can be used inside app.js / server.js:
   Example:
     const userRouter = require("./routes/user");
     app.use("/", userRouter);
  ============================================================
*/
module.exports = userRouter;
