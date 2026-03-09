# Agro Market API

RESTful API para una plataforma de marketplace agrícola construida con NestJS, TypeORM y PostgreSQL. Implementa arquitectura en capas (controllers, services, repositories) siguiendo principios SOLID.

## 📋 Descripción

API backend completa para marketplace agrícola con:
- **Autenticación y Autorización**: JWT, RBAC (roles: Admin, Seller, User)
- **Gestión de Usuarios**: CRUD completo con hash de contraseñas (bcrypt)
- **Gestión de Vendedores**: Información de ubicación con coordenadas
- **Catálogo de Productos**: CRUD con filtros avanzados, paginación y búsqueda
- **Carrito de Compras**: Agregar/modificar/eliminar items con validación de stock
- **Checkout Transaccional**: Descuento de stock con locks pesimistas para evitar race conditions
- **Rate Limiting**: Protección contra abuso con throttling
- **Documentación OpenAPI**: Swagger UI en `/api`

### Principios SOLID aplicados:
- **Dependency Inversion**: servicios dependen de interfaces de repositorios vía tokens de inyección
- **Single Responsibility**: controllers manejan HTTP, services manejan lógica de negocio, repositories acceden a datos
- **Open/Closed**: nuevas implementaciones de repositorios pueden agregarse sin modificar servicios

## 🚀 Configuración del Proyecto

### Prerrequisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14.x
- **Git**

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo de ejemplo y ajusta los valores:
```bash
cp .env.example .env.development
```

Variables requeridas:
```env
# Base de datos PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=agro_market

# Puerto del servidor
PORT=3001

# Modo de ejecución (DEV para desarrollo)
MODE=DEV

# Ejecutar migraciones automáticamente al iniciar
RUN_MIGRATIONS=true
```

4. **Configurar base de datos**

Asegúrate de que PostgreSQL esté corriendo y crea la base de datos:
```bash
psql -U postgres -c "CREATE DATABASE agro_market;"
```

5. **Ejecutar migraciones**
```bash
npm run migration:run
```

## 🏃 Ejecutar la aplicación

```bash
# Modo desarrollo (watch mode)
npm run start:dev

# Modo producción
npm run build
npm run start:prod

# Modo debug
npm run start:debug
```

La API estará disponible en `http://localhost:3001` (o el puerto configurado).

### Documentación Swagger
Una vez iniciada la aplicación, visita:
```
http://localhost:3001/api
```

## 🧪 Pruebas

```bash
# Ejecutar pruebas unitarias
npm run test

# Modo watch
npm run test:watch

# Cobertura de código
npm run test:cov

# Pruebas e2e
npm run test:e2e

# Debug de pruebas
npm run test:debug
```

Las pruebas están organizadas en:
- `test/unit/`: pruebas unitarias por módulo (controllers, services, repositories)
- `test/e2e/`: pruebas end-to-end

## 📚 Documentación de API

### Módulos Principales

#### 🔐 Autenticación (`/auth`)
- `POST /auth/login` - Iniciar sesión (genera JWT)
- `POST /auth/logout` - Cerrar sesión (revoca token)

**Autenticación**: Usa `Bearer <token>` en el header `Authorization` para endpoints protegidos.

#### 👥 Usuarios (`/users`)
- `POST /users` - Crear usuario (público)
- `GET /users` - Listar usuarios (Admin)
- `GET /users/:id` - Obtener usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

**Roles disponibles**: `Admin`, `Seller`, `User`

#### 🏪 Vendedores (`/sellers`)
- `POST /sellers` - Crear vendedor (Admin, Seller)
- `GET /sellers` - Listar vendedores (público)
- `GET /sellers/:id` - Obtener vendedor (público)
- `PATCH /sellers/:id` - Actualizar vendedor (Admin, Seller)
- `DELETE /sellers/:id` - Eliminar vendedor (Admin)

#### 📦 Productos (`/products`)
- `POST /products` - Crear producto (Admin, Seller)
- `GET /products` - Listar productos (público)
- `GET /products/search` - Buscar con filtros avanzados (público)
- `GET /products/by-seller/:sellerId` - Productos por vendedor (público)
- `GET /products/:id` - Obtener producto (público)
- `PATCH /products/:id` - Actualizar producto (Admin, Seller)
- `DELETE /products/:id` - Eliminar producto (Admin)

**Filtros disponibles**: `name`, `category`, `minPrice`, `maxPrice`, `minRating`, `minStock`, `unit`, `sortBy`, `sortOrder`, `page`, `limit`

Ver [PRODUCTS_FILTER_API.md](./PRODUCTS_FILTER_API.md) para documentación detallada de filtros.

#### 🛒 Carrito de Compras (`/cart`)
- `GET /cart` - Obtener carrito activo del usuario autenticado
- `POST /cart/items` - Agregar item al carrito
- `PATCH /cart/items/:itemId` - Actualizar cantidad de item
- `DELETE /cart/items/:itemId` - Eliminar item del carrito
- `DELETE /cart/items` - Vaciar carrito
- `POST /cart/checkout` - Finalizar compra (valida y descuenta stock)

**Validaciones de checkout**:
- Verifica stock disponible para cada producto
- Usa locks pesimistas para prevenir race conditions
- Descuenta stock transaccionalmente
- Retorna error 409 (Conflict) si stock insuficiente

### Ejemplos de Uso

#### Autenticación
```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'

# Respuesta
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Agregar al Carrito
```bash
curl -X POST http://localhost:3001/cart/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId": "uuid-del-producto", "quantity": 2}'
```

#### Checkout
```bash
curl -X POST http://localhost:3001/cart/checkout \
  -H "Authorization: Bearer <token>"
```

### Rate Limiting
- Límite: **10 requests por minuto** por IP
- Header de respuesta: `X-RateLimit-*`

## 🗄️ Migraciones de Base de Datos

```bash
# Generar nueva migración automáticamente basándose en cambios de entidades
npm run migration:generate

# Crear migración vacía manualmente
npm run migration:create

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert
```

**Nota**: Las migraciones se encuentran en `src/migrations/` y se ejecutan automáticamente en desarrollo si `RUN_MIGRATIONS=true`.

## 🐳 Despliegue con Docker

### Build de la imagen

```bash
# Build de imagen de producción
docker build -t agro-market-api .

# Run contenedor
docker run -p 3001:3001 \
  -e POSTGRES_HOST=host.docker.internal \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DATABASE=agro_market \
  -e PORT=3001 \
  -e MODE=PROD \
  agro-market-api
```

### Docker Compose (recomendado)

Crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: agro_market
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DATABASE: agro_market
      PORT: 3001
      MODE: PROD
      RUN_MIGRATIONS: "true"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

Iniciar servicios:
```bash
docker-compose up -d
```

## 🚀 Despliegue en Producción

### Configuración de Entorno de Producción

1. **Crea `.env.production`**:
```env
POSTGRES_HOST=your-db-host.com
POSTGRES_PORT=5432
POSTGRES_USER=agro_market_user
POSTGRES_PASSWORD=strong_password_here
POSTGRES_DATABASE=agro_market_prod

PORT=3001
MODE=PROD
RUN_MIGRATIONS=false

# CORS (dominios permitidos separados por coma)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT Secret (genera uno seguro)
JWT_SECRET=your-super-secret-jwt-key-here
```

2. **SSL/TLS para PostgreSQL**: En producción, habilita SSL en la conexión de base de datos (ver `src/config/config.service.ts`).

3. **Ejecutar migraciones manualmente**:
```bash
MODE=production npm run migration:run
```

4. **Build y start**:
```bash
npm run build
MODE=production npm run start:prod
```

### Consideraciones de Seguridad

- ✅ Autenticación JWT con expiración corta (15 minutos configurado)
- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ Rate limiting (10 req/min por defecto)
- ✅ CORS configurado con whitelist de orígenes
- ✅ Helmet integrado (comentado actualmente, descomentar en producción)
- ✅ Validación de DTOs con class-validator
- ✅ Soft deletes en entidades (no se borran físicamente)

**Recomendaciones adicionales**:
- Usa HTTPS/TLS en producción
- Configura firewall para limitar acceso a PostgreSQL
- Implementa log rotation y monitoreo
- Usa secrets manager para credenciales sensibles
- Habilita backups automáticos de base de datos

### CI/CD

El proyecto está preparado para integración continua:

**Variables de entorno requeridas en CI**:
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `PORT`
- `MODE`

**Pipeline sugerido**:
1. Install dependencies: `npm ci`
2. Lint: `npm run lint`
3. Test: `npm run test`
4. Build: `npm run build`
5. Build Docker image
6. Deploy to container registry
7. Update production service

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/
├── auth/               # Autenticación, guards, RBAC
├── cart/               # Carrito de compras y checkout
├── common/             # Utilidades compartidas, base entities
├── config/             # Configuración de BD y app
├── migrations/         # Migraciones de TypeORM
├── products/           # Gestión de productos
├── sellers/            # Gestión de vendedores
├── users/              # Gestión de usuarios
├── app.module.ts       # Módulo raíz
└── main.ts             # Entry point

test/
├── unit/               # Pruebas unitarias por módulo
└── e2e/                # Pruebas end-to-end
```

### Stack Tecnológico

- **Framework**: NestJS 11.x
- **Runtime**: Node.js 18+
- **ORM**: TypeORM 0.3.x
- **Base de Datos**: PostgreSQL 14+
- **Autenticación**: JWT (@nestjs/jwt)
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI (@nestjs/swagger)
- **Testing**: Jest
- **Seguridad**: bcrypt, helmet, throttler

## 🔧 Troubleshooting

### Error: "relation does not exist"
**Solución**: Ejecuta las migraciones:
```bash
npm run migration:run
```

### Error: "JWT expired"
**Solución**: El token tiene expiración de 15 minutos. Obtén un nuevo token con `/auth/login`.

### Error: "Insufficient stock for product"
**Solución**: Otro usuario compró el producto antes. Verifica stock actualizado en `/products/:id`.

### Error: "FOR UPDATE cannot be applied..."
**Solución**: Ya corregido en la versión actual. Asegúrate de usar la última versión del repositorio.

### Puerto 3001 en uso
**Solución**: Cambia el `PORT` en tu archivo `.env` o detén el proceso que usa el puerto:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

## 📝 Changelog

### v0.0.1 (Actual)
- ✅ Módulo de autenticación con JWT y RBAC
- ✅ CRUD de usuarios, productos y vendedores
- ✅ Filtrado avanzado de productos con paginación
- ✅ Carrito de compras con checkout transaccional
- ✅ Validación de stock con locks pesimistas
- ✅ Documentación Swagger
- ✅ Rate limiting
- ✅ Soft deletes en todas las entidades

## 📄 Licencia

Este proyecto es privado y no tiene licencia de código abierto.

## 👥 Equipo

Para dudas o soporte, contacta al equipo de desarrollo.

---

**Documentación adicional**:
- [Filtros de Productos](./PRODUCTS_FILTER_API.md)
- [NestJS Documentation](https://docs.nestjs.com)
