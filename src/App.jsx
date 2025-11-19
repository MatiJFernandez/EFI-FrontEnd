import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import ModeratorDashboard from './components/ModeratorDashboard';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import WaiterOrderForm from './pages/orders/WaiterOrderForm';
import ChefOrdersQueue from './pages/orders/ChefOrdersQueue';
import OrderDetail from './pages/orders/OrderDetail';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DishesProvider } from './context/DishesContext';
import { TablesProvider } from './context/TablesContext';
import { OrdersProvider } from './context/OrdersContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DishesProvider>
          <TablesProvider>
            <OrdersProvider>
              <Router>
                <ErrorBoundary>
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
                    {/* Ruta /admin removida: redirigir a /dashboard */}
                    <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
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
                        <PrivateRoute requiredRole="user">
                          <WaiterOrderForm />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/chef/orders"
                      element={
                        <PrivateRoute requiredRoles={["admin", "moderator", "chef"]}>
                          <ChefOrdersQueue />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <PrivateRoute>
                          <OrderDetail />
                        </PrivateRoute>
                      }
                    />
                    </Routes>
                  </div>
                </ErrorBoundary>
              </Router>
            </OrdersProvider>
          </TablesProvider>
        </DishesProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
