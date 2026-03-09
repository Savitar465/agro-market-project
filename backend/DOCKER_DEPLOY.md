# Agro Market - Despliegue Docker

Este directorio contiene la configuración necesaria para desplegar la API de Agro Market usando Docker y Docker Compose.

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker >= 20.x
- Docker Compose >= 2.x

### Despliegue Local

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd backend
```

2. **Configurar variables de entorno (opcional)**

Crea un archivo `.env` en la raíz del proyecto:
```env
POSTGRES_PASSWORD=your_secure_password
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

3. **Iniciar los servicios**
```bash
docker-compose up -d
```

4. **Verificar que los servicios estén corriendo**
```bash
docker-compose ps
```

5. **Ver logs**
```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs solo de la API
docker-compose logs -f api

# Logs solo de PostgreSQL
docker-compose logs -f postgres
```

6. **Acceder a la API**
- API: http://localhost:3001
- Swagger UI: http://localhost:3001/api

### Detener los servicios

```bash
# Detener contenedores (mantiene datos)
docker-compose stop

# Detener y eliminar contenedores (mantiene volúmenes)
docker-compose down

# Eliminar todo incluyendo volúmenes (⚠️ borra la base de datos)
docker-compose down -v
```

## 🔧 Configuración Avanzada

### Variables de Entorno

El archivo `docker-compose.yml` soporta las siguientes variables:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `agro_market_pass` |
| `CORS_ALLOWED_ORIGINS` | Orígenes CORS permitidos | `http://localhost:3000,http://localhost:5173` |

### Persistencia de Datos

Los datos de PostgreSQL se almacenan en un volumen Docker llamado `postgres_data`. Para hacer backup:

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres agro_market > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres agro_market < backup.sql
```

### Acceso a la Base de Datos

```bash
# Conectar a PostgreSQL desde el contenedor
docker-compose exec postgres psql -U postgres -d agro_market

# Conectar desde host (si tienes psql instalado)
psql -h localhost -U postgres -d agro_market
```

### Ejecutar Migraciones Manualmente

```bash
# Entrar al contenedor de la API
docker-compose exec api sh

# Ejecutar migración
npm run migration:run

# Revertir migración
npm run migration:revert
```

## 🐳 Build Manual de Imagen

Si prefieres construir la imagen por separado:

```bash
# Build
docker build -t agro-market-api:latest .

# Run
docker run -d \
  --name agro-market-api \
  -p 3001:3001 \
  -e POSTGRES_HOST=host.docker.internal \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DATABASE=agro_market \
  -e PORT=3001 \
  -e MODE=PROD \
  agro-market-api:latest
```

## 📊 Monitoreo

### Health Checks

El servicio de PostgreSQL incluye un health check automático. La API solo iniciará cuando PostgreSQL esté listo.

### Logs Estructurados

```bash
# Ver logs en tiempo real con timestamps
docker-compose logs -f --timestamps

# Ver últimas 100 líneas de logs
docker-compose logs --tail=100
```

### Métricas de Recursos

```bash
# Ver uso de CPU y memoria
docker stats agro-market-api agro-market-postgres
```

## 🔒 Seguridad en Producción

Para despliegue en producción:

1. **Cambiar contraseñas por defecto**
```bash
export POSTGRES_PASSWORD=$(openssl rand -base64 32)
```

2. **No exponer puertos innecesarios**
   - Comenta el mapeo de puerto 5432 si no necesitas acceso directo a PostgreSQL

3. **Usar secrets**
   - Usa Docker secrets o variables de entorno seguras
   - Nunca commitees contraseñas en `.env` al repositorio

4. **Habilitar TLS**
   - Configura certificados SSL para PostgreSQL
   - Usa un reverse proxy (nginx) con HTTPS

5. **Limitar recursos**
```yaml
api:
  # ...
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

## 🚀 Despliegue en Nube

### AWS ECS / Fargate

1. Sube la imagen a ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag agro-market-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/agro-market-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/agro-market-api:latest
```

2. Crea un task definition con las variables de entorno necesarias
3. Configura RDS PostgreSQL como base de datos
4. Despliega en un servicio ECS

### Google Cloud Run

```bash
# Build y push a GCR
gcloud builds submit --tag gcr.io/[PROJECT-ID]/agro-market-api

# Deploy
gcloud run deploy agro-market-api \
  --image gcr.io/[PROJECT-ID]/agro-market-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars POSTGRES_HOST=[CLOUD_SQL_CONNECTION]
```

### Azure Container Instances

```bash
az container create \
  --resource-group agro-market-rg \
  --name agro-market-api \
  --image agro-market-api:latest \
  --dns-name-label agro-market-api \
  --ports 3001
```

## 🔍 Troubleshooting

### La API no inicia

```bash
# Ver logs detallados
docker-compose logs api

# Verificar que PostgreSQL esté listo
docker-compose exec postgres pg_isready -U postgres
```

### Error de conexión a base de datos

```bash
# Verificar red
docker network inspect backend_agro-market-network

# Verificar que los servicios estén en la misma red
docker-compose exec api ping postgres
```

### Recrear contenedores

```bash
# Forzar recreación
docker-compose up -d --force-recreate

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Recursos

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

