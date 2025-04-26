// controllers/barangay.js

// Get all barangay profiles
const getAllProfiles = async (req, res) => {
    try {
      const profiles = await req.app.locals.barangayModel.getAll();
      res.json(profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Get a single profile by ID
  const getProfileById = async (req, res) => {
    try {
      const profile = await req.app.locals.barangayModel.getById(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile by ID:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Create a new barangay profile
  const createProfile = async (req, res) => {
    const { name, province, captain } = req.body;
    
    if (!name || !province || !captain) {
      return res.status(400).json({ message: 'Missing required fields (name, province, and captain are required)' });
    }
  
    try {
      const newProfile = await req.app.locals.barangayModel.create(req.body);
      res.status(201).json(newProfile);
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Update a barangay profile
  const updateProfile = async (req, res) => {
    try {
      const updatedProfile = await req.app.locals.barangayModel.update(req.params.id, req.body);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Delete a barangay profile
  const deleteProfile = async (req, res) => {
    try {
      const deletedProfile = await req.app.locals.barangayModel.delete(req.params.id);
      
      if (!deletedProfile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json({ message: 'Profile deleted successfully', profile: deletedProfile });
    } catch (error) {
      console.error('Error deleting profile:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Get demographic statistics
  const getStats = async (req, res) => {
    try {
      const stats = await req.app.locals.barangayModel.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching demographic statistics:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  // Check health status
  const checkHealth = async (req, res) => {
    try {
      const health = await req.app.locals.barangayModel.checkHealth();
      res.json(health);
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({ 
        status: 'Error', 
        message: 'Server is running but Redis connection failed' 
      });
    }
  };
  
  module.exports = {
    getAllProfiles,
    getProfileById,
    createProfile,
    updateProfile,
    deleteProfile,
    getStats,
    checkHealth
  };