import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/profiles');
    }
  }, [navigate]);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // For demo purposes - simulate login with different credentials for different roles
      if (username === 'admin' && password === 'admin123') {
        // Admin login
        localStorage.setItem('token', 'admin-demo-token');
        localStorage.setItem('role', 'admin');
        localStorage.setItem('username', username);
        navigate('/profiles');
      } else if (username === 'viewer' && password === 'viewer123') {
        // Viewer login
        localStorage.setItem('token', 'viewer-demo-token');
        localStorage.setItem('role', 'viewer');
        localStorage.setItem('username', username);
        navigate('/profiles');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!username || !password || !confirmPassword || !email) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // For demo purposes - simulate successful registration
      setTimeout(() => {
        // In a real app, this would make an API call to register the user
        alert('Registration successful! You can now login with your credentials.');
        setIsRegistering(false);
        setConfirmPassword('');
        setEmail('');
      }, 1000);
      
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between login and registration forms
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError(null);
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#0B1354]">Barangay Santiago Profiling System</h1>
        <h2 className="text-xl text-gray-700 mb-6 text-center">
          {isRegistering ? 'Register Account' : 'Login'}
        </h2>
        
        {error && (
          <div className="bg-[#F9D1D1] border border-[#F765A3] text-[#F765A3] px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isRegistering ? (
          // Registration Form
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#A155B9]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#A155B9]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#A155B9]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#A155B9]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <button
                type="submit"
                className={`w-full bg-[#A155B9] hover:bg-[#7E3BA1] text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#A155B9] ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#A155B9]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#A155B9]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <button
                type="submit"
                className={`w-full bg-[#A155B9] hover:bg-[#7E3BA1] text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-[#A155B9] ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-6 border-t pt-4">
          <p className="text-gray-600 mb-2">
            {isRegistering 
              ? 'Already have an account?' 
              : "Don't have an account yet?"}
          </p>
          <button
            onClick={toggleForm}
            className="text-[#A155B9] hover:text-[#7E3BA1] font-medium"
          >
            {isRegistering ? 'Log in here' : 'Register now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;