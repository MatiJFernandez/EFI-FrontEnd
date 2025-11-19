import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Restaurant as RestaurantIcon,
  TableRestaurant as TableIcon,
  ShoppingCart as OrdersIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useDishes } from '../context/DishesContext';
import { useTables } from '../context/TablesContext';
import { useOrders } from '../context/OrdersContext';
import OrdersList from './OrdersList';

const ModeratorDashboard = () => {
  const { user } = useAuth();
  const { dishes } = useDishes();
  const { tables } = useTables();
  const { orders } = useOrders();

  const [activeTab, setActiveTab] = useState(0);

  // Estadísticas para moderador
  const stats = {
    totalDishes: Array.isArray(dishes) ? dishes.length : 0,
    totalTables: Array.isArray(tables) ? tables.length : 0,
    availableTables: Array.isArray(tables) ? tables.filter(t => t.available).length : 0,
    totalOrders: Array.isArray(orders) ? orders.length : 0,
    pendingOrders: Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0,
    activeOrders: Array.isArray(orders) ? orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length : 0
  };

  const tabs = [
    { label: 'Resumen', icon: <AnalyticsIcon /> },
    { label: 'Pedidos', icon: <OrdersIcon /> },
    { label: 'Platos', icon: <RestaurantIcon /> }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'warning.main', width: 60, height: 60 }}>
            <PeopleIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Panel de Cocina
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {user?.firstName || user?.username} - Cocinero
            </Typography>
            <Chip
              label="Cocinero"
              color="warning"
              icon={<PeopleIcon />}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/dashboard"
            variant="outlined"
            startIcon={<DashboardIcon />}
          >
            Volver al Dashboard General
          </Button>
          <Button
            component={Link}
            to="/chef/orders"
            variant="contained"
            color="primary"
            startIcon={<AssignmentIcon />}
          >
            Ir a Cola de Cocina
          </Button>
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
              📊 Resumen del Sistema
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
                      Platos Disponibles
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

          {/* Información adicional */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Funciones disponibles como Cocinero:
              </Typography>
              <Typography variant="body2">
                • Ver todos los pedidos de cocina<br/>
                • Cambiar estado: Pendiente → En preparación → Servido<br/>
                • Ver detalles de platos y cantidades del pedido<br/>
                • Supervisar el menú en modo lectura
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        /* Pedidos */
        <Box>
          <Typography variant="h5" gutterBottom>
            📋 Gestión de Pedidos
          </Typography>
          <OrdersList />
        </Box>
      )}

      {activeTab === 2 && (
        /* Platos */
        <Box>
          <Typography variant="h5" gutterBottom>
            🍽️ Menú de Platos
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Vista de solo lectura del menú. Para modificar platos, contacta al administrador.
          </Alert>

          <Grid container spacing={2}>
            {(!Array.isArray(dishes) || dishes.length === 0) ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No hay platos disponibles en el menú.
                </Alert>
              </Grid>
            ) : (
              dishes.map((dish) => (
                <Grid item xs={12} sm={6} md={4} key={dish.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {dish.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {dish.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary">
                          ${dish.price}
                        </Typography>
                        <Chip
                          label={dish.available ? 'Disponible' : 'No disponible'}
                          color={dish.available ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ModeratorDashboard;
