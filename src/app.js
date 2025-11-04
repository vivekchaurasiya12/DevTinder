
const express = require("express");
require("./config/database")

const app = express();


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
