import React from 'react';
import { Link } from 'react-router-dom';

const ModeratorDashboard = () => {
  return (
    <div>
      <h2>Moderator Dashboard</h2>
      <p>Welcome to the moderator panel!</p>
      <p>You have moderation privileges.</p>
      <Link to="/dashboard">Go to User Dashboard</Link>
    </div>
  );
};

export default ModeratorDashboard;
