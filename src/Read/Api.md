// ✅ Importing Express module
const express = require("express");

// ✅ Creating an Express application instance
const app = express();

/* 
----------------------------------------------------
 🔹 CRUD Routes for /user endpoint
----------------------------------------------------
Each route demonstrates different HTTP methods:
GET → Fetch data
POST → Create data
PUT → Update data
DELETE → Delete data
*/

// ➤ GET request → Used to fetch data from server
app.get("/user", (req, res) => {
  res.send({ firstname: "Vivek Kumar", lastname: "Chaurasiya" });
});

// ➤ DELETE request → Used to delete data from server
app.delete("/user", (req, res) => {
  res.send("User deleted successfully");
});

// ➤ POST request → Used to send or create data on server
app.post("/user", (req, res) => {
  res.send("Data saved successfully");
});

// ➤ PUT request → Used to update or modify existing data
app.put("/user", (req, res) => {
  res.send("Data updated successfully");
});

/* 
----------------------------------------------------
 🔹 Params Example (Dynamic Routes)
----------------------------------------------------
Example URL → /user/101
Use → req.params.id
→ "params" are part of the URL path, used for dynamic values.
*/
app.get("/user/:id", (req, res) => {
  const userId = req.params.id; // Accessing dynamic parameter
  res.send(`Details of user with ID: ${userId}`);
});

/* 
----------------------------------------------------
 🔹 Query Example
----------------------------------------------------
Example URL → /search?city=ghaziabad&age=23
Use → req.query.city , req.query.age
→ "query parameters" are used to send filters or search options.
*/
app.get("/search", (req, res) => {
  const { city, age } = req.query; // Accessing query parameters
  res.send(`Searching users from ${city}, Age: ${age}`);
});

/* 
----------------------------------------------------
 🔹 Additional Notes (Commented Examples)
----------------------------------------------------

// app.use("/helo",(req,res)=>{
//     res.send("Hello this is the server");
// })

// app.use("/test",(req,res)=>{
//     res.send("Hello this is the test route");
// })

// app.use("/",(req,res)=>{
//     res.send("Hello World");
// })
*/

/* 
----------------------------------------------------
 ✅ Start the Server
----------------------------------------------------
app.listen() → Starts the Express server
Takes 2 parameters:
1️⃣ Port number (e.g., 3000)
2️⃣ Callback function → runs after server starts
*/
app.listen(3000, () => {
  console.log("✅ Server is running on port 3000");
});

/* 
----------------------------------------------------
 🔹 Important Notes for Revision
----------------------------------------------------

🧠 “Order of routes matters a lot”
------------------------------------
- Express checks routes in sequence (top to bottom)
- Once a matching route is found, it stops checking others
- Hence, define specific routes first (like /test)
- Define generic routes or wildcard (*) routes at the end

Example:
If "/" is above "/test", it may catch all requests before "/test" is ever reached.

------------------------------------
💡 About Nodemon:
------------------------------------
- Nodemon is a development tool that automatically restarts 
  your Node.js server whenever you make code changes.
- Run:  👉  npm install -g nodemon
- Start server with: 👉 nodemon index.js
- Without nodemon, you need to restart server manually every time.
*/





Lecture 17:


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
