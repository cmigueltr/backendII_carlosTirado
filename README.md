# Proyecto Backend - Ecommerce con Arquitectura Profesional

## Descripción

Proyecto backend desarrollado con Node.js, Express y MongoDB, implementando una arquitectura profesional con patrones de diseño (DAO, Repository, DTO), sistema de autenticación y autorización por roles, y funcionalidades completas de ecommerce.

## Características Principales

- ✅ **Patrón Repository**: Separación de lógica de acceso a datos (DAO) y lógica de negocio (Repository)
- ✅ **DTOs (Data Transfer Objects)**: Transferencia segura de datos sin información sensible
- ✅ **Sistema de Recuperación de Contraseña**: Con email y expiración de 1 hora
- ✅ **Middleware de Autorización**: Control de acceso por roles (admin/user)
- ✅ **Ecommerce Completo**: Productos, carrito de compras y sistema de tickets
- ✅ **Validación de Stock**: Manejo inteligente de compras completas e incompletas

## Arquitectura

```
src/
├── config/          # Configuración (DB, Passport, Email)
├── controllers/     # Controladores de las rutas
├── dao/             # Data Access Objects (acceso a datos)
├── dto/             # Data Transfer Objects (objetos de transferencia)
├── middlewares/     # Middlewares de autenticación y autorización
├── models/          # Modelos de Mongoose
├── repositories/    # Repositorios (lógica de negocio)
├── routes/          # Rutas de la API
├── services/        # Servicios (email, password)
└── utils/           # Utilidades (JWT)
```

## Setup

1. Copiar el archivo de variables de entorno:
   ```bash
   cp env.example .env
   ```

2. Configurar las variables en `.env`:
   - `MONGO_URI`: URL de conexión a MongoDB
   - `JWT_SECRET`: Secret para firmar tokens JWT
   - `EMAIL_USER` y `EMAIL_PASSWORD`: Credenciales para el servicio de email

3. Instalar dependencias:
   ```bash
   npm install
   ```

4. Ejecutar el servidor:
   ```bash
   npm run dev  # Desarrollo con nodemon
   # o
   npm start    # Producción
   ```

## Variables de Entorno

Ver archivo `env.example` para la lista completa de variables necesarias:

- `PORT`: Puerto del servidor (default: 3000)
- `MONGO_URI`: URL de MongoDB
- `JWT_SECRET`: Secret para JWT
- `JWT_EXPIRES_IN`: Expiración del token (default: 1h)
- `SALT_ROUNDS`: Rondas para bcrypt (default: 10)
- `EMAIL_SERVICE`: Servicio de email (default: gmail)
- `EMAIL_USER`: Email del remitente
- `EMAIL_PASSWORD`: Contraseña o app password del email
- `FRONTEND_URL`: URL del frontend para enlaces en emails

## Endpoints de la API

### Autenticación (`/api/sessions`)

- `POST /api/sessions/register` - Registrar nuevo usuario
- `POST /api/sessions/login` - Iniciar sesión (retorna JWT)
- `GET /api/sessions/current` - Obtener usuario actual (requiere JWT)
- `POST /api/sessions/password-reset` - Solicitar recuperación de contraseña
- `POST /api/sessions/reset-password` - Restablecer contraseña con token

### Usuarios (`/api/users`)

- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear usuario (admin)
- `PUT /api/users/:id` - Actualizar usuario (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)

### Productos (`/api/products`)

- `GET /api/products` - Listar productos (público)
- `GET /api/products/:id` - Obtener producto por ID (público)
- `POST /api/products` - Crear producto (**solo admin**)
- `PUT /api/products/:id` - Actualizar producto (**solo admin**)
- `DELETE /api/products/:id` - Eliminar producto (**solo admin**)

Query params para GET /api/products:
- `category`: Filtrar por categoría
- `status`: Filtrar por estado (true/false)

### Carrito (`/api/carts`)

- `GET /api/carts` - Obtener mi carrito (**solo usuario**)
- `POST /api/carts/products` - Agregar producto al carrito (**solo usuario**)
  - Body: `{ productId: string, quantity: number }`
- `PUT /api/carts/products/:productId` - Actualizar cantidad (**solo usuario**)
  - Body: `{ quantity: number }`
- `DELETE /api/carts/products/:productId` - Eliminar producto del carrito (**solo usuario**)
- `DELETE /api/carts` - Vaciar carrito (**solo usuario**)

### Tickets/Compras (`/api/tickets`)

- `POST /api/tickets` - Realizar compra (**solo usuario**)
- `GET /api/tickets` - Listar mis tickets (usuarios) o todos (admin)
- `GET /api/tickets/:id` - Obtener ticket por ID

## Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

### Roles

- **user**: Usuario regular (puede ver productos, gestionar carrito, comprar)
- **admin**: Administrador (puede gestionar productos y usuarios)

## Sistema de Recuperación de Contraseña

1. El usuario solicita recuperación: `POST /api/sessions/password-reset`
   - Body: `{ email: string }`
   - Se envía un email con un enlace (expira en 1 hora)

2. El usuario hace clic en el enlace y restablece la contraseña: `POST /api/sessions/reset-password`
   - Body: `{ token: string, newPassword: string }`
   - Validaciones:
     - El token debe ser válido y no expirado
     - La nueva contraseña no puede ser igual a la anterior

## DTOs (Data Transfer Objects)

El endpoint `/api/sessions/current` y otros retornan DTOs que excluyen información sensible como:
- `password`
- `resetPasswordToken`
- `resetPasswordExpires`

## Lógica de Compra

El sistema de compras (`POST /api/tickets`) incluye:

1. Validación de stock en tiempo real
2. Generación de ticket solo con productos disponibles
3. Actualización automática de stock
4. Manejo de compras parciales (si algunos productos no tienen stock, se mantienen en el carrito)
5. Limpieza automática del carrito después de compra exitosa

## Patrones de Diseño Implementados

### DAO (Data Access Object)
- Acceso directo a la base de datos
- Métodos básicos CRUD
- Ubicación: `src/dao/`

### Repository
- Lógica de negocio
- Utiliza DAOs para acceso a datos
- Validaciones y transformaciones
- Ubicación: `src/repositories/`

### DTO (Data Transfer Object)
- Objetos de transferencia sin información sensible
- Ubicación: `src/dto/`

## Notas Técnicas

- Passwords se almacenan hasheados con bcrypt
- JWT se usa para autenticación stateless
- Passport.js configurado con estrategias: `local`, `jwt`, `current`
- El carrito se crea automáticamente cuando un usuario lo necesita
- Los productos tienen validación de código único

## Estructura de Modelos

### User
- Información del usuario
- Referencia al carrito
- Tokens de recuperación de contraseña

### Product
- Información del producto
- Stock y precio
- Código único

### Cart
- Referencia al usuario
- Array de productos con cantidades

### Ticket
- Código único de compra
- Email del comprador
- Productos comprados
- Monto total
