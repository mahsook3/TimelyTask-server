import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbURI = process.env.DB_URI;
mongoose.connect(dbURI);

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  workcategory: String,
  workdescription: String,
  paymentamount: String,
  location: String,
  latitude: String,
  longitude: String,
  historyworksgiven: [
    {
      name: String,
      email: String,
      phone: String,
      location: String
    }
  ],
  historyworkdone: String,
  date: { type: Date, default: Date.now }
});

const Users = mongoose.model('users', UserSchema);

app.get("/users", async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    const newUser = new Users(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await Users.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route handler for adding user data to worker's historyworksgiven array
app.post("/workers/:workerId/historyworksgiven", async (req, res) => {
  try {
    const { name, email, phone, location } = req.body;
    const { workerId } = req.params;

    // Find the worker by ID
    const worker = await Users.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Add user data to the historyworksgiven array
    worker.historyworksgiven.push({ name, email, phone, location });
    await worker.save();

    // Respond with success
    res.status(200).json({ message: 'User data added to worker historyworksgiven array' });
  } catch (error) {
    console.error('Error adding user data to worker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
