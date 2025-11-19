import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDishes } from '../context/DishesContext';
import { useTables } from '../context/TablesContext';
import { useOrders } from '../context/OrdersContext';
import DishesList from './DishesList';
import OrdersList from './OrdersList';
import TableList from './TableList';
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
    { label: 'Mesas', icon: <TableIcon /> },
    { label: 'Platos', icon: <RestaurantIcon /> },
    { label: 'Pedidos', icon: <OrdersIcon /> }
  ];

  // Determinar si el usuario puede crear pedidos: solo Mesero (user)
  const canCreateOrders = user?.role === 'user';

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
            {user?.role === 'admin' ? (
              <>
                <Typography variant="h4" component="h1" gutterBottom>
                  ¡Bienvenido, {user?.firstName || user?.username}!
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                  Tu Rol: <strong>Administrador</strong>
                </Typography>
              </>
            ) : (
              <>
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
                      user?.role === 'moderator' ? 'Cocinero' :
                      user?.role === 'user' ? 'Mesero' : 'Usuario'
                    }
                    color={
                      user?.role === 'admin' ? 'error' :
                      user?.role === 'moderator' ? 'warning' :
                      user?.role === 'user' ? 'info' : 'primary'
                    }
                    icon={user?.role === 'admin' ? <AdminIcon /> : undefined}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Role-based navigation (oculto para admin) */}
        {user?.role !== 'admin' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Paneles Disponibles:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Sin Panel Administrador: gestión unificada en Dashboard */}

            {user?.role === 'moderator' && (
              <Button
                component={Link}
                to="/moderator"
                variant="contained"
                color="warning"
                startIcon={<PeopleIcon />}
                size="large"
              >
                Panel Cocinero
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
        )}
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
        <Grid container spacing={3} sx={{ maxWidth: 1100, mx: 'auto' }}>
          {/* Estadísticas principales */}
          {user?.role !== 'admin' && (
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                📊 Resumen General
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, minHeight: 150 }}>
              <CardContent sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RestaurantIcon color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.availableDishes}</Typography>
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
            <Card sx={{ borderRadius: 3, minHeight: 150 }}>
              <CardContent sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TableIcon color="secondary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.availableTables}</Typography>
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
            <Card sx={{ borderRadius: 3, minHeight: 150 }}>
              <CardContent sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <OrdersIcon color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.totalOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pedidos Totales
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, minHeight: 150 }}>
              <CardContent sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PeopleIcon color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.activeOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pedidos Activos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del rol (oculta para admin) */}
          {user?.role !== 'admin' && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tu Rol: {user?.role === 'admin' ? 'Administrador' :
                         user?.role === 'moderator' ? 'Cocinero' :
                         user?.role === 'user' ? 'Mesero' :
                         user?.role === 'chef' ? 'Cocinero' : 'Usuario'}
              </Typography>
              <Typography variant="body2">
                {user?.role === 'admin' && 'Tienes acceso completo a todas las funciones administrativas del sistema.'}
                {user?.role === 'moderator' && 'Puedes gestionar el estado de preparación de los pedidos (Cocina).'}
                {user?.role === 'user' && 'Puedes crear pedidos y gestionar mesas asignadas.'}
                {user?.role === 'chef' && 'Puedes gestionar el estado de preparación de los pedidos.'}
                {user?.role === 'customer' && 'Puedes ver el menú y realizar pedidos básicos.'}
              </Typography>
            </Alert>
          </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        /* Mesas (CRUD admin) / Visor para otros roles */
        <Box>
          <Typography variant="h5" gutterBottom>
            🪑 Gestión de Mesas
          </Typography>
          <TableList />
        </Box>
      )}

      {activeTab === 2 && (
        /* Platos */
        <Box>
          <Typography variant="h5" gutterBottom>
            🍽️ Menú de Platos
          </Typography>
          <DishesList />
        </Box>
      )}

      {activeTab === 3 && (
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
