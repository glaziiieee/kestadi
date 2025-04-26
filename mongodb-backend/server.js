// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createRedisClient } = require('./config/redis');
const BarangayModel = require('./models/barangay');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'] 
}));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'An unexpected error occurred', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Barangay Santiago sample data
const barangayData = {
  "purok": [
    {
      "name": "Purok 1",
      "population": 17245,
      "budget": 59524,
      "demographics": {
        "gender": { "male": 8623, "female": 8622 },
        "employment": { "employed": 10347, "unemployed": 6898 },
        "fourPs": { "members": 5174, "nonMembers": 12071 }
      }
    },
    {
      "name": "Purok 2",
      "population": 18156,
      "budget": 62500,
      "demographics": {
        "gender": { "male": 9078, "female": 9078 },
        "employment": { "employed": 10894, "unemployed": 7262 },
        "fourPs": { "members": 5447, "nonMembers": 12709 }
      }
    },
    {
      "name": "Purok 3",
      "population": 16324,
      "budget": 56548,
      "demographics": {
        "gender": { "male": 8162, "female": 8162 },
        "employment": { "employed": 9794, "unemployed": 6530 },
        "fourPs": { "members": 4897, "nonMembers": 11427 }
      }
    },
    {
      "name": "Purok 4",
      "population": 19067,
      "budget": 65476,
      "demographics": {
        "gender": { "male": 9534, "female": 9533 },
        "employment": { "employed": 11440, "unemployed": 7627 },
        "fourPs": { "members": 5720, "nonMembers": 13347 }
      }
    },
    {
      "name": "Purok 5",
      "population": 15413,
      "budget": 53571,
      "demographics": {
        "gender": { "male": 7707, "female": 7706 },
        "employment": { "employed": 9248, "unemployed": 6165 },
        "fourPs": { "members": 4624, "nonMembers": 10789 }
      }
    },
    {
      "name": "Purok 6",
      "population": 18156,
      "budget": 62500,
      "demographics": {
        "gender": { "male": 9078, "female": 9078 },
        "employment": { "employed": 10894, "unemployed": 7262 },
        "fourPs": { "members": 5447, "nonMembers": 12709 }
      }
    },
    {
      "name": "Purok 7",
      "population": 17245,
      "budget": 59524,
      "demographics": {
        "gender": { "male": 8623, "female": 8622 },
        "employment": { "employed": 10347, "unemployed": 6898 },
        "fourPs": { "members": 5174, "nonMembers": 12071 }
      }
    },
    {
      "name": "Purok 8",
      "population": 16324,
      "budget": 56548,
      "demographics": {
        "gender": { "male": 8162, "female": 8162 },
        "employment": { "employed": 9794, "unemployed": 6530 },
        "fourPs": { "members": 4897, "nonMembers": 11427 }
      }
    },
    {
      "name": "Purok 9",
      "population": 19978,
      "budget": 68452,
      "demographics": {
        "gender": { "male": 9989, "female": 9989 },
        "employment": { "employed": 11987, "unemployed": 7991 },
        "fourPs": { "members": 5993, "nonMembers": 13985 }
      }
    },
    {
      "name": "Purok 10",
      "population": 20889,
      "budget": 71429,
      "demographics": {
        "gender": { "male": 10445, "female": 10444 },
        "employment": { "employed": 12533, "unemployed": 8356 },
        "fourPs": { "members": 6267, "nonMembers": 14622 }
      }
    },
    {
      "name": "Purok 11",
      "population": 15413,
      "budget": 53571,
      "demographics": {
        "gender": { "male": 7707, "female": 7706 },
        "employment": { "employed": 9248, "unemployed": 6165 },
        "fourPs": { "members": 4624, "nonMembers": 10789 }
      }
    },
    {
      "name": "Purok 12",
      "population": 17245,
      "budget": 59524,
      "demographics": {
        "gender": { "male": 8623, "female": 8622 },
        "employment": { "employed": 10347, "unemployed": 6898 },
        "fourPs": { "members": 5174, "nonMembers": 12071 }
      }
    },
    {
      "name": "Purok 13",
      "population": 18156,
      "budget": 62500,
      "demographics": {
        "gender": { "male": 9078, "female": 9078 },
        "employment": { "employed": 10894, "unemployed": 7262 },
        "fourPs": { "members": 5447, "nonMembers": 12709 }
      }
    },
    {
      "name": "Purok 14",
      "population": 16324,
      "budget": 56548,
      "demographics": {
        "gender": { "male": 8162, "female": 8162 },
        "employment": { "employed": 9794, "unemployed": 6530 },
        "fourPs": { "members": 4897, "nonMembers": 11427 }
      }
    },
    {
      "name": "Purok 15",
      "population": 19067,
      "budget": 65476,
      "demographics": {
        "gender": { "male": 9534, "female": 9533 },
        "employment": { "employed": 11440, "unemployed": 7627 },
        "fourPs": { "members": 5720, "nonMembers": 13347 }
      }
    },
    {
      "name": "Purok 16",
      "population": 15413,
      "budget": 53571,
      "demographics": {
        "gender": { "male": 7707, "female": 7706 },
        "employment": { "employed": 9248, "unemployed": 6165 },
        "fourPs": { "members": 4624, "nonMembers": 10789 }
      }
    },
    {
      "name": "Purok 17",
      "population": 18156,
      "budget": 62500,
      "demographics": {
        "gender": { "male": 9078, "female": 9078 },
        "employment": { "employed": 10894, "unemployed": 7262 },
        "fourPs": { "members": 5447, "nonMembers": 12709 }
      }
    },
    {
      "name": "Purok 18",
      "population": 17245,
      "budget": 59524,
      "demographics": {
        "gender": { "male": 8623, "female": 8622 },
        "employment": { "employed": 10347, "unemployed": 6898 },
        "fourPs": { "members": 5174, "nonMembers": 12071 }
      }
    },
    {
      "name": "Purok 19",
      "population": 16324,
      "budget": 56548,
      "demographics": {
        "gender": { "male": 8162, "female": 8162 },
        "employment": { "employed": 9794, "unemployed": 6530 },
        "fourPs": { "members": 4897, "nonMembers": 11427 }
      }
    },
    {
      "name": "Purok 20",
      "population": 19067,
      "budget": 65476,
      "demographics": {
        "gender": { "male": 9534, "female": 9533 },
        "employment": { "employed": 11440, "unemployed": 7627 },
        "fourPs": { "members": 5720, "nonMembers": 13347 }
      }
    },
    {
      "name": "Purok 21",
      "population": 15413,
      "budget": 53571,
      "demographics": {
        "gender": { "male": 7707, "female": 7706 },
        "employment": { "employed": 9248, "unemployed": 6165 },
        "fourPs": { "members": 4624, "nonMembers": 10789 }
      }
    }
  ],
  "province": "Lanao del Norte",
  "totalPopulation": 363115,
  "totalBudget": 1250000,
  "captain": "Zosima Anduyan"
};

// Function to initialize/seed Redis with Barangay Santiago data
async function initializeBarangayData(redisClient) {
  try {
    // Check if data already exists to avoid duplication
    const exists = await redisClient.exists('barangay:santiago');
    if (exists) {
      console.log('Barangay Santiago data already exists in Redis.');
      return;
    }
    
    console.log('Initializing Barangay Santiago data...');
    
    // Store the main barangay information
    await redisClient.hSet('barangay:santiago', {
      province: barangayData.province,
      totalPopulation: barangayData.totalPopulation,
      totalBudget: barangayData.totalBudget,
      captain: barangayData.captain
    });
    
    // Store each purok's data
    for (const purok of barangayData.purok) {
      const purokKey = `barangay:santiago:purok:${purok.name.replace(/\s+/g, '')}`;
      
      // Store basic purok info
      await redisClient.hSet(purokKey, {
        name: purok.name,
        population: purok.population,
        budget: purok.budget
      });
      
      // Store demographics data
      await redisClient.hSet(`${purokKey}:demographics:gender`, purok.demographics.gender);
      await redisClient.hSet(`${purokKey}:demographics:employment`, purok.demographics.employment);
      await redisClient.hSet(`${purokKey}:demographics:fourPs`, purok.demographics.fourPs);
    }
    
    // Store a list of all puroks for easy access
    await redisClient.sAdd('barangay:santiago:purokList', ...barangayData.purok.map(p => p.name));
    
    console.log('✅ Barangay Santiago data initialized successfully!');
  } catch (error) {
    console.error('Error initializing Barangay Santiago data:', error);
  }
}

// Initialize and connect Redis client
const startServer = async () => {
  try {
    const redisClient = createRedisClient();
    await redisClient.connect();
    
    // Initialize sample data
    await initializeBarangayData(redisClient);
    
    // Create model instance
    const barangayModel = new BarangayModel(redisClient);
    app.locals.barangayModel = barangayModel;
    app.locals.redisClient = redisClient;
    
    // Routes
    app.use('/api', apiRoutes);
    
    // Default route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Barangay Profiling API', 
        version: '1.0.0',
        endpoints: [
          { method: 'GET', path: '/api/profiles', description: 'Get all barangay profiles' },
          { method: 'GET', path: '/api/profiles/:id', description: 'Get a specific barangay profile' },
          { method: 'POST', path: '/api/profiles', description: 'Create a new barangay profile' },
          { method: 'PUT', path: '/api/profiles/:id', description: 'Update a barangay profile' },
          { method: 'DELETE', path: '/api/profiles/:id', description: 'Delete a barangay profile' },
          { method: 'GET', path: '/api/profile/stats', description: 'Get demographic statistics' },
          { method: 'GET', path: '/api/health', description: 'Check server health' }
        ]
      });
    });
    
    // Handle 404 errors
    app.use((req, res) => {
      res.status(404).json({ message: 'Endpoint not found' });
    });
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      await redisClient.quit();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();