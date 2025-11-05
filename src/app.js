
const express = require("express");
const connectDb = require("./config/database")
const User = require("./modals/user")
const { validation } = require("./utils/validation");
const bcrypt = require("bcrypt"); 
const { Error } = require("mongoose");

const app = express();
app.use(express.json());

app.post('/signup', async (req, res) => {
 
  try {
     validation(req);
     const {firstName,emailId,password,age} = req.body;
     const hashPassword = await bcrypt.hash(password,10);
    
    const user = new User({
      firstName,
      emailId,
      password:hashPassword,
      age
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) { 
    res.status(400).json({ error: err.message });
  }
});
 
app.post('/login', async (req, res) => {
 
  try {
    
     const {emailId,password} = req.body;
     const user = await User.findOne({emailId:emailId});
     if(!user){
      throw new Error("Email does not exist!!");
     }
     const isPasswordValid = await bcrypt.compare(password,user.password);
     if(isPasswordValid){
      res.send("Login Successfull !!!!")
     }else{
      throw new Error("Wrong Password");
     }
    
    
   
  } catch (err) { 
    res.status(400).json({ error: err.message });
  }
});


app.get('/users', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }

    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
connectDb()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });