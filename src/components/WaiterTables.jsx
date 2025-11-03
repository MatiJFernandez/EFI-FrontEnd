import React, { useEffect } from 'react';
import { Container, Box, Grid, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useTables } from '../context/TablesContext';

const WaiterTables = () => {
  const { tables, loading, error, fetchTables, getAvailableTables } = useTables();

  useEffect(() => {
    // fetchTables is already called by the provider on mount, but ensure refresh
    if (!tables || tables.length === 0) fetchTables();
  }, [fetchTables, tables]);

  const available = getAvailableTables();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Mesas disponibles</Typography>
        <Button variant="outlined" onClick={fetchTables} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Refrescar'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && !available.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {available.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">No hay mesas disponibles en este momento.</Alert>
            </Grid>
          ) : (
            available.map((t) => (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Mesa {t.number} {t.name ? `- ${t.name}` : ''}</Typography>
                    <Typography color="text.secondary">Capacidad: {t.capacity}</Typography>
                    {t.location && <Typography color="text.secondary">Ubicación: {t.location}</Typography>}
                    <Typography sx={{ mt: 1 }} color={t.available ? 'success.main' : 'error.main'}>
                      {t.available ? 'Disponible' : 'No disponible'}
                    </Typography>
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

export default WaiterTables;
