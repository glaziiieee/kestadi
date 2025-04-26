import React from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <h1>MongoDB Case Study</h1>
      <Login />
      {/* Add routing logic here */}
    </div>
  );
}

export default App;