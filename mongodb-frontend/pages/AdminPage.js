// client/src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { fetchProfiles, deleteProfile } from '../utils/api';

const AdminPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    totalPopulation: 0,
    averageBudget: 0
  });

  // Fetch profiles data on component mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        const data = await fetchProfiles();
        setProfiles(data);
        
        // Calculate statistics
        const totalPopulation = data.reduce((sum, profile) => sum + (profile.population || 0), 0);
        const totalBudget = data.reduce((sum, profile) => sum + (profile.budget || 0), 0);
        
        setStats({
          totalProfiles: data.length,
          totalPopulation,
          averageBudget: data.length > 0 ? totalBudget / data.length : 0
        });
        
        setError(null);
      } catch (err) {
        console.error('Error loading profiles:', err);
        setError(`Failed to load profiles: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfiles();
  }, []);

  // Handle profile deletion
  const handleDeleteProfile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteProfile(id);
      // Remove from state
      setProfiles(profiles.filter(profile => profile._id !== id));
      // Update stats
      const updatedProfiles = profiles.filter(profile => profile._id !== id);
      const totalPopulation = updatedProfiles.reduce((sum, profile) => sum + (profile.population || 0), 0);
      const totalBudget = updatedProfiles.reduce((sum, profile) => sum + (profile.budget || 0), 0);
      
      setStats({
        totalProfiles: updatedProfiles.length,
        totalPopulation,
        averageBudget: updatedProfiles.length > 0 ? totalBudget / updatedProfiles.length : 0
      });
      
      // Clear selected profile if it was deleted
      if (selectedBarangay && selectedBarangay._id === id) {
        setSelectedBarangay(null);
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError(`Failed to delete profile: ${err.message}`);
    }
  };

  // Handle profile selection for detailed view
  const handleSelectProfile = (profile) => {
    setSelectedBarangay(profile);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0B1354]">Admin Dashboard</h1>
      
      {/* Error Message */}
      {error && (
        <div className="bg-[#F9D1D1] border border-[#F765A3] text-[#F765A3] px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
          <button 
            className="ml-2 text-[#A155B9] underline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#A155B9] text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Barangays</h3>
          <p className="text-3xl font-bold">{stats.totalProfiles}</p>
        </div>
        
        <div className="bg-[#0B1354] text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Population</h3>
          <p className="text-3xl font-bold">{stats.totalPopulation.toLocaleString()}</p>
        </div>
        
        <div className="bg-[#F765A3] text-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Average Budget</h3>
          <p className="text-3xl font-bold">₱{stats.averageBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Barangay List */}
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-4 border border-[#F9D1D1]">
            <h2 className="text-xl font-semibold mb-4 text-[#0B1354]">Barangay Management</h2>
            
            {loading ? (
              <p className="text-center py-4">Loading profiles...</p>
            ) : profiles.length === 0 ? (
              <p className="text-center py-4">No barangay profiles found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#F9D1D1]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0B1354] uppercase tracking-wider">Purok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0B1354] uppercase tracking-wider">Province</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0B1354] uppercase tracking-wider">Population</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#0B1354] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {profiles.map(profile => (
                      <tr 
                        key={profile._id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedBarangay && selectedBarangay._id === profile._id ? 'bg-[#D4A7E3]' : ''
                        }`}
                        onClick={() => handleSelectProfile(profile)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{profile.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{profile.province}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{profile.population?.toLocaleString() || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleDeleteProfile(profile._id);
                            }}
                            className="text-[#F765A3] hover:text-[#F765A3]/80"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Barangay Detail */}
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-4 border border-[#F9D1D1]">
            <h2 className="text-xl font-semibold mb-4 text-[#0B1354]">
              {selectedBarangay ? `${selectedBarangay.name} Details` : 'Select a Barangay'}
            </h2>
            
            {selectedBarangay ? (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{selectedBarangay.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Province</p>
                    <p className="font-semibold">{selectedBarangay.province}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Population</p>
                    <p className="font-semibold">{selectedBarangay.population?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold">₱{selectedBarangay.budget?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Captain</p>
                    <p className="font-semibold">{selectedBarangay.captain}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-[#0B1354]">Demographics</h3>
                
                {selectedBarangay.demographics ? (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Gender Demographics */}
                    <div className="border border-[#F9D1D1] rounded-md p-3">
                      <h4 className="font-medium mb-2 text-[#A155B9]">Gender Distribution</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Male</p>
                          <p className="font-semibold">{selectedBarangay.demographics.gender?.male?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Female</p>
                          <p className="font-semibold">{selectedBarangay.demographics.gender?.female?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Employment Demographics */}
                    <div className="border border-[#F9D1D1] rounded-md p-3">
                      <h4 className="font-medium mb-2 text-[#A155B9]">Employment Status</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Employed</p>
                          <p className="font-semibold">{selectedBarangay.demographics.employment?.employed?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Unemployed</p>
                          <p className="font-semibold">{selectedBarangay.demographics.employment?.unemployed?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 4Ps Demographics */}
                    <div className="border border-[#F9D1D1] rounded-md p-3">
                      <h4 className="font-medium mb-2 text-[#A155B9]">4Ps Program</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Members</p>
                          <p className="font-semibold">{selectedBarangay.demographics.fourPs?.members?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Non-Members</p>
                          <p className="font-semibold">{selectedBarangay.demographics.fourPs?.nonMembers?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No demographic data available.</p>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => handleDeleteProfile(selectedBarangay._id)}
                    className="bg-[#F765A3] hover:bg-[#F765A3]/80 text-white px-4 py-2 rounded"
                  >
                    Delete Profile
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-10">
                Select a barangay from the list to view details.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* System Information */}
      <div className="mt-8 bg-[#F9D1D1]/30 p-4 rounded-lg border border-[#F9D1D1]">
        <h3 className="text-lg font-semibold mb-2 text-[#0B1354]">System Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Last Data Update</p>
            <p className="font-medium">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Server Status</p>
            <p className="font-medium text-[#A155B9]">Online</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current User</p>
            <p className="font-medium">Admin</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Session Expiry</p>
            <p className="font-medium">
              {new Date(Date.now() + 3600000).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;