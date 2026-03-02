# 🌱 Plataforma Web de Comercialización Agrícola

## Descripción

Sistema web Full-Stack que permite a productores agrícolas comercializar
sus productos directamente con consumidores urbanos, reduciendo la
dependencia de intermediarios y fomentando el comercio justo mediante
una plataforma digital accesible y segura.

------------------------------------------------------------------------

## Objetivo general

Desarrollar una plataforma web Full-Stack que permita la gestión y
comercialización directa de productos agrícolas entre productores y
consumidores.

------------------------------------------------------------------------

## Objetivos específicos (medibles)

-   Implementar una API REST con al menos 5 endpoints core funcionando.
-   Persistir datos en base de datos PostgreSQL y validar operaciones
    con Postman.
-   Desarrollar un sistema de autenticación con JWT.
-   Implementar CRUD completo de productos agrícolas.
-   Proteger rutas privadas mediante middleware de autenticación.

------------------------------------------------------------------------

## Alcance (qué incluye / qué NO incluye)

### Incluye:

-   Registro e inicio de sesión de usuarios
-   Gestión de roles (Productor / Consumidor)
-   CRUD de productos agrícolas
-   Conexión a base de datos PostgreSQL
-   Validación de datos en backend
-   Consumo de API desde frontend

### No incluye (por ahora):

-   Sistema de pagos en línea
-   Notificaciones en tiempo real
-   Roles administrativos avanzados
-   Aplicación móvil nativa

------------------------------------------------------------------------

## Stack tecnológico

-   Frontend: React + TypeScript
-   Backend: Node.js + NestJS
-   Base de datos: PostgreSQL
-   Testing: Postman
-   Control de versiones: Git + GitHub
-   Opcional: Docker

------------------------------------------------------------------------

## Arquitectura (resumen simple)

Cliente (React Frontend) → API REST (NestJS Backend) → Base de datos
(PostgreSQL)

Arquitectura en capas: - Controller → recibe la petición - Service →
aplica la lógica de negocio - Repository / ORM → gestiona acceso a base
de datos

------------------------------------------------------------------------

## Endpoints core (priorizados)

1.  POST /auth/register
2.  POST /auth/login
3.  POST /products
4.  GET /products
5.  PATCH /products/:id
6.  DELETE /products/:id

------------------------------------------------------------------------

## Cómo ejecutar el proyecto (local)

### 1. Clonar repositorio

``` bash
git clone <URL>
cd nombre-del-proyecto
```

### 2. Instalar dependencias

Backend:

``` bash
cd backend
npm install
```

Frontend:

``` bash
cd frontend
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la carpeta backend.

### 4. Ejecutar servidor

Backend:

``` bash
npm run start:dev
```

Frontend:

``` bash
npm start
```

------------------------------------------------------------------------

## Variables de entorno (ejemplo)

``` env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password
DATABASE_NAME=agro_db
JWT_SECRET=clave_secreta
```

------------------------------------------------------------------------

## Equipo y roles

-   Jonas Maidana: Backend / Arquitectura
-   Nombre 2: Frontend
-   Nombre 3: DevOps / QA

------------------------------------------------------------------------

# 📂 Estructura Básica del Backend

    backend/
    │
    ├── src/
    │   ├── app.js / main.ts
    │   ├── server.js
    │   │
    │   ├── routes/
    │   │   └── product.routes.js
    │   │
    │   ├── controllers/
    │   │   └── product.controller.js
    │   │
    │   ├── services/
    │   │   └── product.service.js
    │   │
    │   ├── models/
    │   │   └── product.model.js
    │   │
    │   ├── db/
    │   │   └── index.js
    │   │
    │   ├── middlewares/
    │   │   └── auth.js
    │   │
    │   └── config/
    │       └── env.js
    │
    ├── tests/
    ├── .env.example
    ├── package.json
    └── README.md

### Explicación simple

-   Routes recibe la petición HTTP.
-   Controller decide qué acción ejecutar.
-   Service aplica la lógica del negocio.
-   Model / DB guarda o consulta los datos.
