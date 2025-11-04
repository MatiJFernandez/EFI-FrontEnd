import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import ModeratorDashboard from './components/ModeratorDashboard';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import WaiterOrderForm from './pages/orders/WaiterOrderForm';
import ChefOrdersQueue from './pages/orders/ChefOrdersQueue';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DishesProvider } from './context/DishesContext';
import { TablesProvider } from './context/TablesContext';
import { OrdersProvider } from './context/OrdersContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DishesProvider>
          <TablesProvider>
            <OrdersProvider>
              <Router>
                <Navbar />
                <div className="App">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <PrivateRoute requiredRole="admin">
                          <AdminDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/moderator"
                      element={
                        <PrivateRoute requiredRole="moderator">
                          <ModeratorDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/waiter/orders/create"
                      element={
                        <PrivateRoute>
                          <WaiterOrderForm />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/chef/orders"
                      element={
                        <PrivateRoute>
                          <ChefOrdersQueue />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </div>
              </Router>
            </OrdersProvider>
          </TablesProvider>
        </DishesProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
