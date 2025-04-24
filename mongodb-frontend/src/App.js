// config/db.js - MongoDB Connection Setup
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

// models/User.js - User Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', 'users');

// models/Profile.js - Resident Profile Model
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  middleName: String,
  birthdate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  address: {
    street: String,
    barangay: {
      type: String,
      default: 'Santiago'
    },
    city: String,
    province: String,
    zipCode: String
  },
  contactNumber: String,
  email: String,
  occupation: String,
  civilStatus: {
    type: String,
    enum: ['Single', 'Married', 'Widowed', 'Divorced', 'Separated']
  },
  educationalAttainment: String,
  healthStatus: {
    hasHealthCondition: Boolean,
    conditions: [String],
    medications: [String]
  },
  familyMembers: [{
    name: String,
    relationship: String,
    age: Number
  }],
  photoUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Add full text search index
ProfileSchema.index({
  firstName: 'text',
  lastName: 'text',
  middleName: 'text',
  'address.street': 'text'
});

module.exports = mongoose.model('Profile', 'profiles');

// routes/auth.js - Authentication Routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// routes/profiles.js - Profile Routes
const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get all profiles with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const searchQuery = req.query.search || '';
    let query = {};
    
    if (searchQuery) {
      query = { $text: { $search: searchQuery } };
    }
    
    const profiles = await Profile.find(query)
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Profile.countDocuments(query);
    
    res.json({
      profiles,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new profile
router.post('/', auth, async (req, res) => {
  try {
    const newProfile = new Profile({
      ...req.body,
      createdBy: req.user.id
    });
    
    const profile = await newProfile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete profile
router.delete('/:id', auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    await profile.remove();
    res.json({ message: 'Profile removed' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// middleware/auth.js - Authentication Middleware
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// server.js - Main Server File
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/users', require('./routes/users'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// .env - Environment Variables
// Create a .env file in the root directory with the following:
/*
MONGO_URI=mongodb://localhost:27017/barangay_profiling
JWT_SECRET=your_jwt_secret_key
PORT=5000
*/

// utils/api.js - API Utility Functions for Frontend
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Health check
export const checkHealth = () => api.get('/health');

// Auth API calls
export const login = (credentials) => api.post('/auth/login', credentials);

// Profiles API calls
export const getProfiles = (page = 1, limit = 10, search = '') => 
  api.get(`/profiles?page=${page}&limit=${limit}&search=${search}`);

export const getProfile = (id) => api.get(`/profiles/${id}`);

export const createProfile = (profileData) => api.post('/profiles', profileData);

export const updateProfile = (id, profileData) => api.put(`/profiles/${id}`, profileData);

export const deleteProfile = (id) => api.delete(`/profiles/${id}`);

// Admin API calls - for admin dashboard
export const getUsers = () => api.get('/users');

export const createUser = (userData) => api.post('/users', userData);

export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);

export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;