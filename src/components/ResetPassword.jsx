import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink
} from '@mui/material';
import authService from '../services/auth/authService';
import { validateField, validateForm } from '../utils/validations';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Obtener el token de la URL
  const resetToken = searchParams.get('token');

  useEffect(() => {
    // Verificar si hay token en la URL
    if (!resetToken) {
      setError('Token de restablecimiento no válido o faltante');
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [resetToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Validación en tiempo real
    const fieldError = validateField(name, value, formData);
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const isFormValid = () => {
    const errors = validateForm(formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!isFormValid()) {
      return;
    }

    setLoading(true);

    try {
      const resetData = {
        token: resetToken,
        password: formData.password
      };

      const result = await authService.resetPassword(resetData);

      if (result.success) {
        setSuccess(true);
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Error inesperado. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink component={Link} to="/forgot-password" variant="body2">
                Solicitar nuevo enlace de restablecimiento
              </MuiLink>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Restablecer Contraseña
          </Typography>

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              ¡Contraseña restablecida exitosamente! Redirigiendo al inicio de sesión...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Nueva Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Nueva Contraseña"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
            >
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} to="/login" variant="body2">
                Volver al inicio de sesión
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;

