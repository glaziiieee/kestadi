import React, { useState, useEffect, useCallback } from 'react';
import { fetchProfiles, createProfile, updateProfile, deleteProfile, fetchStats } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const ProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [isEditMode, setIsEditMode] = useState(false);
  const [stats, setStats] = useState({
    genderStats: [],
    employmentStats: [],
    fourPsStats: []
  });
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    population: 0,
    budget: 0,
    captain: '',
    demographics: {
      gender: {
        male: 0,
        female: 0
      },
      employment: {
        employed: 0,
        unemployed: 0
      },
      fourPs: {
        members: 0,
        nonMembers: 0
      }
    }
  });

  // Get user role from localStorage
  const userRole = localStorage.getItem('role') || '';
  const isAdmin = userRole === 'admin';
  const isViewer = userRole === 'viewer';

  // Fetch profiles and stats from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const profilesData = await fetchProfiles();
      setProfiles(profilesData);
      
      // Calculate total population
      const totalPop = profilesData.reduce((sum, profile) => sum + (profile.population || 0), 0);
      setTotalPopulation(totalPop);
      
      // Fetch demographic statistics
      const statsData = await fetchStats();
      setStats(statsData);
      
      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format data for population summary chart
  const formatPopulationData = () => {
    const maleCount = stats.genderStats.find(item => item._id === 'Male')?.count || 0;
    const femaleCount = stats.genderStats.find(item => item._id === 'Female')?.count || 0;
    const employedCount = stats.employmentStats.find(item => item._id === 'Employed')?.count || 0;
    const unemployedCount = stats.employmentStats.find(item => item._id === 'Unemployed')?.count || 0;
    const fourPsMembersCount = stats.fourPsStats.find(item => item._id === 'Members')?.count || 0;
    const fourPsNonMembersCount = stats.fourPsStats.find(item => item._id === 'Non-Members')?.count || 0;
    
    return [
      { name: 'Male', value: maleCount, fill: '#0B1354' },
      { name: 'Female', value: femaleCount, fill: '#F765A3' },
      { name: 'Employed', value: employedCount, fill: '#A155B9' },
      { name: 'Unemployed', value: unemployedCount, fill: '#7E3BA1' },
      { name: '4Ps Members', value: fourPsMembersCount, fill: '#D4A7E3' },
      { name: 'Non-4Ps', value: fourPsNonMembersCount, fill: '#F9D1D1' },
    ];
  };

  // Filter and sort profiles based on search term and sort option
  const filteredProfiles = profiles
    .filter(profile => profile.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'budget') {
        return b.budget - a.budget;
      }
      return 0;
    });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields for demographics
    if (name.includes('.')) {
      const [category, subcategory] = name.split('.');
      setFormData({
        ...formData,
        demographics: {
          ...formData.demographics,
          [category]: {
            ...formData.demographics[category],
            [subcategory]: Number(value)
          }
        }
      });
    } else {
      // Handle regular fields
      setFormData({
        ...formData,
        [name]: name === 'population' || name === 'budget' ? Number(value) : value
      });
    }
  };

  // Handle edit button click
  const handleEdit = (profile) => {
    if (!isAdmin) return; // Only admins can edit
    
    setIsEditMode(true);
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      province: profile.province,
      population: profile.population || 0,
      budget: profile.budget || 0,
      captain: profile.captain,
      demographics: profile.demographics || {
        gender: { male: 0, female: 0 },
        employment: { employed: 0, unemployed: 0 },
        fourPs: { members: 0, nonMembers: 0 }
      }
    });
  };

  // Handle add new profile button click
  const handleAddNew = () => {
    if (!isAdmin) return; // Only admins can add
    
    setIsEditMode(true);
    setSelectedProfile(null);
    setFormData({
      name: 'Purok',
      province: 'Lanao del Norte',
      population: 0,
      budget: 0,
      captain: 'Dominador A. Ebao',
      demographics: {
        gender: { male: 0, female: 0 },
        employment: { employed: 0, unemployed: 0 },
        fourPs: { members: 0, nonMembers: 0 }
      }
    });
  };

  // Close modal and reset form
  const closeModal = () => {
    setIsEditMode(false);
    setSelectedProfile(null);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) return; // Only admins can submit changes
    
    try {
      if (selectedProfile) {
        // Update existing profile
        await updateProfile(selectedProfile._id, formData);
      } else {
        // Create new profile
        await createProfile(formData);
      }
      
      // Reload profiles and close modal
      await loadData();
      closeModal();
    } catch (err) {
      setError(`Failed to save profile: ${err.message}`);
    }
  };

  // Handle profile deletion
  const handleDelete = async (id) => {
    if (!isAdmin) return; // Only admins can delete
    
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }
    
    try {
      await deleteProfile(id);
      await loadData();
    } catch (err) {
      setError(`Failed to delete profile: ${err.message}`);
    }
  };

  // View profile details
  const handleViewDetails = (profile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purok Profiles</h1>
        
        {isAdmin && (
          <button
            onClick={handleAddNew}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Add New Profile
          </button>
        )}
      </div>
      
      {/* Population Summary Graph */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Population Summary</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formatPopulationData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
            <Bar dataKey="value" fill="#F765A3">
              {formatPopulationData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">Total Population</p>
          <p className="font-semibold">{totalPopulation.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Search and Sort Controls */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="w-full md:w-2/3 lg:w-1/2 relative">
          <input
            type="text"
            placeholder="🔍 Search Barangays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 rounded-full border-2 border-[#F765A3] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#A155B9] transition-all font-medium text-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="w-6 h-6 text-[#F765A3]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
        
        <div className="mt-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border-2 border-[#D4A7E3] rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-[#A155B9]"
          >
            <option value="name">Sort by Name</option>
            <option value="budget">Sort by Budget</option>
          </select>
        </div>
      </div>
      
      {/* Role indicator */}
      <div className={`mb-4 p-2 rounded-lg text-sm ${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
        You are logged in as: <span className="font-semibold">{userRole.toUpperCase()}</span>
        {isViewer && <span> (View-only access)</span>}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button 
            className="ml-2 text-blue-500 underline"
            onClick={() => {
              setError(null);
              loadData();
            }}
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-lg text-gray-600">Loading profiles...</p>
        </div>
      ) : profiles.length === 0 && !error ? (
        <div className="text-center py-8 bg-yellow-50 rounded-lg">
          <p className="text-lg">No barangay profiles found.</p>
          {isAdmin && (
            <button
              onClick={handleAddNew}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Add Your First Profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map(profile => (
            <div key={profile._id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              <p className="text-gray-600">Province: {profile.province}</p>
              <p className="text-gray-600">Population: {profile.population?.toLocaleString() || 'N/A'}</p>
              <p className="text-gray-600">Budget: ₱{profile.budget?.toLocaleString() || 'N/A'}</p>
              <p className="text-gray-600">Captain: {profile.captain}</p>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleViewDetails(profile)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View Details
                </button>
                
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleEdit(profile)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(profile._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* View Profile Modal */}
      {selectedProfile && !isEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedProfile.name} Details</h2>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{selectedProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Province</p>
                <p className="font-semibold">{selectedProfile.province}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Population</p>
                <p className="font-semibold">{selectedProfile.population?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-semibold">₱{selectedProfile.budget?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Captain</p>
                <p className="font-semibold">{selectedProfile.captain}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-3">Demographics</h3>
            
            {selectedProfile.demographics ? (
              <div className="grid grid-cols-1 gap-4">
                {/* Gender Demographics */}
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2">Gender Distribution</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Male</p>
                      <p className="font-semibold">{selectedProfile.demographics.gender?.male?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Female</p>
                      <p className="font-semibold">{selectedProfile.demographics.gender?.female?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Employment Demographics */}
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2">Employment Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Employed</p>
                      <p className="font-semibold">{selectedProfile.demographics.employment?.employed?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unemployed</p>
                      <p className="font-semibold">{selectedProfile.demographics.employment?.unemployed?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
                
                {/* 4Ps Demographics */}
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2">4Ps Program</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Members</p>
                      <p className="font-semibold">{selectedProfile.demographics.fourPs?.members?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Non-Members</p>
                      <p className="font-semibold">{selectedProfile.demographics.fourPs?.nonMembers?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No demographic data available.</p>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProfile(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleEdit(selectedProfile)}
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Edit/Create Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">
              {selectedProfile ? 'Edit Profile' : 'Add New Profile'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Province *</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Captain *</label>
                  <input
                    type="text"
                    name="captain"
                    value={formData.captain}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 mb-1">Population</label>
                    <input
                      type="number"
                      name="population"
                      value={formData.population}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Budget (₱)</label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              {/* Demographics */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Demographics</h3>
                
                <div className="mb-3">
                  <h4 className="text-md font-medium mb-1">Gender Distribution</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1">Male</label>
                      <input
                        type="number"
                        name="gender.male"
                        value={formData.demographics.gender.male}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1">Female</label>
                      <input
                        type="number"
                        name="gender.female"
                        value={formData.demographics.gender.female}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="text-md font-medium mb-1">Employment Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1">Employed</label>
                      <input
                        type="number"
                        name="employment.employed"
                        value={formData.demographics.employment.employed}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1">Unemployed</label>
                      <input
                        type="number"
                        name="employment.unemployed"
                        value={formData.demographics.employment.unemployed}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-1">4Ps Program</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1">Members</label>
                      <input
                        type="number"
                        name="fourPs.members"
                        value={formData.demographics.fourPs.members}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1">Non-Members</label>
                      <input
                        type="number"
                        name="fourPs.nonMembers"
                        value={formData.demographics.fourPs.nonMembers}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  disabled={!formData.name || !formData.province || !formData.captain}
                >
                  {selectedProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilesPage;