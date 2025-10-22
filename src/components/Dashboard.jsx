import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h2>Dashboard Page (Private)</h2>
      <p>Welcome to your private dashboard!</p>
      <Link to="/">Go to Home</Link>
    </div>
  );
};

export default Dashboard;
