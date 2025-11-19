import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as AvailableIcon,
  Cancel as UnavailableIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useDishes } from '../context/DishesContext';

const DishList = () => {
  const { dishes, deleteDish, toggleAvailability, updateDish } = useDishes();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', description: '', price: '' });

  const filtered = useMemo(() => {
    if (!Array.isArray(dishes)) return [];
    const q = search.trim().toLowerCase();
    if (!q) return dishes;
    return dishes.filter(d =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q)
    );
  }, [dishes, search]);

  const handleDeleteClick = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (toDeleteId) {
      await deleteDish(toDeleteId);
    }
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const handleToggleAvailability = async (id) => {
    await toggleAvailability(id);
  };

  const startEdit = (dish) => {
    setEditing(dish);
    setEditValues({
      name: dish.name || '',
      description: dish.description || '',
      price: String(dish.price ?? '')
    });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const payload = {
      name: editValues.name,
      description: editValues.description,
      price: Number(editValues.price)
    };
    await updateDish(editing.id, payload);
    setEditing(null);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SearchIcon color="action" />
        <TextField
          size="small"
          placeholder="Buscar por nombre o descripción"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 380 }}
        />
        <Box sx={{ flex: 1 }} />
        <Chip label={`${filtered.length} platos`} color="primary" variant="outlined" />
      </Box>

      <Grid container spacing={2}>
        {filtered.map((dish) => (
          <Grid key={dish.id} item xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {dish.name}
                  </Typography>
                  {dish.available !== false ? (
                    <Chip color="success" size="small" icon={<AvailableIcon />} label="Disponible" />
                  ) : (
                    <Chip color="default" size="small" icon={<UnavailableIcon />} label="No disp." />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                  {dish.description || 'Sin descripción'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700 }}>
                  ${Number(dish.price).toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Tooltip title={dish.available !== false ? 'Marcar como no disponible' : 'Marcar como disponible'}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={dish.available !== false}
                      onChange={() => handleToggleAvailability(dish.id)}
                      color="success"
                    />
                  </Box>
                </Tooltip>
                <Box>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => startEdit(dish)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" onClick={() => handleDeleteClick(dish.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <Typography variant="body1">No hay platos para mostrar.</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Confirmación eliminar */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Eliminar plato</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de eliminar este plato? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Edición rápida */}
      <Dialog open={!!editing} onClose={cancelEdit} fullWidth maxWidth="sm">
        <DialogTitle>Editar plato</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              value={editValues.name}
              onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
            />
            <TextField
              label="Descripción"
              value={editValues.description}
              onChange={(e) => setEditValues(v => ({ ...v, description: e.target.value }))}
            />
            <TextField
              label="Precio"
              type="number"
              value={editValues.price}
              onChange={(e) => setEditValues(v => ({ ...v, price: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DishList;
