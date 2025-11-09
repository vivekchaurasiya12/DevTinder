// Import mongoose to define schema and model
const mongoose = require('mongoose');

/*
  Define the structure (schema) of a connection request document.
  This represents a friend/request system between two users.
*/
const connectionSchema = new mongoose.Schema(
  {
    // The user who is sending the connection request
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to a user's _id
      required: true, // Must always exist
      ref: 'User',    // (optional) useful when using .populate() to get full user info
    },

    // The user who is receiving the connection request
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    // Current status of the connection request
    status: {
      type: String,
      required: true,
      enum: {
        // Only these four values are allowed
        values: ['ignored', 'interested', 'accepted', 'rejected'],
        message: '{VALUE} is incorrect status type', // Error message for invalid values
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

connectionSchema.index({fromUserId:1,toUserId:1});

/*
  🔹 Pre-save middleware (Mongoose Hook)
  This function automatically runs *before* saving a new document to the database.
  We use it here to make sure that a user cannot send a connection request to themselves.
*/
connectionSchema.pre('save', function (next) {
  // 'this' refers to the current document that is about to be saved
  if (this.fromUserId.equals(this.toUserId)) {
    // If both user IDs are the same, reject the save operation
    return next(new Error('You cannot send a connection request to yourself!'));
  }

  // If validation passes, move on to the next middleware (or save)
  next();
});

/*
  🔹 Create a MongoDB collection model named "ConnectionRequest"
  Mongoose will automatically pluralize this into "connectionrequests" in the database.
*/
const ConnectionRequestModel = mongoose.model('ConnectionRequest', connectionSchema);

/*
  Export the model so it can be imported and used in other files (e.g., controllers/routes)
*/
module.exports = ConnectionRequestModel;
