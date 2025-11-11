# Sistema de Gestión de Pedidos y Menú de un Restaurante

Front-End desarrollado con **React** y **Vite**

## 🚀 Tecnologías Utilizadas

- **React 19** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite** - Herramienta de construcción rápida para desarrollo frontend
- **Material UI (MUI)** - Biblioteca de componentes UI
- **React Router DOM** - Enrutamiento de React
- **Axios** - Cliente HTTP para peticiones a la API
- **JavaScript (ES6+)** - Lenguaje de programación moderno

## 📋 Requisitos Previos

- **Node.js** (versión 20.19+ o 22.12+ para Vite 7.0)
- npm o yarn

> ⚠️ **Importante**: Si tienes Node.js 22.2.0, necesitas actualizar a una versión compatible. Vite 7.0 requiere Node.js 20.19+ o 22.12+.

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/MatiJFernandez/EFI-FrontEnd.git
cd EFI-FrontEnd
```

2. Instala las dependencias:
```bash
npm install
```

## 🚀 Comandos Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:5173`

### Construcción
```bash
npm run build
```
Construye la aplicación para producción en la carpeta `dist`

### Vista Previa
```bash
npm run preview
```
Vista previa de la construcción de producción

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
│   ├── common/    # Componentes comunes (Button, Loading, Modal)
│   └── layout/    # Componentes de layout (Header, Footer, Navbar, Sidebar)
├── pages/         # Páginas de la aplicación
│   ├── auth/      # Páginas de autenticación (Login, Register)
│   ├── dishes/    # Páginas de gestión de platos
│   ├── orders/    # Páginas de gestión de pedidos
│   └── tables/    # Páginas de gestión de mesas
├── contexts/      # Contextos de React (AuthContext, DishesContext)
├── services/      # Servicios y lógica de negocio
│   ├── api/       # Configuración de Axios
│   ├── auth/      # Servicios de autenticación
│   ├── menu/      # Servicios de menú
│   └── orders/    # Servicios de pedidos
├── App.jsx        # Componente principal
├── main.jsx       # Punto de entrada
├── theme.js       # Tema de Material UI
├── App.css        # Estilos de la aplicación
└── index.css      # Estilos globales
```

## ⚙️ Configuración de la API

El proyecto utiliza Axios configurado en `src/services/api/api.js`. 

Para configurar la URL del backend, crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

Si no defines esta variable, por defecto usará `http://localhost:3001/api`.

## 🎯 Funcionalidades Implementadas

- ✅ Configuración inicial de Vite + React
- ✅ Instalación y configuración de Material UI
- ✅ Configuración de React Router con rutas públicas/privadas
- ✅ Configuración de Axios con interceptores de autenticación
- ✅ **Sistema de redirecciones basado en roles de usuario**
- 🔄 Hot Module Replacement (HMR)
- 📱 Diseño responsivo
- 🎨 Estilos CSS personalizados

## 🔐 Sistema de Roles y Redirecciones

El sistema implementa un mecanismo de control de acceso basado en roles de usuario:

### Roles Soportados
- **user**: Usuario estándar con acceso básico
- **moderator**: Moderador con permisos adicionales
- **admin**: Administrador con acceso completo

### Componente PrivateRoute Mejorado
```jsx
<PrivateRoute requiredRole="admin">
  <AdminDashboard />
</PrivateRoute>
```

### Comportamiento de Redirecciones
- **Usuario no autenticado**: Redirigido a `/login`
- **Usuario sin rol requerido**: Redirigido según su rol actual:
  - Admin → `/admin`
  - Moderator → `/moderator`
  - User → `/dashboard`

### Rutas Protegidas
- `/dashboard`: Acceso para cualquier usuario autenticado
- `/admin`: Solo para usuarios con rol `admin`
- `/moderator`: Solo para usuarios con rol `moderator`

## 📝 Próximas Funcionalidades (Sprint 1.2)

- [ ] Crear AuthContext básico (login/logout)
- [ ] Crear componentes Navbar y PrivateRoute
- [ ] Crear páginas Login y Register (solo UI)
- [ ] Gestión de menú
- [ ] Sistema de pedidos
- [ ] Panel de administración

## 🤝 Contribución

1. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
2. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
3. Push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
