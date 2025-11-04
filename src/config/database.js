const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());


const connectDb = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://vivekchaurasiyatutorials_db_user:PYtsQuaWMHZDs6q4@nodejs.gjsarc2.mongodb.net/?appName=NodeJs'
    );
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed', error);
  }
};
connectDb();


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
  },
   email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address',
    },
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be greater than 0'],
    max: [120, 'Age must be less than 120'],
    validate: {
      validator: Number.isInteger,
      message: 'Age must be a valid number',
    },
  },
});

const User = mongoose.model('User', userSchema);

app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
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


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
