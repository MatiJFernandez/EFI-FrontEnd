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
      description: 'Diferentes niveles de acceso para administradores, moderadores y usuarios'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                🍽️ Sistema de Gestión
              </Typography>
              <Typography variant="h4" component="h2" gutterBottom>
                Restaurante EFI
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Gestiona tu restaurante de manera eficiente con nuestro sistema completo
                de administración de pedidos, mesas y menús.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<LoginIcon />}
                      onClick={() => navigate('/login')}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<RegisterIcon />}
                      onClick={() => navigate('/register')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
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
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                    }}
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
                  height: 300
                }}
              >
                <Avatar
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    border: '4px solid white'
                  }}
                >
                  <RestaurantIcon sx={{ fontSize: 80 }} />
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
                           user?.role === 'moderator' ? 'Moderador' : 'Usuario'}
                    color={user?.role === 'admin' ? 'error' :
                           user?.role === 'moderator' ? 'warning' : 'primary'}
                    size="small"
                    icon={user?.role === 'admin' ? <AdminIcon /> : undefined}
                  />
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Rol actual: <strong>{user?.role}</strong> |
              Email: <strong>{user?.email}</strong>
            </Typography>
          </Paper>
        )}

        {/* Features Section */}
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Características Principales
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
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
