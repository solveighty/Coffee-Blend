# Coffee Blend - Frontend Configuration Guide

## API URL Configuration

La URL del backend está centralizada en un solo archivo para facilitar cambios según el ambiente.

### Ubicación
- Archivo: `js/config.js`
- Línea: 5

### Cómo cambiar la URL

1. Abre `js/config.js`
2. Modifica la línea:
```javascript
const API_URL = 'http://localhost:5000';
```

### Ejemplos de configuración por ambiente

#### Desarrollo Local
```javascript
const API_URL = 'http://localhost:5000';
```

#### Producción (servidor remoto)
```javascript
const API_URL = 'https://api.yourdomain.com';
```

#### Docker
```javascript
const API_URL = 'http://backend:5000';
```

#### AWS/Cloud
```javascript
const API_URL = 'https://your-aws-instance.com:5000';
```

### Scripts que usan esta configuración

Los siguientes archivos usan automáticamente `API_BASE_URL` de `config.js`:

1. **js/reservation-api.js** - Para reservaciones
2. **js/checkout-form.js** - Para órdenes de compra
3. **js/cart.js** - Sistema de carrito (localStorage, no necesita API)

### Carga de scripts en HTML

**Importante:** Asegúrate de que `config.js` se carga ANTES de los scripts que lo usan:

```html
<!-- Primero: Configuración -->
<script src="js/config.js"></script>

<!-- Después: Scripts que usan config -->
<script src="js/reservation-api.js"></script>
<script src="js/checkout-form.js"></script>
```

### Verificar la configuración en el navegador

Abre la consola del navegador (F12) y verás logs como:
```
[CONFIG.JS] API_URL: http://localhost:5000
[CONFIG.JS] API_BASE_URL: http://localhost:5000/api
[RESERVATION-API.JS] Using API_BASE_URL: http://localhost:5000/api
```

## Frontend Pages

- `index.html` - Home page con formulario de reservaciones
- `shop.html` - Tienda de productos
- `product-single.html` - Detalle de producto
- `cart.html` - Carrito de compras
- `checkout.html` - Formulario de compra
- `menu.html` - Menú
- `about.html`, `contact.html`, `blog.html`, `services.html` - Páginas estáticas

## Ambiente de Desarrollo

```bash
# Desde la carpeta raíz del proyecto
python3 -m http.server 8000

# Accede a: http://localhost:8000
```

## Notas

- El frontend NO usa un archivo `.env` real (JavaScript en navegador no puede leerlo)
- La configuración está en `js/config.js` como alternativa centralizada
- Para cambios rápidos, solo modifica una línea en `config.js`
