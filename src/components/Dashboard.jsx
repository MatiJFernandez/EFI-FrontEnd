import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h2>Dashboard Page (Private)</h2>
      <p>Welcome to your private dashboard, {user?.firstName || user?.username}!</p>
      <p>Your role: <strong>{user?.role || 'user'}</strong></p>

      {/* Navigation based on role */}
      {user?.role === 'admin' && (
        <div>
          <p>As an admin, you can access:</p>
          <Link to="/admin">Admin Panel</Link>
        </div>
      )}

      {user?.role === 'moderator' && (
        <div>
          <p>As a moderator, you can access:</p>
          <Link to="/moderator">Moderator Panel</Link>
        </div>
      )}

      <br />
      <Link to="/">Go to Home</Link>
    </div>
  );
};

export default Dashboard;
