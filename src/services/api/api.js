import axios from 'axios';

// Configuración de la URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Crear instancia de Axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la retornamos
    return response;
  },
  (error) => {
    // Manejo de errores de respuesta
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      switch (error.response.status) {
        case 401:
          // No autorizado - token inválido o expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirigir al login si no estamos ya ahí
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Prohibido - no tienes permisos
          console.error('Acceso prohibido:', error.response.data.message);
          break;
        case 404:
          // No encontrado
          console.error('Recurso no encontrado:', error.response.data.message);
          break;
        case 500:
          // Error del servidor
          console.error('Error del servidor:', error.response.data.message);
          break;
        default:
          console.error('Error en la respuesta:', error.response.data.message);
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Algo pasó al configurar la petición
      console.error('Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Función helper para hacer login y guardar el token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    // Agregar el token a todas las peticiones futuras
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Función helper para hacer logout
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

// Exportar la instancia configurada de axios
export default api;
