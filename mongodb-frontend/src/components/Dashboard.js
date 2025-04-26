import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch user data here
    // For now, we'll simulate it
    const token = localStorage.getItem('token');
    if (token) {
      setUserData({ username: 'User' });
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Redirect to login page
    window.location.href = '/login';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {userData.username}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;