import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  
  // Get user information
  const username = localStorage.getItem('username') || 'User';
  const userRole = localStorage.getItem('role') || '';
  const isAdmin = userRole === 'admin';

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="bg-[#0B1354] text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Barangay Santiago Profiling System</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="flex space-x-2">
              <NavLink to="/profiles" active={isActive('/profiles')}>Profiles</NavLink>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              {isAdmin && (
                <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
              )}
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center ml-6 border-l pl-4 border-[#A155B9]">
              <div className="text-sm mr-4">
                <span className="block text-[#D4A7E3]">Logged in as</span>
                <span className="font-semibold">{username} ({userRole})</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-[#A155B9] hover:bg-[#7E3BA1] text-white px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="md:hidden">
            {/* Mobile menu button */}
            <button className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu would go here */}
    </nav>
  );
};

// Helper component for nav links
const NavLink = ({ to, active, children }) => (
  <Link 
    to={to} 
    className={`px-3 py-2 rounded-md text-sm font-medium ${
      active 
        ? 'bg-[#A155B9] text-white' 
        : 'text-white hover:bg-[#7E3BA1] hover:text-white'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;