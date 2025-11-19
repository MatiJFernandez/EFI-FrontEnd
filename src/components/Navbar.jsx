import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <AppBar position="sticky" color="transparent" sx={{
      mt: 2,
      mx: 'auto',
      maxWidth: 1200,
      borderRadius: 3,
      background: 'linear-gradient(180deg, rgba(21,21,24,0.95) 0%, rgba(21,21,24,0.85) 100%)',
      border: '1px solid',
      borderColor: 'rgba(255,255,255,0.08)'
    }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          {/* Marca izquierda */}
          <Typography
            variant="h6"
            component="div"
            onClick={handleHome}
            sx={{ cursor: 'pointer', fontWeight: 800, letterSpacing: .3 }}
          >
            <Box component="span" sx={{ color: 'primary.main' }}>Restaurante</Box> EFI
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate(user?.role === 'user' ? '/waiter/orders/create' : '/chef/orders')}
                  sx={{ borderRadius: 999, px: 2, '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' } }}
                >
                  Pedidos
                </Button>
                {/* Botón Admin removido: panel unificado en Dashboard */}
                <Button color="inherit" onClick={() => navigate('/dashboard')} sx={{ borderRadius: 999, px: 2, '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' } }}>Dashboard</Button>
                <Button color="inherit" onClick={() => navigate('/dashboard?tab=platos')} sx={{ borderRadius: 999, px: 2, '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' } }}>Menú</Button>
                <Button color="inherit" onClick={handleLogout} sx={{ borderRadius: 999, px: 2, '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' } }}>Salir</Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={handleLogin} sx={{ borderRadius: 999, px: 2 }}>Iniciar Sesión</Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
