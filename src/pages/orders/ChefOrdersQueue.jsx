import React, { useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  LocalDining as LocalDiningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useOrders } from '../../context/OrdersContext';
import { useDishes } from '../../context/DishesContext';
import { useTables } from '../../context/TablesContext';
import { useToast } from '../../context/ToastContext';

const ChefOrdersQueue = () => {
  const { orders, loading, error, updateOrderStatus, fetchOrders } = useOrders();
  const { dishes, getDishById } = useDishes();
  const { tables, getTableById } = useTables();
  const { showToast } = useToast();

  const [selectedTab, setSelectedTab] = useState(0);

  // Estados posibles de los pedidos
  const statusTabs = [
    { value: 'pending', label: 'Pendientes', color: 'warning' },
    { value: 'preparing', label: 'En Preparación', color: 'info' },
    { value: 'ready', label: 'Listos', color: 'success' },
    { value: 'delivered', label: 'Entregados', color: 'default' }
  ];

  // Filtrar pedidos por estado
  const ordersByStatus = useMemo(() => {
    const status = statusTabs[selectedTab]?.value;
    if (!status) return [];
    return orders.filter(order => order.status === status);
  }, [orders, selectedTab]);

  // Función para cambiar el estado de un pedido
  const handleStatusChange = async (orderId, newStatus) => {
    const result = await updateOrderStatus(orderId, newStatus);
    
    if (result.success) {
      showToast(`Estado del pedido actualizado a: ${getStatusLabel(newStatus)}`, 'success');
    } else {
      showToast(result.error || 'Error al actualizar el estado', 'error');
    }
  };

  // Obtener etiqueta del estado
  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'preparing': 'En Preparación',
      'ready': 'Listo',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'warning',
      'preparing': 'info',
      'ready': 'success',
      'delivered': 'default',
      'cancelled': 'error'
    };
    return colorMap[status] || 'default';
  };

  // Obtener siguiente estado posible
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  // Obtener estados anteriores posibles (para retroceso)
  const getPreviousStatus = (currentStatus) => {
    const statusFlow = {
      'preparing': 'pending',
      'ready': 'preparing',
      'delivered': 'ready'
    };
    return statusFlow[currentStatus];
  };

  // Calcular tiempo transcurrido
  const getElapsedTime = (createdAt) => {
    if (!createdAt) return 'N/A';
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Recién creado';
    if (diffMins < 60) return `${diffMins} min`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}min`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalDiningIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Cola de Pedidos
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Actualizar'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Tabs de estados */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {statusTabs.map((tab, index) => (
              <Tab
                key={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Chip
                      label={orders.filter(o => o.status === tab.value).length}
                      size="small"
                      color={tab.color}
                      sx={{ minWidth: 24, height: 24 }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Lista de pedidos */}
        {loading && orders.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : ordersByStatus.length === 0 ? (
          <Alert severity="info">
            No hay pedidos en estado "{statusTabs[selectedTab]?.label}"
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {ordersByStatus.map(order => {
              const table = getTableById(order.tableId);

              return (
                <Grid key={order.id} sx={{ width: { xs: '100%', md: '50%', lg: '33.33%' } }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header del pedido */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Pedido #{order.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mesa {table?.number || 'N/A'} {table?.name ? `- ${table.name}` : ''}
                          </Typography>
                        </Box>
                        <Chip
                          label={getStatusLabel(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Items del pedido */}
                      <Typography variant="subtitle2" gutterBottom>
                        Platos:
                      </Typography>
                      <List dense>
                        {order.items?.map((item, index) => {
                          const dish = getDishById(item.dishId);
                          return (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">
                                      {dish?.name || `Plato #${item.dishId}`}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      x{item.quantity}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </List>

                      {/* Notas */}
                      {order.notes && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            <strong>Notas:</strong> {order.notes}
                          </Typography>
                        </>
                      )}

                      {/* Tiempo transcurrido */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {getElapsedTime(order.createdAt)}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Total */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle2">
                          Total:
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ${order.total?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                    </CardContent>

                    {/* Botones de acción */}
                    <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {getPreviousStatus(order.status) && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleStatusChange(order.id, getPreviousStatus(order.status))}
                          fullWidth
                        >
                          Retroceder
                        </Button>
                      )}
                      {getNextStatus(order.status) && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                          fullWidth
                          color={getNextStatus(order.status) === 'ready' ? 'success' : 'primary'}
                        >
                          {getNextStatus(order.status) === 'preparing' && 'Comenzar Preparación'}
                          {getNextStatus(order.status) === 'ready' && 'Marcar como Listo'}
                          {getNextStatus(order.status) === 'delivered' && 'Marcar como Entregado'}
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default ChefOrdersQueue;
