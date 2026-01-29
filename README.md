# Task Manager - Migración a React (Next.js) + Express + MongoDB Atlas

Este repo contiene:

- **Legacy**: `index.html` + `style.css` + `app.js` (sin servidor, usa `localStorage`)
- **Nuevo**: **Next.js (React)** en `client/` + **Express (Node)** en `server/` + **MongoDB Atlas**

## Qué se migró

- **Login** (JWT)
- **CRUD de Tareas**
- **CRUD de Proyectos**
- **Comentarios** por tarea
- **Historial / auditoría**
- **Notificaciones** (pendientes y “marcar leídas”)
- **Búsqueda** (filtros)
- **Reportes**
- **Export CSV**

> Nota: La UI nueva usa el mismo “ID numérico” visible (por compatibilidad con el legacy), pero en Mongo se guarda también el `_id` real.

## Requisitos

- Node.js 18+
- Una base en MongoDB Atlas (connection string)

## Configurar MongoDB Atlas (backend)

En `server/`, crea un archivo `.env` (manual) con:

```env
MONGODB_URI=TU_CONNECTION_STRING_DE_ATLAS
JWT_SECRET=una_clave_segura
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

Referencia: `server/env.example`

## Correr backend (Express)

```bash
cd server
npm install
npm run dev
```

API health check: `GET /api/health`

## Configurar frontend (Next.js)

Opcional: crea `client/.env.local` (manual) si tu API no está en `http://localhost:5000`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Referencia: `client/env.example`

## Correr frontend (Next.js)

```bash
cd client
npm install
npm run dev
```

Abre `http://localhost:3000`

## Credenciales por defecto

- Usuario: `admin`
- Contraseña: `admin`

