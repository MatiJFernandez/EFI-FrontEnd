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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  TableRestaurant as TableIcon
} from '@mui/icons-material';
import { useTables } from '../context/TablesContext';
import { useAuth } from '../context/AuthContext';

const statusColor = (status) => {
  switch (status) {
    case 'available':
      return 'success';
    case 'occupied':
      return 'warning';
    case 'reserved':
      return 'info';
    default:
      return 'default';
  }
};

const TableList = () => {
  const { tables, deleteTable, updateTable, fetchTables, createTable } = useTables();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ number: '', capacity: '', status: 'available' });
  const [createOpen, setCreateOpen] = useState(false);
  const [createValues, setCreateValues] = useState({ number: '', capacity: '', status: 'available' });

  const filtered = useMemo(() => {
    if (!Array.isArray(tables)) return [];
    const q = search.trim();
    if (!q) return tables;
    return tables.filter(t => String(t.number).includes(q));
  }, [tables, search]);

  const handleDeleteClick = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (toDeleteId) {
      await deleteTable(toDeleteId);
      await fetchTables();
    }
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const handleToggleAvailable = async (table) => {
    const nextStatus = table.status === 'available' ? 'occupied' : 'available';
    await updateTable(table.id, { status: nextStatus });
    await fetchTables();
  };

  const startEdit = (table) => {
    setEditing(table);
    setEditValues({
      number: table.number ?? '',
      capacity: String(table.capacity ?? ''),
      status: table.status || 'available'
    });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const payload = {
      number: Number(editValues.number),
      capacity: Number(editValues.capacity),
      status: editValues.status
    };
    await updateTable(editing.id, payload);
    await fetchTables();
    setEditing(null);
  };

  const openCreate = () => {
    setCreateValues({ number: '', capacity: '', status: 'available' });
    setCreateOpen(true);
  };

  const cancelCreate = () => setCreateOpen(false);

  const saveCreate = async () => {
    const payload = {
      number: Number(createValues.number),
      capacity: Number(createValues.capacity),
      status: createValues.status
    };
    const res = await createTable(payload);
    if (res?.success) {
      await fetchTables();
      setCreateOpen(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SearchIcon color="action" />
        <TextField
          size="small"
          placeholder="Buscar por número de mesa"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 280 }}
        />
        <Box sx={{ flex: 1 }} />
        <Chip label={`${filtered.length} mesas`} color="secondary" variant="outlined" />
        {isAdmin && (
          <Button variant="contained" onClick={openCreate}>Nueva Mesa</Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ maxWidth: 1100, mx: 'auto' }}>
        {filtered.map((table) => (
          <Grid key={table.id} item xs={12} sm={6} md={4} lg={4} xl={4}>
            <Card sx={{ height: '100%', minHeight: 180, display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableIcon color="action" />
                    <Typography variant="h6" component="div">
                      Mesa #{table.number}
                    </Typography>
                  </Box>
                  <Chip color={statusColor(table.status)} size="small" label={
                    table.status === 'available' ? 'Disponible' : table.status === 'occupied' ? 'Ocupada' : 'Reservada'
                  } />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Capacidad: {table.capacity}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Tooltip title={isAdmin ? (table.status === 'available' ? 'Marcar como ocupada' : 'Marcar como disponible') : 'Solo lectura'}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={table.status === 'available'}
                      onChange={() => isAdmin && handleToggleAvailable(table)}
                      color="success"
                      disabled={!isAdmin}
                    />
                  </Box>
                </Tooltip>
                <Box>
                  {isAdmin && (
                    <>
                      <Tooltip title="Editar">
                        <IconButton onClick={() => startEdit(table)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDeleteClick(table.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <Typography variant="body1">No hay mesas para mostrar.</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Crear mesa */}
      {isAdmin ? (
      <Dialog open={createOpen} onClose={cancelCreate} fullWidth maxWidth="sm">
        <DialogTitle>Nueva mesa</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Número"
              type="number"
              value={createValues.number}
              onChange={(e) => setCreateValues(v => ({ ...v, number: e.target.value }))}
            />
            <TextField
              label="Capacidad"
              type="number"
              value={createValues.capacity}
              onChange={(e) => setCreateValues(v => ({ ...v, capacity: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel id="cstatus-label">Estado</InputLabel>
              <Select
                labelId="cstatus-label"
                label="Estado"
                value={createValues.status}
                onChange={(e) => setCreateValues(v => ({ ...v, status: e.target.value }))}
              >
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="occupied">Ocupada</MenuItem>
                <MenuItem value="reserved">Reservada</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCreate}>Cancelar</Button>
          <Button variant="contained" onClick={saveCreate}>Crear</Button>
        </DialogActions>
      </Dialog>
      ) : null}

      {/* Confirmación eliminar */}
      {isAdmin ? (
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Eliminar mesa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de eliminar esta mesa? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
      ) : null}

      {/* Edición rápida */}
      {isAdmin ? (
      <Dialog open={!!editing} onClose={cancelEdit} fullWidth maxWidth="sm">
        <DialogTitle>Editar mesa</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Número"
              type="number"
              value={editValues.number}
              onChange={(e) => setEditValues(v => ({ ...v, number: e.target.value }))}
            />
            <TextField
              label="Capacidad"
              type="number"
              value={editValues.capacity}
              onChange={(e) => setEditValues(v => ({ ...v, capacity: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                label="Estado"
                value={editValues.status}
                onChange={(e) => setEditValues(v => ({ ...v, status: e.target.value }))}
              >
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="occupied">Ocupada</MenuItem>
                <MenuItem value="reserved">Reservada</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit}>Guardar</Button>
        </DialogActions>
      </Dialog>
      ) : null}
    </Box>
  );
};

export default TableList;
