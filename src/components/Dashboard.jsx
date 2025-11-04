import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DishesTest from './DishesTest';
import OrdersList from './OrdersList';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
            <DashboardIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              ¡Bienvenido a tu Dashboard!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {user?.firstName || user?.username}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={
                  user?.role === 'admin' ? 'Administrador' :
                  user?.role === 'moderator' ? 'Moderador' : 'Usuario'
                }
                color={
                  user?.role === 'admin' ? 'error' :
                  user?.role === 'moderator' ? 'warning' : 'primary'
                }
                icon={user?.role === 'admin' ? <AdminIcon /> : undefined}
              />
            </Box>
          </Box>
        </Box>

        {/* Role-based navigation */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Paneles Disponibles:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {user?.role === 'admin' && (
              <Button
                component={Link}
                to="/admin"
                variant="contained"
                color="error"
                startIcon={<AdminIcon />}
                size="large"
              >
                Panel Administrador
              </Button>
            )}

            {user?.role === 'moderator' && (
              <Button
                component={Link}
                to="/moderator"
                variant="contained"
                color="warning"
                startIcon={<PeopleIcon />}
                size="large"
              >
                Panel Moderador
              </Button>
            )}

            <Button
              component={Link}
              to="/"
              variant="outlined"
              startIcon={<HomeIcon />}
              size="large"
            >
              Volver al Inicio
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Dishes Context Test */}
      <DishesTest />

      {/* Orders Management */}
      <OrdersList />
    </Container>
  );
};

export default Dashboard;
