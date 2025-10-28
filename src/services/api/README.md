# API Service - Interceptor JWT

## Descripción

Este módulo configura Axios con interceptores para manejar automáticamente la autenticación JWT en todas las peticiones HTTP.

## Características

### 1. **Interceptor de Request (Peticiones)**
- Adjunta automáticamente el token JWT en el header `Authorization` de todas las peticiones
- Lee el token desde `localStorage`
- Formato: `Bearer <token>`
- Logging detallado en modo desarrollo

### 2. **Interceptor de Response (Respuestas)**
- Manejo automático de errores HTTP
- Cierre de sesión automático cuando el token expira (401)
- Logging de respuestas en modo desarrollo
- Manejo de errores de red

## Uso

### Importar la instancia configurada de Axios:

```javascript
import api from './services/api/api';

// Hacer peticiones GET
const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
  }
};

// Hacer peticiones POST
const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
  }
};

// Hacer peticiones PUT
const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
  }
};

// Hacer peticiones DELETE
const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
  }
};
```

### Funciones Helper

#### `setAuthToken(token)`
Guarda el token en localStorage y lo configura para todas las peticiones futuras.

```javascript
import { setAuthToken } from './services/api/api';

// Después del login exitoso
const handleLogin = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const { token } = response.data;
  
  // Guardar el token
  setAuthToken(token);
};
```

#### `removeAuthToken()`
Elimina el token del localStorage y de las peticiones futuras.

```javascript
import { removeAuthToken } from './services/api/api';

// Al hacer logout
const handleLogout = () => {
  removeAuthToken();
  // Redirigir al login
  window.location.href = '/login';
};
```

## Manejo de Errores

El interceptor maneja automáticamente los siguientes códigos de estado:

| Código | Descripción | Acción |
|--------|-------------|--------|
| 401 | No autorizado | Elimina el token y redirige al login |
| 403 | Prohibido | Log de error (sin permisos) |
| 404 | No encontrado | Log de error |
| 500 | Error del servidor | Log de error |

## Configuración

### Variables de entorno (.env):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Si no se define, usa por defecto: `http://localhost:3001/api`

## Flujo de Autenticación

1. **Login**: El usuario se autentica y recibe un token JWT
2. **Guardar Token**: Se guarda en localStorage usando `setAuthToken(token)`
3. **Peticiones Automáticas**: Todas las peticiones incluyen automáticamente el token
4. **Token Expirado**: Si el servidor responde 401, se cierra sesión automáticamente
5. **Logout**: Se elimina el token usando `removeAuthToken()`

## Logging en Desarrollo

En modo desarrollo (`import.meta.env.DEV`), el interceptor muestra logs detallados:

- **Peticiones**: Método, URL, headers y datos
- **Respuestas**: Status y datos recibidos
- **Errores**: Detalles completos del error

Esto facilita el debugging durante el desarrollo.

## Ejemplo Completo

```javascript
import api, { setAuthToken, removeAuthToken } from './services/api/api';

// 1. Login
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Guardar token
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.response?.data?.error };
  }
};

// 2. Hacer peticiones autenticadas
const getProfile = async () => {
  try {
    // El token se adjunta automáticamente
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil:', error);
  }
};

// 3. Logout
const logout = () => {
  removeAuthToken();
  window.location.href = '/login';
};
```

## Seguridad

- El token se almacena en `localStorage` (considera usar `httpOnly` cookies para mayor seguridad en producción)
- El token se envía en el header `Authorization` con el prefijo `Bearer`
- El token se elimina automáticamente cuando expira
- Todas las peticiones usan HTTPS en producción (configurar en el servidor)
