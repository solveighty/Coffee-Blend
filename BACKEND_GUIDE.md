# Guía Rápida - Coffee Blend Backend

## Resumen del Proyecto

Se ha creado un sistema completo de reservas de mesas ("Book a Table") con:
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: HTML + JavaScript integrado

## Estructura del Proyecto

```
Coffee-Blend-main/
├── backend/                    # Servidor Node.js
│   ├── server.js              # Servidor principal
│   ├── init-db.js             # Script de inicialización de BD
│   ├── db.js                  # Configuración de conexión a BD
│   ├── package.json           # Dependencias Node.js
│   ├── .env.example           # Variables de entorno (ejemplo)
│   ├── .gitignore             # Archivos a ignorar en Git
│   └── README.md              # Documentación del backend
├── js/
│   ├── reservation-api.js     # Funciones para llamar la API
│   ├── appointment-form.js    # Manejador del formulario
│   └── ...otros archivos
├── index.html                 # Página principal (modificada)
├── menu.html                  # Página de menú (modificada)
└── setup.sh                   # Script de configuración automática
```

## Instalación Rápida

### Opción 1: Con Script Automático (Recomendado)

```bash
chmod +x setup.sh
./setup.sh
```

### Opción 2: Manual

#### 1. Crear base de datos PostgreSQL

```bash
# Con psql
createdb coffee_blend

# O usando psql interactivo
psql -U postgres
postgres=# CREATE DATABASE coffee_blend;
postgres=# \q
```

#### 2. Configurar el backend

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL:
```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/coffee_blend
PORT=5000
NODE_ENV=development
```

#### 3. Instalar dependencias

```bash
npm install
```

#### 4. Inicializar la base de datos

```bash
node init-db.js
```

#### 5. Iniciar el servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

## Uso del Sistema

### 1. En el Frontend

El formulario "Book a Table" está disponible en:
- **index.html** - Sección de citas
- **menu.html** - Sección "Book a Table"

El formulario:
1. Recopila: Nombre, Apellido, Fecha, Hora, Teléfono, Mensaje
2. Valida los datos
3. Envía a la API del backend
4. Muestra un mensaje de confirmación o error

### 2. En el Backend

Endpoints disponibles:

**Crear una reserva**
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "date": "2025-02-15",
    "time": "19:30",
    "phone": "+34 612 345 678",
    "message": "Mesa para 2 personas"
  }'
```

**Obtener todas las reservas**
```bash
curl http://localhost:5000/api/reservations
```

**Obtener una reserva específica**
```bash
curl http://localhost:5000/api/reservations/1
```

**Eliminar una reserva**
```bash
curl -X DELETE http://localhost:5000/api/reservations/1
```

## Base de Datos

### Tabla: reservations

```sql
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Variables de Entorno (.env)

```
DATABASE_URL         # Cadena de conexión PostgreSQL
PORT                 # Puerto del servidor (default: 5000)
NODE_ENV            # Ambiente: development o production
```

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL no está corriendo
- Verificar la cadena de conexión en `.env`
- Asegurarse que la base de datos existe

### Error: "Port 5000 already in use"
- Cambiar el puerto en `.env`
- O detener la aplicación que usa el puerto

### Error: "CORS error" en el navegador
- El backend no está corriendo
- Verificar que el servidor esté en http://localhost:5000
- Revisar la consola del navegador para más detalles

## Características Implementadas

✓ API RESTful completa
✓ Validación de datos en frontend y backend
✓ Formulario responsivo
✓ Almacenamiento en PostgreSQL
✓ Manejo de errores
✓ Mensajes de confirmación/error
✓ CORS habilitado
✓ Índices en BD para mejor rendimiento

## Próximos Pasos

Para mejorar el sistema, considera:

1. **Autenticación**: Agregar login para visualizar reservas
2. **Email**: Enviar confirmación de reserva por email
3. **Admin Panel**: Crear panel para gestionar reservas
4. **Validación**: Validar fechas/horas disponibles
5. **Notificaciones**: Notificaciones push o SMS
6. **Reportes**: Dashboard con estadísticas de reservas

## Documentación Completa

Consulta `backend/README.md` para documentación más detallada del API.

## Soporte

Para reportar problemas o preguntas:
1. Revisa los logs del servidor
2. Revisa la consola del navegador (F12)
3. Verifica que PostgreSQL esté corriendo
4. Verifica las credenciales en `.env`
