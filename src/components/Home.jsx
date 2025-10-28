import React from 'react';
import { Link } from 'react-router-dom';
import UserInfo from './UserInfo';

const Home = () => {
  return (
    <div>
      <h2>Home Page</h2>
      <UserInfo />
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard (Private)</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register">Register</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
