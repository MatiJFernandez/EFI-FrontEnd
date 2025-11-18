import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDishes } from '../context/DishesContext';
import { useTables } from '../context/TablesContext';
import { useOrders } from '../context/OrdersContext';
import DishesTest from './DishesTest';
import OrdersList from './OrdersList';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  TableRestaurant as TableIcon,
  ShoppingCart as OrdersIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignmentIcon,
  Kitchen as KitchenIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const { dishes } = useDishes();
  const { tables } = useTables();
  const { orders } = useOrders();

  const [activeTab, setActiveTab] = useState(0);

  // Estadísticas generales
  const stats = {
    totalDishes: Array.isArray(dishes) ? dishes.length : 0,
    availableDishes: Array.isArray(dishes) ? dishes.filter(d => d.available).length : 0,
    totalTables: Array.isArray(tables) ? tables.length : 0,
    availableTables: Array.isArray(tables) ? tables.filter(t => t.available).length : 0,
    totalOrders: Array.isArray(orders) ? orders.length : 0,
    activeOrders: Array.isArray(orders) ? orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length : 0,
    pendingOrders: Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0
  };

  const tabs = [
    { label: 'Resumen', icon: <AnalyticsIcon /> },
    { label: 'Platos', icon: <RestaurantIcon /> },
    { label: 'Pedidos', icon: <OrdersIcon /> }
  ];

  // Determinar si el usuario puede crear pedidos (waiter, moderator, admin)
  const canCreateOrders = ['admin', 'moderator', 'waiter'].includes(user?.role);

  // Determinar si el usuario puede acceder a la cola de cocina (chef, admin, moderator)
  const canAccessKitchen = ['admin', 'moderator', 'chef'].includes(user?.role);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
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
                  user?.role === 'moderator' ? 'Moderador' :
                  user?.role === 'waiter' ? 'Mesero' : 'Usuario'
                }
                color={
                  user?.role === 'admin' ? 'error' :
                  user?.role === 'moderator' ? 'warning' :
                  user?.role === 'waiter' ? 'info' : 'primary'
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

            {canCreateOrders && (
              <Button
                component={Link}
                to="/waiter/orders/create"
                variant="contained"
                color="success"
                startIcon={<AssignmentIcon />}
                size="large"
              >
                Crear Pedido
              </Button>
            )}

            {canAccessKitchen && (
              <Button
                component={Link}
                to="/chef/orders"
                variant="contained"
                color="secondary"
                startIcon={<KitchenIcon />}
                size="large"
              >
                Cola de Cocina
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

      {/* Tabs Navigation */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  {tab.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        /* Resumen */
        <Grid container spacing={3}>
          {/* Estadísticas principales */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              📊 Resumen General
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RestaurantIcon color="primary" />
                  <Box>
                    <Typography variant="h4">{stats.availableDishes}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platos Disponibles
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      de {stats.totalDishes} totales
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TableIcon color="secondary" />
                  <Box>
                    <Typography variant="h4">{stats.availableTables}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mesas Disponibles
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      de {stats.totalTables} totales
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <OrdersIcon color="warning" />
                  <Box>
                    <Typography variant="h4">{stats.totalOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pedidos Totales
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon color="info" />
                  <Box>
                    <Typography variant="h4">{stats.activeOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pedidos Activos
                    </Typography>
                    <Typography variant="caption" color="warning.main">
                      {stats.pendingOrders} pendientes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del rol */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tu Rol: {user?.role === 'admin' ? 'Administrador' :
                         user?.role === 'moderator' ? 'Moderador' :
                         user?.role === 'waiter' ? 'Mesero' :
                         user?.role === 'chef' ? 'Cocinero' : 'Usuario'}
              </Typography>
              <Typography variant="body2">
                {user?.role === 'admin' && 'Tienes acceso completo a todas las funciones administrativas del sistema.'}
                {user?.role === 'moderator' && 'Puedes gestionar pedidos, mesas y supervisar el menú.'}
                {user?.role === 'waiter' && 'Puedes crear pedidos y gestionar mesas asignadas.'}
                {user?.role === 'chef' && 'Puedes gestionar el estado de preparación de los pedidos.'}
                {user?.role === 'customer' && 'Puedes ver el menú y realizar pedidos básicos.'}
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        /* Platos */
        <Box>
          <Typography variant="h5" gutterBottom>
            🍽️ Menú de Platos
          </Typography>
          <DishesTest />
        </Box>
      )}

      {activeTab === 2 && (
        /* Pedidos */
        <Box>
          <Typography variant="h5" gutterBottom>
            📋 Gestión de Pedidos
          </Typography>
          <OrdersList />
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
