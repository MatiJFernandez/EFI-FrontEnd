import React from 'react';
import { useOrders } from '../context/OrdersContext';
import OrderTicket from './OrderTicket';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const OrdersList = () => {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    clearError
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [ticketDialogOpen, setTicketDialogOpen] = React.useState(false);

  const handleRefresh = () => {
    clearError();
    fetchOrders();
  };

  const handleDownloadTicket = (order) => {
    setSelectedOrder(order);
    setTicketDialogOpen(true);
  };

  const handleCloseTicketDialog = () => {
    setTicketDialogOpen(false);
    setSelectedOrder(null);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'delivered': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Get status label in Spanish
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Mock data for demonstration (since backend might not be implemented yet)
  const mockOrders = [
    {
      id: 1,
      tableNumber: 5,
      status: 'pending',
      createdAt: new Date().toISOString(),
      total: 45.50,
      items: [
        { name: 'Pizza Margherita', quantity: 2, price: 12.50, notes: 'Sin cebolla' },
        { name: 'Coca Cola', quantity: 1, price: 3.50 },
        { name: 'Tiramisú', quantity: 1, price: 6.00 }
      ]
    },
    {
      id: 2,
      tableNumber: 3,
      status: 'preparing',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      total: 28.75,
      items: [
        { name: 'Pasta Carbonara', quantity: 1, price: 15.00 },
        { name: 'Agua Mineral', quantity: 2, price: 2.50 },
        { name: 'Café', quantity: 1, price: 3.75 }
      ]
    },
    {
      id: 3,
      tableNumber: 7,
      status: 'ready',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      total: 62.25,
      items: [
        { name: 'Risotto ai Funghi', quantity: 1, price: 18.00 },
        { name: 'Vino Tinto', quantity: 1, price: 25.00 },
        { name: 'Tarta de Manzana', quantity: 1, price: 7.25 },
        { name: 'Expresso', quantity: 1, price: 2.00 }
      ]
    }
  ];

  // Use mock data if no orders from backend
  const displayOrders = orders.length > 0 ? orders : mockOrders;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📋 Gestión de Pedidos
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Recargar Pedidos'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        Pedidos Activos: {displayOrders.length}
      </Typography>

      {displayOrders.length === 0 && !loading && !error && (
        <Alert severity="info">
          No hay pedidos disponibles. El backend de pedidos aún no está implementado.
        </Alert>
      )}

      <Grid container spacing={2}>
        {displayOrders.map((order) => (
          <Grid item xs={12} sm={6} md={4} key={order.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Pedido #{order.id}
                  </Typography>
                  <Chip
                    label={getStatusLabel(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Mesa: {order.tableNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Fecha: {formatDate(order.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Total: ${order.total}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Ítems:
                  </Typography>
                  {order.items && order.items.slice(0, 3).map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {item.quantity}x {item.name}
                    </Typography>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                      ...y {order.items.length - 3} más
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadTicket(order)}
                  fullWidth
                  color="primary"
                >
                  Descargar Comanda PDF
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ticket Dialog */}
      <Dialog
        open={ticketDialogOpen}
        onClose={handleCloseTicketDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Comanda de Cocina - Pedido #{selectedOrder?.id}
          <IconButton onClick={handleCloseTicketDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <OrderTicket
              order={selectedOrder}
              onDownload={handleCloseTicketDialog}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTicketDialog}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersList;
