import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Button
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import ordersService from '../../services/orders/ordersService';
import { useOrders } from '../../context/OrdersContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const OrderDetail = () => {
  const { id } = useParams();
  const orderId = Number(id);
  const { getOrderDetails, updateOrderStatus, deleteOrder, fetchOrders } = useOrders();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orderRes, detailsRes] = await Promise.all([
          ordersService.getOrderById(orderId),
          getOrderDetails(orderId)
        ]);

        if (!orderRes.success) throw new Error(orderRes.error || 'Error al obtener el pedido');
        if (!detailsRes.success) throw new Error(detailsRes.error || 'Error al obtener el detalle');

        if (mounted) {
          setOrder(orderRes.data?.data || orderRes.data);
          setDetails(detailsRes.data?.data || detailsRes.data || []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || 'Error al cargar el detalle del pedido');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [orderId, getOrderDetails]);

  const computedTotals = useMemo(() => {
    const lines = Array.isArray(details) ? details : [];
    let subtotal = 0;
    lines.forEach(d => {
      const price = Number(d.price || d?.Dish?.price || 0);
      const qty = Number(d.quantity || 0);
      subtotal += price * qty;
    });
    return { subtotal, total: subtotal };
  }, [details]);

  const role = user?.role;

  const getNextStatus = (currentStatus) => {
    // Reglas alineadas al backend: mesero, cocinero, admin pueden avanzar
    if (currentStatus === 'pending') return 'in_progress';
    if (currentStatus === 'in_progress') return 'completed';
    return null;
  };

  const canCancel = role === 'admin';
  const canAdvance = ['admin', 'moderator', 'chef'].includes(role);

  const handleAdvance = async () => {
    if (!order) return;
    const next = getNextStatus(order.status);
    if (!next) return;
    setActionLoading(true);
    try {
      const res = await updateOrderStatus(order.id, next);
      if (res.success) {
        showToast(`Estado actualizado a ${next}`, 'success');
        // Refrescar datos del pedido y listado
        const refreshed = await ordersService.getOrderById(order.id);
        if (refreshed.success) {
          setOrder(refreshed.data?.data || refreshed.data);
        }
        await fetchOrders();
      } else {
        showToast(res.error || 'No se pudo actualizar el estado', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !canCancel) return;
    const confirmed = window.confirm('¿Seguro que deseas cancelar/eliminar este pedido?');
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const res = await deleteOrder(order.id);
      if (res.success) {
        showToast('Pedido cancelado', 'success');
        await fetchOrders();
        // Volver atrás
        window.history.back();
      } else {
        showToast(res.error || 'No se pudo cancelar el pedido', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={Link} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined">
          Volver
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning">Pedido no encontrado</Alert>
        <Button component={Link} to="/dashboard" startIcon={<ArrowBackIcon />} variant="outlined" sx={{ mt: 2 }}>
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button component={Link} to={-1} startIcon={<ArrowBackIcon />} variant="outlined">
          Volver
        </Button>
        <Button
          variant="outlined"
          onClick={() => ordersService.downloadOrderTicket(order.id, `pedido-${order.id}.pdf`)}
        >
          Descargar Ticket PDF
        </Button>
      </Box>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <RestaurantIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">Pedido #{order.id}</Typography>
            <Typography variant="body2" color="text.secondary">
              Fecha: {new Date(order.created_at || order.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip label={order.status} color={
              order.status === 'pending' ? 'warning' :
              order.status === 'in_progress' ? 'info' :
              order.status === 'completed' ? 'success' : 'error'
            } />
          </Box>
        </Box>

        {/* Info básica */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Mesa</Typography>
                <Typography variant="h6">{order?.Table?.number ?? order.tableId}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Atendido por</Typography>
                <Typography variant="h6">{order?.User?.name ?? order?.User?.username ?? 'N/A'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                <Typography variant="h6" color="primary">${Number(order.total ?? computedTotals.total).toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Detalle de items */}
        <Typography variant="h6" sx={{ mb: 2 }}>Detalle</Typography>
        <Grid container spacing={2}>
          {(details || []).map((d) => {
            const name = d?.Dish?.name || `Plato #${d.dishId}`;
            const price = Number(d.price || d?.Dish?.price || 0);
            const qty = Number(d.quantity || 0);
            const lineTotal = price * qty;
            return (
              <Grid item xs={12} key={d.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">{name}</Typography>
                        <Typography variant="caption" color="text.secondary">x{qty} · ${price.toFixed(2)}</Typography>
                      </Box>
                      <Typography variant="h6">${lineTotal.toFixed(2)}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Totales */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="h6" color="primary" align="right">${Number(order.total ?? computedTotals.total).toFixed(2)}</Typography>
          </Box>
        </Box>

        {/* Acciones */}
        <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {canAdvance && getNextStatus(order.status) && (
            <Button
              variant="contained"
              onClick={handleAdvance}
              disabled={actionLoading}
              color={getNextStatus(order.status) === 'completed' ? 'success' : 'primary'}
            >
              {getNextStatus(order.status) === 'in_progress' && 'Comenzar preparación'}
              {getNextStatus(order.status) === 'completed' && 'Marcar como Servido'}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancel}
              disabled={actionLoading || order.status === 'completed'}
            >
              Cancelar pedido
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderDetail;
