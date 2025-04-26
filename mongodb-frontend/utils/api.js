/**
 * API utility functions for the Barangay Santiago Profiling System
 * Contains all functions for interacting with the backend API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Checks if the server is healthy and connected to Redis
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Fetches all barangay profiles
 * @returns {Promise<Array>} Array of barangay profiles
 */
export const fetchProfiles = async () => {
  try {
    console.log('Fetching profiles from:', `${API_BASE_URL}/profiles`);
    const response = await fetch(`${API_BASE_URL}/profiles`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};

/**
 * Fetches a single barangay profile by ID
 * @param {string} id - Profile ID
 * @returns {Promise<Object>} Barangay profile
 */
export const fetchProfileById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching profile with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Creates a new barangay profile
 * @param {Object} profileData - Profile data
 * @returns {Promise<Object>} Created profile
 */
export const createProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

/**
 * Updates an existing barangay profile
 * @param {string} id - Profile ID
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = async (id, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating profile with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a barangay profile
 * @param {string} id - Profile ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteProfile = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting profile with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches demographic statistics
 * @returns {Promise<Object>} Demographic statistics
 */
export const fetchStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching demographic statistics:', error);
    throw error;
  }
};

/**
 * Simulates user login (replace with actual auth in production)
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authentication result with token and role
 */
export const loginUser = async (username, password) => {
  try {
    // This is a simulation for demo purposes
    // In a real app, you would call your auth API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'password') {
          resolve({
            success: true,
            token: 'demo-token-xyz-123',
            role: 'admin',
            user: {
              id: '1',
              username: 'admin',
              name: 'Administrator'
            }
          });
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 500); // Simulate network delay
    });
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logs out the current user by clearing localStorage
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

/**
 * Helper function to handle common request options
 * @returns {Object} Request options with auth header if token exists
 */
const getRequestOptions = () => {
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return options;
};