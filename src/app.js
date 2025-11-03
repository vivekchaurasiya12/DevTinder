
const express = require("express");
const {authRequest,userAuth} = require("./middleware/Auth")
const app = express();

app.use("/admin",authRequest)

app.get("/admin/getAllData",(req,res)=>{
    res.send("all data sent");
})
app.get("/admin/deleteAdmin",(req,res)=>{
    res.send("Admin Deleted");
})

app.get("/user/getAll",userAuth,(req,res)=>{
    res.send("all user sent");
})




app.listen(3000, () => {
  console.log("✅ Server is running on port 3000");
});
