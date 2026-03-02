# 🌱 Plataforma Web Full-Stack para Comercialización de Productos Agrícolas

Aplicación web desarrollada con tecnologías Full-Stack que permite a
productores de zonas rurales y mercados locales comercializar sus
productos directamente con consumidores urbanos, reduciendo la
dependencia de intermediarios y fomentando el comercio justo.

------------------------------------------------------------------------

## 🎯 Objetivos del Proyecto

### Objetivo General

Desarrollar una plataforma web Full-Stack que facilite la compra y venta
directa de productos agrícolas entre productores y consumidores.

### Objetivos Específicos

-   Implementar autenticación segura de usuarios (productores y
    consumidores).
-   Permitir la gestión completa de productos agrícolas (CRUD).
-   Visualizar productos en una interfaz dinámica y accesible.
-   Integrar un módulo básico de recomendaciones.
-   Aplicar principios de arquitectura de software y buenas prácticas.
-   Reducir la brecha digital mediante una solución tecnológica
    accesible.

------------------------------------------------------------------------

## 🏗️ Arquitectura del Sistema

El sistema está diseñado bajo una arquitectura cliente-servidor
desacoplada, siguiendo principios de separación de responsabilidades y
modularidad.

### 🔹 Modelo Arquitectónico

Se emplea una arquitectura basada en:

-   Frontend desacoplado (SPA)
-   Backend API REST
-   Base de datos relacional
-   Comunicación mediante JSON sobre HTTP/HTTPS

El backend implementa:

-   Arquitectura en capas
-   Controladores, servicios y repositorios
-   DTOs para validación
-   Autenticación basada en JWT
-   Manejo estructurado de errores

### 🔹 Flujo General del Sistema

Usuario\
↓\
Frontend (React)\
↓ HTTP/JSON\
Backend (NestJS)\
↓\
Base de Datos (PostgreSQL)

------------------------------------------------------------------------

## 💻 Stack Tecnológico

### 🔹 Frontend

-   React
-   JavaScript / TypeScript
-   Axios (consumo de API)
-   React Router
-   CSS

### 🔹 Backend

-   Node.js
-   NestJS
-   JWT (Autenticación)
-   Class-validator

### 🔹 Base de Datos

-   PostgreSQL
-   ORM (TypeORM o Prisma)

### 🔹 Herramientas

-   Git & GitHub
-   Postman
-   Docker (opcional)
-   VS Code

------------------------------------------------------------------------

## 🔐 Funcionalidades Implementadas

-   Registro e inicio de sesión de usuarios
-   Gestión de roles (Productor / Consumidor)
-   CRUD de productos agrícolas
-   Listado dinámico de productos
-   Protección de rutas autenticadas
-   Validación de formularios
-   Manejo básico de errores

------------------------------------------------------------------------

## 🚀 Instalación y Ejecución en Local

### 1️⃣ Clonar el repositorio

git clone https://github.com/tu-usuario/tu-repositorio.git\
cd tu-repositorio

### 2️⃣ Configuración del Backend

cd backend\
npm install

Crear archivo `.env`:

DATABASE_HOST=localhost\
DATABASE_PORT=5432\
DATABASE_USER=postgres\
DATABASE_PASSWORD=tu_password\
DATABASE_NAME=nombre_db\
JWT_SECRET=tu_clave_secreta

Ejecutar servidor:

npm run start:dev

### 3️⃣ Configuración del Frontend

cd frontend\
npm install\
npm start

------------------------------------------------------------------------


## 👨‍💻 Autor

Proyecto desarrollado por Jonas Maidana como parte del módulo de especialidad en
Desarrollo Full-Stack.
