const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    const token = req.cookies.token; // Extract from cookie
    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token not found" });
    }
    // Verify token
    const decoded = jwt.verify(token, "fuefhecfindcjdifhurh");
    req.user = decoded; // store user info for next handlers
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { userAuth };
