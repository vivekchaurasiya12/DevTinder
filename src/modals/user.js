const mongoose = require('mongoose');
const validator = require("validator");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength:3,
      maxlength:50,
    },
    lastName: {
      type: String,
      trim: true,
    },
    emailId: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please provide a valid email address");
        }
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must include uppercase, lowercase, number, and symbol"
          );
        }
      },
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
      max: [120, "Age must be less than 120"],
      validate: {
        validator: Number.isInteger,
        message: "Age must be a valid number",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type`,
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
      enum: ["basic", "silver", "gold", "platinum"],
      default: "basic",
    },
    photoUrl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL");
        }
      },
    },
    about: {
      type: String,
      trim: true,
      default: "This is a default about of the user!",
    },
    skills: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.every((skill) => typeof skill === "string");
        },
        message: "Skills must be an array of strings",
      },
    },
  },
  {
    timestamps: true,
  });

module.exports = mongoose.model('User', userSchema);
