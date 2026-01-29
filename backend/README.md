# Coffee Blend Backend - Table Reservation System

## Instalación y Configuración

### 1. Requisitos previos
- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### 2. Instalación

```bash
cd backend
npm install
```

### 3. Configuración de la base de datos

#### Crear la base de datos en PostgreSQL

```bash
createdb coffee_blend
```

O si prefieres usar psql:

```sql
CREATE DATABASE coffee_blend;
```

#### Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y actualiza los valores:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/coffee_blend
PORT=5000
NODE_ENV=development
```

**Reemplaza:**
- `user`: tu usuario de PostgreSQL (por defecto `postgres`)
- `password`: tu contraseña de PostgreSQL
- `localhost`: el host de PostgreSQL (por defecto `localhost`)
- `5432`: el puerto de PostgreSQL (por defecto `5432`)

#### Inicializar la base de datos

```bash
node init-db.js
```

Este script creará la tabla `reservations` automáticamente.

### 4. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## API Endpoints

### 1. Verificar estado del servidor
```
GET /api/health
```

**Respuesta:**
```json
{
  "status": "Server is running"
}
```

### 2. Crear una reserva
```
POST /api/reservations
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "date": "2025-02-15",
  "time": "19:30",
  "phone": "+34 612 345 678",
  "message": "Mesa para dos personas"
}
```

**Respuesta (201 - Creado):**
```json
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "date": "2025-02-15",
    "time": "19:30:00",
    "phone": "+34 612 345 678",
    "message": "Mesa para dos personas",
    "created_at": "2025-01-29T10:30:45.123Z"
  }
}
```

### 3. Obtener todas las reservas
```
GET /api/reservations
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Juan",
      "last_name": "Pérez",
      "date": "2025-02-15",
      "time": "19:30:00",
      "phone": "+34 612 345 678",
      "message": "Mesa para dos personas",
      "created_at": "2025-01-29T10:30:45.123Z"
    }
  ]
}
```

### 4. Obtener una reserva por ID
```
GET /api/reservations/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "date": "2025-02-15",
    "time": "19:30:00",
    "phone": "+34 612 345 678",
    "message": "Mesa para dos personas",
    "created_at": "2025-01-29T10:30:45.123Z"
  }
}
```

### 5. Eliminar una reserva
```
DELETE /api/reservations/:id
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Reservation deleted successfully"
}
```

## Solución de problemas

### Error: "Error connecting to database"
- Verifica que PostgreSQL esté corriendo
- Verifica la cadena de conexión en `.env`
- Verifica que la base de datos `coffee_blend` exista

### Error: "Port already in use"
- Cambia el `PORT` en el archivo `.env`
- O cierra la aplicación que está usando ese puerto

### Error: "Missing required fields"
- Verifica que todos los campos obligatorios se estén enviando desde el frontend:
  - `firstName`
  - `lastName`
  - `date`
  - `time`
  - `phone`

## Notas de desarrollo

- El campo `message` es opcional
- Los campos de fecha y hora deben estar en formato ISO (YYYY-MM-DD y HH:mm)
- El servidor incluye CORS habilitado para permitir peticiones desde el frontend
- Todas las respuestas incluyen un campo `success` para indicar el estado de la operación
