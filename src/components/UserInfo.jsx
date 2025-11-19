import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserInfo = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div>
        <p>No user logged in</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  const roleLabel = user.role === 'admin'
    ? 'Administrador'
    : user.role === 'moderator'
      ? 'Cocinero'
      : user.role === 'waiter'
        ? 'Mesero'
        : (user.role || 'Usuario');

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
      <h3>Current User Info</h3>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {roleLabel}</p>

      <div style={{ marginTop: '10px' }}>
        <h4>Test Role-Based Routes:</h4>
        <ul>
          <li><Link to="/dashboard">Dashboard (any authenticated user)</Link></li>
          <li><Link to="/admin">Admin Panel (admin only)</Link></li>
          <li><Link to="/moderator">Panel Cocinero (moderator only)</Link></li>
        </ul>
      </div>

      <button onClick={logout} style={{ marginTop: '10px' }}>Logout</button>
    </div>
  );
};

export default UserInfo;
