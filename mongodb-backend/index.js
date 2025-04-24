const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5001;


// Middleware
app.use(cors());
app.use(bodyParser.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/students_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));


// Define Student Schema
const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  course: String,
  age: Number,
  address: String,
});


const Student = mongoose.model('Student', studentSchema);


// Routes


// Create (C)
app.post('/students', async (req, res) => {
  const { id, name, course, age, address } = req.body;


  if (!id || !name || !course || !age || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }


  try {
    const existing = await Student.findOne({ id });
    if (existing) {
      return res.status(409).json({ message: 'Student with this ID already exists' });
    }


    const newStudent = new Student({ id, name, course, age, address });
    await newStudent.save();
    res.status(201).json({ message: 'Student saved successfully' });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});


// Read (R) - single student
app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ id: req.params.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Failed to retrieve student' });
  }
});


// Read all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to retrieve students' });
  }
});


// Update (U)
app.put('/students/:id', async (req, res) => {
  const { name, course, age, address } = req.body;


  if (!name && !course && !age && !address) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }


  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { id: req.params.id },
      { $set: { name, course, age, address } },
      { new: true, omitUndefined: true }
    );


    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }


    res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});


// Delete (D)
app.delete('/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


