// models/barangay.js
const { v4: uuidv4 } = require('uuid');

class BarangayModel {
  constructor(redisClient) {
    this.client = redisClient;
    this.keyPrefix = 'profile:';
  }

  // Get all profiles
  async getAll() {
    try {
      // Get all keys that match the profile pattern
      const keys = await this.client.keys(`${this.keyPrefix}*`);
      
      if (!keys || keys.length === 0) {
        return [];
      }
      
      // Get all profiles
      const profiles = [];
      for (const key of keys) {
        const profileStr = await this.client.get(key);
        if (profileStr) {
          profiles.push(JSON.parse(profileStr));
        }
      }
      
      return profiles;
    } catch (error) {
      console.error('Error getting all profiles:', error);
      throw error;
    }
  }

  // Get profile by ID
  async getById(id) {
    try {
      const profileStr = await this.client.get(`${this.keyPrefix}${id}`);
      
      if (!profileStr) {
        return null;
      }
      
      return JSON.parse(profileStr);
    } catch (error) {
      console.error(`Error getting profile with ID ${id}:`, error);
      throw error;
    }
  }

  // Create new profile
  async create(data) {
    try {
      const id = uuidv4();
      const newProfile = { 
        _id: id,
        name: data.name, 
        province: data.province, 
        population: data.population || 0, 
        budget: data.budget || 0, 
        captain: data.captain,
        demographics: data.demographics || {
          gender: { male: 0, female: 0 },
          employment: { employed: 0, unemployed: 0 },
          fourPs: { members: 0, nonMembers: 0 }
        }
      };
      
      await this.client.set(`${this.keyPrefix}${id}`, JSON.stringify(newProfile));
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  // Update profile
  async update(id, data) {
    try {
      const existingProfileStr = await this.client.get(`${this.keyPrefix}${id}`);
      
      if (!existingProfileStr) {
        return null;
      }
      
      const existingProfile = JSON.parse(existingProfileStr);
      
      // Update the profile with new data
      const updatedProfile = { 
        ...existingProfile,
        ...data,
        // Ensure _id is not overwritten
        _id: existingProfile._id,
        // Merge demographics rather than replace
        demographics: {
          ...existingProfile.demographics,
          ...(data.demographics || {}),
          // Merge nested objects
          gender: {
            ...existingProfile.demographics?.gender,
            ...(data.demographics?.gender || {})
          },
          employment: {
            ...existingProfile.demographics?.employment,
            ...(data.demographics?.employment || {})
          },
          fourPs: {
            ...existingProfile.demographics?.fourPs,
            ...(data.demographics?.fourPs || {})
          }
        }
      };
      
      await this.client.set(`${this.keyPrefix}${id}`, JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      console.error(`Error updating profile with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete profile
  async delete(id) {
    try {
      const profileStr = await this.client.get(`${this.keyPrefix}${id}`);
      
      if (!profileStr) {
        return null;
      }
      
      const profile = JSON.parse(profileStr);
      await this.client.del(`${this.keyPrefix}${id}`);
      return profile;
    } catch (error) {
      console.error(`Error deleting profile with ID ${id}:`, error);
      throw error;
    }
  }

  // Get demographic statistics
  async getStats() {
    try {
      // Fetch all profiles to calculate statistics
      const profiles = await this.getAll();
      
      // Initialize counters
      let maleCount = 0;
      let femaleCount = 0;
      let employedCount = 0;
      let unemployedCount = 0;
      let fourPsMembersCount = 0;
      let fourPsNonMembersCount = 0;
      
      // Calculate statistics from all profiles
      profiles.forEach(profile => {
        if (profile.demographics) {
          if (profile.demographics.gender) {
            maleCount += profile.demographics.gender.male || 0;
            femaleCount += profile.demographics.gender.female || 0;
          }
          if (profile.demographics.employment) {
            employedCount += profile.demographics.employment.employed || 0;
            unemployedCount += profile.demographics.employment.unemployed || 0;
          }
          if (profile.demographics.fourPs) {
            fourPsMembersCount += profile.demographics.fourPs.members || 0;
            fourPsNonMembersCount += profile.demographics.fourPs.nonMembers || 0;
          }
        }
      });
      
      // Format the statistics as expected by the client
      return {
        genderStats: [
          { _id: 'Male', count: maleCount },
          { _id: 'Female', count: femaleCount }
        ],
        employmentStats: [
          { _id: 'Employed', count: employedCount },
          { _id: 'Unemployed', count: unemployedCount }
        ],
        fourPsStats: [
          { _id: 'Members', count: fourPsMembersCount },
          { _id: 'Non-Members', count: fourPsNonMembersCount }
        ]
      };
    } catch (error) {
      console.error('Error getting demographic statistics:', error);
      throw error;
    }
  }

  // Check health status
  async checkHealth() {
    try {
      await this.client.ping();
      return { status: 'OK', message: 'Server is running and connected to Redis' };
    } catch (error) {
      console.error('Redis health check failed:', error);
      throw new Error('Redis connection failed');
    }
  }
}

module.exports = BarangayModel;