import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MenuBook as MenuIcon,
  TableChart as TableIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Gestión de Restaurante',
      description: 'Administra pedidos, mesas y menús de manera eficiente'
    },
    {
      icon: <MenuIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Menú Digital',
      description: 'Crea y gestiona tu menú con facilidad'
    },
    {
      icon: <TableIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Control de Mesas',
      description: 'Monitorea la ocupación y disponibilidad de mesas'
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Sistema de Roles',
      description: 'Diferentes niveles de acceso para administradores, cocineros y meseros'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
          py: { xs: 6, md: 10 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(180deg, rgba(21,21,24,0.95) 0%, rgba(21,21,24,0.85) 100%)',
          border: '1px solid',
          borderColor: 'rgba(255,255,255,0.08)',
          '&:before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(700px 300px at 10% -10%, rgba(255,122,29,0.12), transparent 50%), radial-gradient(500px 240px at 110% 10%, rgba(255,122,29,0.10), transparent 60%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="800" sx={{ letterSpacing: .2 }}>
                <Box component="span" sx={{ color: 'text.primary' }}>Sistema de Gestión</Box>
              </Typography>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
                <Box component="span" sx={{ color: 'primary.main' }}>Restaurante</Box> EFI
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600 }}>
                Gestioná tu restaurante con un panel moderno: pedidos, mesas y menú 100% integrado.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<LoginIcon />}
                      onClick={() => navigate('/login')}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<RegisterIcon />}
                      onClick={() => navigate('/register')}
                      color="secondary"
                    >
                      Registrarse
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate('/dashboard')}
                  >
                    Ir al Dashboard
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 240, md: 320 }
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 160, md: 220 },
                    height: { xs: 160, md: 220 },
                    bgcolor: 'rgba(255,122,29,0.12)',
                    border: '2px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <RestaurantIcon sx={{ fontSize: 96, color: 'primary.main' }} />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* User Info Section (if authenticated) */}
        {isAuthenticated && (
          <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  ¡Bienvenido, {user?.firstName || user?.username}!
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={user?.role === 'admin' ? 'Administrador' :
                           user?.role === 'moderator' ? 'Cocinero' :
                           user?.role === 'waiter' ? 'Mesero' : 'Usuario'}
                    color={user?.role === 'admin' ? 'error' :
                           user?.role === 'moderator' ? 'warning' :
                           user?.role === 'waiter' ? 'info' : 'primary'}
                    size="small"
                    icon={user?.role === 'admin' ? <AdminIcon /> : undefined}
                  />
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Rol actual: <strong>{user?.role === 'admin' ? 'Administrador' : user?.role === 'moderator' ? 'Cocinero' : user?.role === 'waiter' ? 'Mesero' : user?.role || 'Usuario'}</strong> |
              Email: <strong>{user?.email}</strong>
            </Typography>
          </Paper>
        )}

        {/* Features Section */}
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 4, fontWeight: 800 }}>
          <Box component="span" sx={{ color: 'primary.main' }}>Características</Box> Principales
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(255,122,29,0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>


      </Container>
    </Box>
  );
};

export default Home;
