
const express = require("express");

const app = express();


//CASE 1
app.get("/user",(req,res,next)=>{
    res.send("User data fetch successfully")
    next() // ❌ Problem: next() is called after sending a response
},
(req,res)=>{
    res.send("This is second response"); // ❌ Trying to send again
})
/*
Here’s what happens step-by-step:
The first handler sends a response (res.send()).
Then you call next(), telling Express to continue to the next handler.
The second handler also tries to send a response.
But Express has already sent one, so it throws the error.
 */

//CASE 2
app.get("/test",(req,res,next)=>{
    next() // ❌ Problem: next() is called BEFORE sending a response
    res.send("User data fetch successfully") // ❌ Trying to send again    
},
(req,res)=>{
    res.send("This is second response"); 
})


app.listen(3000, () => {
  console.log("✅ Server is running on port 3000");
});
