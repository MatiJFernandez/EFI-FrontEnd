import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { useDishes } from '../../context/DishesContext';
import { useOrders } from '../../context/OrdersContext';
import { useTables } from '../../context/TablesContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const WaiterOrderForm = () => {
  const { dishes, getAvailableDishes } = useDishes();
  const { createOrder, loading: ordersLoading } = useOrders();
  const { tables, getAvailableTables } = useTables();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [selectedTable, setSelectedTable] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  // Ya no pedimos categoría en el flujo del mesero
  const [notes, setNotes] = useState('');

  const availableDishes = useMemo(() => {
    return getAvailableDishes();
  }, [dishes, getAvailableDishes]);

  const availableTables = useMemo(() => {
    return getAvailableTables();
  }, [tables, getAvailableTables]);

  const filteredDishes = useMemo(() => availableDishes, [availableDishes]);

  // Sin categorías

  // Preseleccionar mesa desde query string (tableId)
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableIdParam = params.get('tableId');
    if (!tableIdParam) return;
    // Si la mesa está disponible en la lista, preseleccionarla
    const tid = Number(tableIdParam);
    if (Number.isFinite(tid)) {
      const exists = availableTables.some(t => t.id === tid);
      if (exists) setSelectedTable(String(tid));
    }
  }, [location.search, availableTables]);

  // Calcular el total en tiempo real
  const total = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const dish = availableDishes.find(d => d.id === item.dishId);
      if (!dish) return sum;
      const priceNum = Number(dish.price ?? 0);
      return sum + (priceNum * item.quantity);
    }, 0);
  }, [orderItems, availableDishes]);

  // Cantidad actual en el pedido para un plato
  const getItemQty = (dishId) => orderItems.find(i => i.dishId === dishId)?.quantity || 0;

  // Scroll a resumen (para FAB móvil)
  const summaryRef = React.useRef(null);
  const scrollToSummary = () => {
    if (summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Agregar plato al pedido
  const handleAddDish = (dishId) => {
    const existingItem = orderItems.find(item => item.dishId === dishId);
    
    if (existingItem) {
      // Incrementar cantidad si ya existe
      setOrderItems(prev => 
        prev.map(item => 
          item.dishId === dishId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Agregar nuevo plato
      setOrderItems(prev => [...prev, { dishId, quantity: 1 }]);
    }
  };

  // Actualizar cantidad de un plato
  const handleUpdateQuantity = (dishId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(dishId);
      return;
    }
    
    setOrderItems(prev =>
      prev.map(item =>
        item.dishId === dishId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Remover plato del pedido
  const handleRemoveItem = (dishId) => {
    setOrderItems(prev => prev.filter(item => item.dishId !== dishId));
  };

  // Crear el pedido
  const handleCreateOrder = async () => {
    if (!selectedTable) {
      showToast('Por favor selecciona una mesa', 'warning');
      return;
    }

    if (orderItems.length === 0) {
      showToast('Por favor agrega al menos un plato al pedido', 'warning');
      return;
    }

    const orderData = {
      tableId: Number(selectedTable),
      items: orderItems.map(item => ({
        dishId: Number(item.dishId),
        quantity: Number(item.quantity)
      })),
      notes: notes.trim() || undefined,
      waiterId: user?.id
    };

    const result = await createOrder(orderData);

    if (result.success) {
      showToast('Pedido creado exitosamente', 'success');
      // Limpiar el formulario
      setOrderItems([]);
      setSelectedTable('');
      setNotes('');
      // nada
    } else {
      showToast(result.error || 'Error al crear el pedido', 'error');
    }
  };

  return (
    <>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight={700}>
            Crear Pedido
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Seleccioná una mesa disponible y agregá los platos al pedido. Podés ajustar cantidades antes de confirmarlo.
        </Typography>

        <Grid container spacing={3}>
          {/* Columna izquierda: Selección de mesa y platos */}
          <Grid item xs={12} md={7}>
            {/* Selección de mesa */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Seleccionar Mesa
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Mesa</InputLabel>
                <Select
                  value={selectedTable}
                  label="Mesa"
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Selecciona una mesa</em>
                  </MenuItem>
                  {availableTables.map(table => (
                    <MenuItem key={table.id} value={table.id}>
                      Mesa {table.number} {table.name ? `- ${table.name}` : ''} 
                      (Capacidad: {table.capacity})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* Sin filtro de categorías para agilizar el flujo del mesero */}

            {/* Lista de platos disponibles */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Platos Disponibles
            </Typography>
            <Grid container spacing={2}>
              {filteredDishes.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info" variant="outlined">
                    No hay platos disponibles en esta categoría.
                  </Alert>
                </Grid>
              ) : (
                filteredDishes.map(dish => (
                  <Grid item xs={12} sm={6} key={dish.id}>
                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, transition: 'transform .15s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {dish.name}
                          </Typography>
                          <Chip
                            label={`$${Number(dish.price ?? 0).toFixed(2)}`}
                            color="primary"
                            size="small"
                          />
                        </Box>
                        {dish.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {dish.description}
                          </Typography>
                        )}
                        {dish.category && (
                          <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 2 }}>
                            {dish.category}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color={getItemQty(dish.id) > 0 ? 'primary' : 'success'}
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddDish(dish.id)}
                            sx={{ flex: 1 }}
                          >
                            {getItemQty(dish.id) > 0 ? 'Agregar otro' : 'Agregar al Pedido'}
                          </Button>
                          {getItemQty(dish.id) > 0 && (
                            <Chip
                              label={`x${getItemQty(dish.id)}`}
                              color="secondary"
                              size="small"
                              sx={{ alignSelf: 'center' }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>

          {/* Columna derecha: Resumen del pedido */}
          <Grid item xs={12} md={5} ref={summaryRef}>
            <Paper variant="outlined" sx={{ p: 3, position: { md: 'sticky' }, top: { md: 20 }, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Resumen del Pedido
              </Typography>
              <Divider sx={{ my: 2 }} />

              {orderItems.length === 0 ? (
                <Alert severity="info">
                  No hay platos en el pedido. Agrega platos desde la lista.
                </Alert>
              ) : (
                <>
                  <Box sx={{ mb: 2, maxHeight: '400px', overflowY: 'auto' }}>
                    {orderItems.map(item => {
                      const dish = availableDishes.find(d => d.id === item.dishId);
                      if (!dish) return null;

                      return (
                        <Box key={item.dishId} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ flexGrow: 1, color: 'text.primary' }}>
                              {dish.name}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(item.dishId)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="inherit"
                              onClick={() => handleUpdateQuantity(item.dishId, item.quantity - 1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <TextField
                              type="number"
                              variant="outlined"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.dishId, parseInt(e.target.value) || 0)}
                              inputProps={{ min: 1, style: { textAlign: 'center' } }}
                              sx={{ width: 80 }}
                              size="small"
                            />
                            <IconButton
                              size="small"
                              color="inherit"
                              onClick={() => handleUpdateQuantity(item.dishId, item.quantity + 1)}
                            >
                              <AddIcon />
                            </IconButton>
                            <Typography variant="body1" sx={{ ml: 'auto', color: 'text.primary', fontWeight: 600 }}>
                              ${Number((Number(dish.price ?? 0) * item.quantity) || 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Notas del pedido */}
                  <TextField
                    label="Notas del pedido (opcional)"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                  />

                  {/* Total */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                      Total:
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Botón crear pedido */}
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    fullWidth
                    onClick={handleCreateOrder}
                    disabled={ordersLoading || !selectedTable || orderItems.length === 0}
                    sx={{ py: 1.5 }}
                  >
                    {ordersLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Creando...
                      </>
                    ) : (
                      'Crear Pedido'
                    )}
                  </Button>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
    {/* FAB móvil para ver resumen */}
    {orderItems.length > 0 && (
      <Box sx={{ position: 'fixed', right: 16, bottom: 16, display: { xs: 'block', md: 'none' } }}>
        <Button variant="contained" color="primary" onClick={scrollToSummary} sx={{ borderRadius: 999 }}>
          Ver pedido ({orderItems.reduce((s,i)=>s+i.quantity,0)})
        </Button>
      </Box>
    )}
    </>
  );
};

export default WaiterOrderForm;

