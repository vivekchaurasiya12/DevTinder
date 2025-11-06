const express = require("express");
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const app = express();
const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")
app.use(express.json());
app.use(cookieParser());


app.use("/",authRouter);
app.use("/",profileRouter);




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
