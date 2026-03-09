# API de Filtrado de Productos

## Endpoint de Búsqueda y Filtrado

**URL:** `GET /products/search`

**Autenticación:** No requerida (endpoint público)

### Parámetros de Query

Todos los parámetros son opcionales y se pueden combinar:

#### Filtros de Búsqueda
- **name** (string): Busca productos por nombre (búsqueda parcial, no distingue mayúsculas/minúsculas)
  - Ejemplo: `name=tomate`

- **category** (string): Filtra productos por categoría exacta (no distingue mayúsculas/minúsculas)
  - Ejemplo: `category=verduras`

- **unit** (string): Filtra productos por unidad de medida (no distingue mayúsculas/minúsculas)
  - Ejemplo: `unit=kg`

#### Filtros de Rango
- **minPrice** (number): Precio mínimo
  - Ejemplo: `minPrice=10`

- **maxPrice** (number): Precio máximo
  - Ejemplo: `maxPrice=100`

- **minRating** (number): Calificación mínima (0-5)
  - Ejemplo: `minRating=4`

- **minStock** (number): Stock mínimo disponible
  - Ejemplo: `minStock=10`

#### Ordenamiento
- **sortBy** (string): Campo por el cual ordenar
  - Valores: `name`, `price`, `rating`, `createDateTime`, `category`, `stock`
  - Por defecto: `createDateTime`
  - Ejemplo: `sortBy=price`

- **sortOrder** (string): Orden ascendente o descendente
  - Valores: `ASC`, `DESC`
  - Por defecto: `DESC`
  - Ejemplo: `sortOrder=ASC`

#### Paginación
- **page** (number): Número de página (comienza en 1)
  - Por defecto: `1`
  - Ejemplo: `page=2`

- **limit** (number): Cantidad de items por página (máximo 100)
  - Por defecto: `10`
  - Ejemplo: `limit=20`

### Ejemplos de Uso

#### 1. Buscar productos por nombre
```
GET /products/search?name=tomate
```

#### 2. Filtrar por categoría y precio
```
GET /products/search?category=verduras&minPrice=5&maxPrice=50
```

#### 3. Buscar con calificación mínima y ordenar por precio
```
GET /products/search?minRating=4&sortBy=price&sortOrder=ASC
```

#### 4. Búsqueda completa con paginación
```
GET /products/search?name=tomate&category=verduras&minPrice=10&maxPrice=100&minRating=3.5&minStock=5&sortBy=rating&sortOrder=DESC&page=1&limit=20
```

#### 5. Productos con stock disponible, ordenados por fecha
```
GET /products/search?minStock=1&sortBy=createDateTime&sortOrder=DESC&page=1&limit=10
```

### Respuesta

La API devuelve un objeto con la siguiente estructura:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Tomate Cherry",
      "price": 25.50,
      "unit": "kg",
      "image": "url",
      "images": ["url1", "url2"],
      "description": "Descripción del producto",
      "category": "verduras",
      "stock": 100,
      "rating": 4.5,
      "isActive": true,
      "isArchived": false,
      "createDateTime": "2026-03-09T10:00:00Z",
      "createdBy": "user-id",
      "lastChangedDateTime": "2026-03-09T10:00:00Z",
      "lastChangedBy": "user-id"
    }
  ],
  "total": 45,      // Total de productos que coinciden con los filtros
  "page": 1,        // Página actual
  "limit": 10       // Items por página
}
```

### Códigos de Estado HTTP

- **200 OK**: Búsqueda exitosa (devuelve array vacío si no hay resultados)
- **400 Bad Request**: Parámetros de query inválidos

### Notas Importantes

1. El endpoint solo devuelve productos activos (`isActive: true`) y no archivados (`isArchived: false`)
2. La búsqueda por nombre es parcial (busca coincidencias en cualquier parte del nombre)
3. Los filtros de categoría y unidad son exactos pero no distinguen mayúsculas/minúsculas
4. Los filtros se pueden combinar libremente
5. La paginación ayuda a mejorar el rendimiento cuando hay muchos productos
6. El campo `total` indica cuántos productos coinciden con los filtros (antes de la paginación)

### Casos de Uso Comunes

#### Listado inicial de productos
```
GET /products/search?page=1&limit=12
```

#### Filtrar por categoría para un menú
```
GET /products/search?category=frutas
```

#### Buscar productos disponibles con buen rating
```
GET /products/search?minStock=1&minRating=4&sortBy=rating&sortOrder=DESC
```

#### Productos en un rango de precio
```
GET /products/search?minPrice=20&maxPrice=50&sortBy=price&sortOrder=ASC
```

