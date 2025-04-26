import React, { useState, useEffect } from 'react';
import { fetchStats, fetchProfiles } from '../utils/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    genderStats: [],
    employmentStats: [],
    fourPsStats: []
  });
  const [profiles, setProfiles] = useState([]);
  const [totalPopulation, setTotalPopulation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user role
  const userRole = localStorage.getItem('role') || '';
  const isAdmin = userRole === 'admin';
  const isViewer = userRole === 'viewer';

  // Fetch stats and calculate total population
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch demographic statistics
        const statsData = await fetchStats();
        setStats(statsData);
        
        // Fetch profiles to calculate total population
        const profilesData = await fetchProfiles();
        setProfiles(profilesData);
        const totalPop = profilesData.reduce((sum, profile) => sum + (profile.population || 0), 0);
        setTotalPopulation(totalPop);
        
        setError(null);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Chart colors - Updated with new palette
  const COLORS = ['#A155B9', '#0B1354', '#F765A3', '#7E3BA1', '#D4A7E3'];

  // Prepare data for summary section
  const summaryData = {
    totalBarangays: profiles.length,
    totalPopulation,
    maleCount: stats.genderStats.find(item => item._id === 'Male')?.count || 0,
    femaleCount: stats.genderStats.find(item => item._id === 'Female')?.count || 0,
    employedCount: stats.employmentStats.find(item => item._id === 'Employed')?.count || 0,
    unemployedCount: stats.employmentStats.find(item => item._id === 'Unemployed')?.count || 0,
    fourPsMembersCount: stats.fourPsStats.find(item => item._id === 'Members')?.count || 0,
    fourPsNonMembersCount: stats.fourPsStats.find(item => item._id === 'Non-Members')?.count || 0
  };

  // Format PieChart data
  const formatPieData = (statsArray) => {
    return statsArray.map((item, index) => ({
      name: item._id,
      value: item.count,
      color: COLORS[index % COLORS.length]
    }));
  };

  // Format BarChart data
  const formatBarData = (statsArray) => {
    return statsArray.map(item => ({
      name: item._id,
      value: item.count
    }));
  };

  // Custom label for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0B1354]">Barangay Dashboard</h1>
      
      {/* Role indicator - Updated with new colors */}
      <div className={`mb-4 p-2 rounded-lg text-sm ${isAdmin ? 'bg-[#D4A7E3] text-[#0B1354]' : 'bg-[#F9D1D1] text-[#F765A3]'}`}>
        You are logged in as: <span className="font-semibold">{userRole.toUpperCase()}</span>
        {isViewer && <span> (View-only access)</span>}
      </div>
      
      {/* Error Message - Updated with new colors */}
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
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards - Updated with new colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard 
              title="Total Population" 
              value={summaryData.totalPopulation.toLocaleString()} 
              bgColor="bg-[#A155B9]"
            />
            <SummaryCard 
              title="Employment Rate" 
              value={`${((summaryData.employedCount / (summaryData.employedCount + summaryData.unemployedCount)) * 100 || 0).toFixed(1)}%`} 
              bgColor="bg-[#0B1354]"
            />
            <SummaryCard 
              title="4Ps Beneficiaries" 
              value={`${summaryData.fourPsMembersCount.toLocaleString()} (${((summaryData.fourPsMembersCount / totalPopulation) * 100 || 0).toFixed(1)}%)`} 
              bgColor="bg-[#F765A3]"
            />
            <SummaryCard 
              title="Gender Ratio (M:F)" 
              value={`1:${(summaryData.femaleCount / summaryData.maleCount || 1).toFixed(2)}`} 
              bgColor="bg-[#7E3BA1]"
            />
          </div>
          
          {/* Barangay Statistics - Updated with new colors */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-8 border border-[#F9D1D1]">
            <h2 className="text-xl font-semibold mb-4 text-[#0B1354]">Barangay Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-gray-600">Total Barangays</p>
                <p className="text-3xl font-bold text-[#A155B9]">{summaryData.totalBarangays}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Average Population</p>
                <p className="text-3xl font-bold text-[#A155B9]">
                  {summaryData.totalBarangays > 0
                    ? Math.round(summaryData.totalPopulation / summaryData.totalBarangays).toLocaleString()
                    : 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Data Last Updated</p>
                <p className="text-xl font-bold text-[#A155B9]">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gender Distribution */}
            <ChartCard title="Gender Distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatPieData(stats.genderStats)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatPieData(stats.genderStats).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Male</p>
                  <p className="font-semibold">{summaryData.maleCount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Female</p>
                  <p className="font-semibold">{summaryData.femaleCount.toLocaleString()}</p>
                </div>
              </div>
            </ChartCard>
            
            {/* Employment Status */}
            <ChartCard title="Employment Status">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatBarData(stats.employmentStats)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="value" fill="#A155B9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Employed</p>
                  <p className="font-semibold">{summaryData.employedCount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Unemployed</p>
                  <p className="font-semibold">{summaryData.unemployedCount.toLocaleString()}</p>
                </div>
              </div>
            </ChartCard>
            
            {/* 4Ps Membership */}
            <ChartCard title="4Ps Program Membership">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatPieData(stats.fourPsStats)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatPieData(stats.fourPsStats).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Members</p>
                  <p className="font-semibold">{summaryData.fourPsMembersCount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Non-Members</p>
                  <p className="font-semibold">{summaryData.fourPsNonMembersCount.toLocaleString()}</p>
                </div>
              </div>
            </ChartCard>
            
            {/* Population Summary */}
            <ChartCard title="Population Summary">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Male', value: summaryData.maleCount },
                      { name: 'Female', value: summaryData.femaleCount },
                      { name: 'Employed', value: summaryData.employedCount },
                      { name: 'Unemployed', value: summaryData.unemployedCount },
                      { name: '4Ps Members', value: summaryData.fourPsMembersCount },
                      { name: 'Non-4Ps', value: summaryData.fourPsNonMembersCount },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="value" fill="#A155B9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">Total Population</p>
                <p className="font-semibold">{summaryData.totalPopulation.toLocaleString()}</p>
              </div>
            </ChartCard>
          </div>
          
          {/* Additional Info - Updated with new colors */}
          <div className="bg-[#F9D1D1] rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0B1354] mb-2">About Demographic Data</h3>
            <p className="text-sm text-[#0B1354]">
              This dashboard presents aggregate demographic data from all registered barangays. The data is updated as barangay profiles are added, edited, or removed from the system. For detailed information about specific barangays, please visit the Profiles page.
            </p>
            {isAdmin && (
              <p className="text-sm text-[#0B1354] mt-2">
                <strong>Admin Note:</strong> As an administrator, you can update barangay profiles to reflect the latest demographic information.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, bgColor = 'bg-[#A155B9]' }) => {
  return (
    <div className={`${bgColor} text-white rounded-lg shadow-md p-4`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// Chart Card Component
const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-[#F9D1D1]">
      <h3 className="text-lg font-semibold mb-4 text-[#0B1354]">{title}</h3>
      {children}
    </div>
  );
};

export default Dashboard;