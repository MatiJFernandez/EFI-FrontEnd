import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import {
  ViewModule as CardsIcon,
  TableRows as TableIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useOrders } from '../context/OrdersContext';
import OrderTicket from './OrderTicket';

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En preparación' },
  { value: 'completed', label: 'Servido' },
  { value: 'cancelled', label: 'Cancelado' }
];

const statusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'in_progress': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'in_progress': return 'En preparación';
    case 'completed': return 'Servido';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

const OrdersBoard = () => {
  const { orders, loading, error, fetchOrders, updateOrderStatus, deleteOrder } = useOrders();

  const [view, setView] = useState('cards'); // 'cards' | 'table'
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleRefresh = () => fetchOrders();

  const openTicket = (order) => { setSelectedOrder(order); setTicketDialogOpen(true); };
  const closeTicket = () => { setTicketDialogOpen(false); setSelectedOrder(null); };

  const filtered = useMemo(() => {
    let list = Array.isArray(orders) ? orders : [];
    if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(o => String(o.id).includes(q) || String(o.tableId ?? o.table?.number ?? '').includes(q));
    return list;
  }, [orders, statusFilter, search]);

  const onChangeStatus = async (order, nextStatus) => {
    await updateOrderStatus(order.id, nextStatus);
  };

  const onDelete = async (order) => {
    if (!window.confirm(`¿Eliminar el pedido #${order.id}?`)) return;
    await deleteOrder(order.id);
  };

  const CardsView = () => (
    <Grid container spacing={2}>
      {filtered.map((order) => (
        <Grid key={order.id} item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6">Pedido #{order.id}</Typography>
                <Chip color={statusColor(order.status)} label={statusLabel(order.status)} size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">Mesa: {order.Table?.number ?? order.tableId}</Typography>
              <Typography variant="body2" color="text.secondary">Total: ${Number(order.total).toFixed(2)}</Typography>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small">
                  <InputLabel id={`status-${order.id}`}>Estado</InputLabel>
                  <Select
                    labelId={`status-${order.id}`}
                    label="Estado"
                    value={order.status}
                    onChange={(e) => onChangeStatus(order, e.target.value)}
                    sx={{ minWidth: 160 }}
                  >
                    {statusOptions.filter(s => s.value !== 'all').map(s => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Tooltip title="Descargar Comanda">
                  <IconButton onClick={() => openTicket(order)}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton color="error" onClick={() => onDelete(order)}>
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
            <Typography>No hay pedidos para mostrar.</Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );

  const TableView = () => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Mesa</TableCell>
          <TableCell>Estado</TableCell>
          <TableCell>Total</TableCell>
          <TableCell>Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filtered.map(order => (
          <TableRow key={order.id} hover>
            <TableCell>#{order.id}</TableCell>
            <TableCell>{order.Table?.number ?? order.tableId}</TableCell>
            <TableCell>
              <Chip size="small" color={statusColor(order.status)} label={statusLabel(order.status)} />
            </TableCell>
            <TableCell>${Number(order.total).toFixed(2)}</TableCell>
            <TableCell>
              <FormControl size="small" sx={{ mr: 1, minWidth: 140 }}>
                <Select value={order.status} onChange={(e) => onChangeStatus(order, e.target.value)}>
                  {statusOptions.filter(s => s.value !== 'all').map(s => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Comanda">
                <IconButton onClick={() => openTicket(order)} size="small"><DownloadIcon fontSize="inherit" /></IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton onClick={() => onDelete(order)} size="small" color="error"><DeleteIcon fontSize="inherit" /></IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
        {filtered.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} align="center">No hay pedidos para mostrar.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>📋 Gestión de Pedidos</Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="status-filter">Estado</InputLabel>
          <Select
            labelId="status-filter"
            label="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(s => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Buscar por ID o mesa"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ToggleButtonGroup size="small" value={view} exclusive onChange={(e, v) => v && setView(v)}>
          <ToggleButton value="cards"><CardsIcon /></ToggleButton>
          <ToggleButton value="table"><TableIcon /></ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading}>
          {loading ? 'Cargando...' : 'Recargar'}
        </Button>
      </Box>

      {view === 'cards' ? <CardsView /> : <TableView />}

      <Dialog open={ticketDialogOpen} onClose={closeTicket} maxWidth="md" fullWidth>
        <DialogTitle>Comanda de Cocina - Pedido #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <OrderTicket order={selectedOrder} onDownload={closeTicket} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTicket}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersBoard;
