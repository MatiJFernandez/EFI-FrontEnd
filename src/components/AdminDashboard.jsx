import React from 'react';
import { Link } from 'react-router-dom';
import DishForm from './DishForm';

const AdminDashboard = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to the admin panel!</p>
      <p>You have full administrative privileges.</p>
      <Link to="/dashboard">Go to User Dashboard</Link>
      <hr />
      <DishForm onSubmit={(data) => { console.log('Plato enviado:', data); }} />
    </div>
  );
};

export default AdminDashboard;
