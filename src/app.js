const express = require("express")

const app = express();

app.use("/helo",(req,res)=>{
    //this arrow function is request handler
    res.send("helo this is the server")
})

app.use("/test",(req,res)=>{
    //this arrow function is request handler
    res.send("helo this is the test ")
})

/* 
 ✅ Start the server
 - app.listen() takes a port number and a callback
 - Callback runs once the server starts successfully
*/
app.listen(3000,()=>{
    console.log("server is running on port 3000")
});

// nodemon is a development tool that automatically restarts your Node.js server whenever you make changes to your code.
// Restart server after any code change if nodemon is not used.
