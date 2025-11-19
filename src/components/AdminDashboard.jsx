import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Restaurant as RestaurantIcon,
  TableRestaurant as TableIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useDishes } from '../context/DishesContext';
import { useTables } from '../context/TablesContext';
import { useOrders } from '../context/OrdersContext';
import DishForm from './DishForm';
import OrdersBoard from './OrdersBoard';
import DishList from './DishList';
import TableList from './TableList';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { dishes, loading: dishesLoading, createDish, fetchDishes } = useDishes();
  const { tables, loading: tablesLoading } = useTables();
  const { orders, loading: ordersLoading } = useOrders();

  const [activeTab, setActiveTab] = useState(0);

  // Estadísticas del sistema
  const stats = {
    totalDishes: Array.isArray(dishes) ? dishes.length : 0,
    totalTables: Array.isArray(tables) ? tables.length : 0,
    availableTables: Array.isArray(tables) ? tables.filter(t => t.available).length : 0,
    totalOrders: Array.isArray(orders) ? orders.length : 0,
    pendingOrders: Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0,
    preparingOrders: Array.isArray(orders) ? orders.filter(o => o.status === 'preparing').length : 0,
    readyOrders: Array.isArray(orders) ? orders.filter(o => o.status === 'ready').length : 0
  };

  const tabs = [
    { label: 'Resumen', icon: <AnalyticsIcon /> },
    { label: 'Gestión de Platos', icon: <RestaurantIcon /> },
    { label: 'Gestión de Mesas', icon: <TableIcon /> },
    { label: 'Pedidos', icon: <OrdersIcon /> }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'error.main', width: 60, height: 60 }}>
            <AdminIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Panel de Administración
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {user?.firstName || user?.username} - Administrador
            </Typography>
            <Chip
              label="Administrador"
              color="error"
              icon={<AdminIcon />}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Button
          component={Link}
          to="/dashboard"
          variant="outlined"
          startIcon={<DashboardIcon />}
        >
          Volver al Dashboard General
        </Button>
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
              📊 Estadísticas del Sistema
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RestaurantIcon color="primary" />
                  <Box>
                    <Typography variant="h4">{stats.totalDishes}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platos Totales
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
                    <Typography variant="h4">{stats.totalTables}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mesas Totales
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {stats.availableTables} disponibles
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
                    <Typography variant="h4">{stats.pendingOrders + stats.preparingOrders + stats.readyOrders}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pedidos Activos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Estado de pedidos */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              📋 Estado de Pedidos
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Pendientes: {stats.pendingOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  En Preparación: {stats.preparingOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Listos: {stats.readyOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        /* Gestión de Platos */
        <Box>
          <Typography variant="h5" gutterBottom>
            🍽️ Gestión de Platos
          </Typography>
          <DishForm onSubmit={async (data) => {
            const payload = {
              name: data.name,
              description: data.description,
              price: Number(data.price),
              // 'available' no está en el form; el backend lo setea default true
            };
            const result = await createDish(payload);
            if (result?.success) {
              // refrescar listado y volver al resumen
              await fetchDishes();
              setActiveTab(0);
            }
          }} />

          {/* Listado de platos (responsive cards) */}
          <DishList />
        </Box>
      )}

      {activeTab === 2 && (
        /* Gestión de Mesas */
        <Box>
          <Typography variant="h5" gutterBottom>
            🪑 Gestión de Mesas
          </Typography>
          <TableList />
        </Box>
      )}

      {activeTab === 3 && (
        /* Pedidos */
        <Box>
          <OrdersBoard />
        </Box>
      )}
    </Container>
  );
};

export default AdminDashboard;
