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
Inicia el servidor de desarrollo en `http://localhost:3000`

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
├── components/           # Componentes reutilizables
│   ├── AdminDashboard.jsx
│   ├── AdminTables.jsx
│   ├── CustomerTicket.jsx
│   ├── Dashboard.jsx
│   ├── DishesList.jsx
│   ├── DishesTest.jsx
│   ├── DishForm.jsx
│   ├── ForgotPassword.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── ModeratorDashboard.jsx
│   ├── Navbar.jsx
│   ├── OrdersList.jsx
│   ├── OrderTicket.jsx
│   ├── PrivateRoute.jsx
│   ├── Register.jsx
│   ├── ResetPassword.jsx
│   ├── TableForm.jsx
│   ├── UserInfo.jsx
│   ├── WaiterTables.jsx
│   └── __tests__/       # Tests de componentes
├── context/             # Contextos de React para estado global
│   ├── AuthContext.jsx
│   ├── DishesContext.jsx
│   ├── OrdersContext.jsx
│   ├── TablesContext.jsx
│   └── ToastContext.jsx
├── pages/               # Páginas específicas de la aplicación
│   └── orders/
│       ├── ChefOrdersQueue.jsx
│       └── WaiterOrderForm.jsx
├── services/            # Servicios para comunicación con API
│   ├── api/
│   │   ├── api.js       # Configuración de Axios con interceptores
│   │   └── README.md
│   ├── auth/
│   │   ├── authService.js
│   │   └── __tests__/
│   ├── dishes/
│   │   └── dishesService.js
│   ├── orderDetails/
│   │   ├── orderDetailsService.js
│   │   └── __tests__/
│   ├── orders/
│   │   ├── ordersService.js
│   │   └── __tests__/
│   ├── tables/
│   │   └── tablesService.js
│   └── users/
│       └── usersService.js
├── utils/               # Utilidades
│   └── validations.js
├── App.jsx              # Componente principal con rutas
├── main.jsx             # Punto de entrada
├── theme.js             # Tema de Material UI
├── App.css              # Estilos de la aplicación
├── index.css            # Estilos globales
├── setupTests.js        # Configuración de tests
└── theme.js             # Tema de Material UI
```

## ⚙️ Configuración de la API

El proyecto utiliza Axios configurado en `src/services/api/api.js`.

Para configurar la URL del backend, crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

Si no defines esta variable, por defecto usará `http://localhost:3000/api`.

## 🎯 Funcionalidades Implementadas

### Autenticación y Autorización
- ✅ Sistema completo de autenticación (login, registro, recuperación de contraseña)
- ✅ Control de acceso basado en roles (admin, moderator, waiter)
- ✅ Contextos de React para gestión de estado global (AuthContext, etc.)
- ✅ Componente PrivateRoute con redirecciones automáticas
- ✅ Interceptores de Axios para manejo automático de tokens JWT

### Interfaz de Usuario
- ✅ Diseño responsivo con Material UI
- ✅ Componentes reutilizables y modulares
- ✅ Sistema de navegación con React Router
- ✅ Tema personalizado de Material UI
- ✅ Notificaciones con ToastContext

### Gestión del Restaurante
- ✅ **Panel de Administración**: Gestión completa de mesas, platos y usuarios
- ✅ **Panel de Moderador**: Funcionalidades intermedias
- ✅ **Panel de Mesero**: Creación y gestión de pedidos
- ✅ **Panel de Cocina**: Visualización de cola de pedidos
- ✅ Formularios para crear/editar platos y mesas
- ✅ Sistema de tickets de pedidos (PDF)

### API Integration
- ✅ Servicios modulares para todas las entidades (dishes, orders, tables, users)
- ✅ Manejo de errores centralizado
- ✅ Configuración automática de headers de autenticación

### Desarrollo y Testing
- ✅ Configuración completa de Vite para desarrollo
- ✅ Suite de tests unitarios e integración
- ✅ Hot Module Replacement (HMR)
- ✅ ESLint y configuración de testing

## 🔐 Sistema de Roles y Redirecciones

El sistema implementa un mecanismo de control de acceso basado en roles de usuario:

### Roles Soportados
- **admin**: Administrador con acceso completo (gestión de usuarios, platos, mesas, pedidos)
- **moderator**: Moderador con permisos intermedios
- **waiter**: Mesero (crear pedidos, ver mesas y platos)

### Componente PrivateRoute Mejorado
```jsx
<PrivateRoute requiredRole="admin">
  <AdminDashboard />
</PrivateRoute>
```

### Comportamiento de Redirecciones
- **Usuario no autenticado**: Redirigido a `/login`
- **Usuario sin rol requerido**: Redirigido según su rol actual

### Rutas Disponibles
- `/`: Página de inicio
- `/login`, `/register`: Autenticación
- `/dashboard`: Dashboard general
- `/admin`: Panel de administración
- `/moderator`: Panel de moderador
- `/waiter/orders/create`: Formulario de pedidos para meseros
- `/chef/orders`: Cola de pedidos para cocina

## 🤝 Contribución

1. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
2. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
3. Push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
