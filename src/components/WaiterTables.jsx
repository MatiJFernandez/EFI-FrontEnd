import React, { useEffect } from 'react';
import { Container, Box, Grid, Card, CardContent, Typography, Button, CircularProgress, Alert, Tabs, Tab, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTables } from '../context/TablesContext';
import { useOrders } from '../context/OrdersContext';

const WaiterTables = () => {
  const { tables, loading, error, fetchTables, getAvailableTables } = useTables();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState(0);

  useEffect(() => {
    // fetchTables is already called by the provider on mount, but ensure refresh
    if (!tables || tables.length === 0) fetchTables();
  }, [fetchTables, tables]);

  const available = getAvailableTables();
  const occupied = Array.isArray(tables) ? tables.filter(t => t.status === 'occupied') : [];
  const reserved = Array.isArray(tables) ? tables.filter(t => t.status === 'reserved') : [];

  const listByTab = tab === 0 ? available : tab === 1 ? occupied : reserved;
  const labels = [
    { label: 'Disponibles', count: available.length },
    { label: 'Ocupadas', count: occupied.length },
    { label: 'Reservadas', count: reserved.length }
  ];

  // Mapear cantidad de pedidos activos por mesa (pending o in_progress)
  const activeByTable = React.useMemo(() => {
    const map = new Map();
    const activeStatuses = new Set(['pending', 'in_progress']);
    (orders || []).forEach(o => {
      const tid = o.tableId;
      if (!tid) return;
      if (!activeStatuses.has(o.status)) return;
      map.set(tid, (map.get(tid) || 0) + 1);
    });
    return map;
  }, [orders]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Mesas disponibles</Typography>
        <Button variant="outlined" onClick={fetchTables} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Refrescar'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PaperTabs tab={tab} setTab={setTab} labels={labels} />

      {loading && !listByTab.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {listByTab.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No hay mesas para mostrar en esta categoría.</Alert>
            </Grid>
          ) : (
            listByTab.map((t) => (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Mesa {t.number} {t.name ? `- ${t.name}` : ''}</Typography>
                    <Typography color="text.secondary">Capacidad: {t.capacity}</Typography>
                    {!!activeByTable.get(t.id) && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          color="warning"
                          label={`Pedidos activos: ${activeByTable.get(t.id)}`}
                        />
                      </Box>
                    )}
                    {t.location && <Typography color="text.secondary">Ubicación: {t.location}</Typography>}
                    <Typography sx={{ mt: 1 }} color={
                      t.status === 'available' ? 'success.main' : t.status === 'occupied' ? 'warning.main' : 'info.main'
                    }>
                      {t.status === 'available' ? 'Disponible' : t.status === 'occupied' ? 'Ocupada' : 'Reservada'}
                    </Typography>
                    {t.status === 'available' && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/waiter/orders/create?tableId=${t.id}`)}
                        >
                          Crear pedido aquí
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

// Componente interno para tabs con contador
const PaperTabs = ({ tab, setTab, labels }) => (
  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
    <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
      {labels.map((t, i) => (
        <Tab key={i} label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {t.label}
            <Chip label={t.count} size="small" color={i === 0 ? 'success' : i === 1 ? 'warning' : 'info'} sx={{ height: 22 }} />
          </Box>
        } />
      ))}
    </Tabs>
  </Box>
);

export default WaiterTables;
