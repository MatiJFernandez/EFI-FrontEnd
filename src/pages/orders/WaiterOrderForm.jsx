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

const WaiterOrderForm = () => {
  const { dishes, getAvailableDishes } = useDishes();
  const { createOrder, loading: ordersLoading } = useOrders();
  const { tables, getAvailableTables } = useTables();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [selectedTable, setSelectedTable] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');

  const availableDishes = useMemo(() => {
    return getAvailableDishes();
  }, [dishes, getAvailableDishes]);

  const availableTables = useMemo(() => {
    return getAvailableTables();
  }, [tables, getAvailableTables]);

  const filteredDishes = useMemo(() => {
    if (!selectedCategory) return availableDishes;
    return availableDishes.filter(dish => dish.category === selectedCategory);
  }, [availableDishes, selectedCategory]);

  const categories = useMemo(() => {
    return [...new Set(availableDishes.map(dish => dish.category))];
  }, [availableDishes]);

  // Calcular el total en tiempo real
  const total = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const dish = availableDishes.find(d => d.id === item.dishId);
      if (!dish) return sum;
      return sum + (dish.price * item.quantity);
    }, 0);
  }, [orderItems, availableDishes]);

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
      tableId: selectedTable,
      items: orderItems.map(item => ({
        dishId: item.dishId,
        quantity: item.quantity
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
      setSelectedCategory('');
    } else {
      showToast(result.error || 'Error al crear el pedido', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Crear Nuevo Pedido
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Columna izquierda: Selección de mesa y platos */}
          <Grid item xs={12} md={7}>
            {/* Selección de mesa */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
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

            {/* Filtro de categorías */}
            <Box sx={{ mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Categoría"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">Todas las categorías</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Lista de platos disponibles */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Platos Disponibles
            </Typography>
            <Grid container spacing={2}>
              {filteredDishes.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No hay platos disponibles en esta categoría.
                  </Alert>
                </Grid>
              ) : (
                filteredDishes.map(dish => (
                  <Grid item xs={12} sm={6} key={dish.id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {dish.name}
                          </Typography>
                          <Chip
                            label={`$${dish.price?.toFixed(2) || '0.00'}`}
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
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddDish(dish.id)}
                          fullWidth
                        >
                          Agregar al Pedido
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>

          {/* Columna derecha: Resumen del pedido */}
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 3, position: 'sticky', top: 20 }}>
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
                        <Box key={item.dishId} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
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
                              onClick={() => handleUpdateQuantity(item.dishId, item.quantity - 1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.dishId, parseInt(e.target.value) || 0)}
                              inputProps={{ min: 1, style: { textAlign: 'center' } }}
                              sx={{ width: 80 }}
                              size="small"
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.dishId, item.quantity + 1)}
                            >
                              <AddIcon />
                            </IconButton>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                              ${(dish.price * item.quantity).toFixed(2)}
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
  );
};

export default WaiterOrderForm;

