import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to the admin panel!</p>
      <p>You have full administrative privileges.</p>
      <Link to="/dashboard">Go to User Dashboard</Link>
    </div>
  );
};

export default AdminDashboard;
