import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { validateField } from '../utils/validations';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const validationError = validateField('email', email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(result.error || 'Error al procesar la solicitud');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Error inesperado. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

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
            Recuperar Contraseña
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Si el correo existe, recibirás un enlace para restablecer tu contraseña.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }} data-testid="forgot-password-form">
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                const validationError = validateField('email', e.target.value);
                setEmailError(validationError);
              }}
              error={!!emailError}
              helperText={emailError}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Enlace'}
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

export default ForgotPassword;
