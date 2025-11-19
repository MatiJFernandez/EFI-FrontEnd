import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import OrderTicket from './OrderTicket';
import ordersService from '../services/orders/ordersService';
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
  const navigate = useNavigate();
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

  const handleDownloadTicket = async (order) => {
    await ordersService.downloadOrderTicket(order.id, `pedido-${order.id}.pdf`);
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
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Get status label in Spanish
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En preparación';
      case 'completed': return 'Servido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Usar solo datos reales del backend
  const displayOrders = Array.isArray(orders) ? orders : [];

  return (
    <Box sx={{ p: 3 }}>

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
        <Alert severity="info">No hay pedidos para mostrar en este momento.</Alert>
      )}

      <Grid container spacing={2} sx={{ maxWidth: 1100, mx: 'auto' }}>
        {displayOrders.map((order) => (
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={order.id}>
            <Card sx={{ borderRadius: 3, minHeight: 160 }}>
              <CardContent sx={{ py: 3 }}>
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
                  Mesa: {order?.Table?.number ?? order.tableNumber ?? order.tableId}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Fecha: {formatDate(order.created_at || order.createdAt)}
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

                <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    fullWidth
                  >
                    Ver detalle
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadTicket(order)}
                    fullWidth
                    color="primary"
                  >
                    Descargar Comanda PDF
                  </Button>
                </Box>
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
