# Task Manager - React + Node.js/Express + MongoDB Atlas

App de gestión de tareas migrada desde la versión estática (legacy) a una arquitectura full-stack:

| Capa        | Tecnología              | Ubicación   |
|------------|--------------------------|-------------|
| **Frontend** | React (Next.js)         | `client/`   |
| **Backend**  | Node.js + Express.js   | `server/`   |
| **Base de datos** | MongoDB Atlas      | URI en `.env` |

- **Legacy** (referencia): `index.html` + `style.css` + `app.js` (sin servidor, usa `localStorage`)
- **Nueva app**: React en `client/` + Express en `server/` + MongoDB Atlas

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

## Estructura del proyecto

```
legacyappdominguez/
├── client/                 # Frontend React (Next.js)
│   ├── src/app/             # Páginas y layout
│   └── src/lib/api.js       # Cliente API (login, fetch, export)
├── server/                  # Backend Node.js + Express
│   ├── src/
│   │   ├── index.js        # Entrada, conexión DB y arranque
│   │   ├── app.js          # Express, CORS, rutas
│   │   ├── db.js           # Conexión MongoDB (MONGODB_URI)
│   │   ├── seed.js         # Datos iniciales (usuarios, proyectos)
│   │   ├── models/         # Mongoose: User, Task, Project, Comment, History, Notification
│   │   ├── routes/         # API: auth, users, projects, tasks, history, notifications, reports, export
│   │   └── middleware/     # authRequired (JWT)
│   └── .env                # MONGODB_URI, JWT_SECRET, PORT, CORS_ORIGIN (crear desde env.example)
├── index.html, app.js, style.css   # App legacy (referencia)
└── README.md
```

Cuando tengas el **URI de MongoDB Atlas**, créalo en [Atlas](https://cloud.mongodb.com), copia el connection string y pégalo en `server/.env` como `MONGODB_URI=...`.

## Requisitos

- Node.js 18+
- Una base en MongoDB Atlas (connection string)

## Configurar MongoDB Atlas (backend)

1. Copia `server/env.example` a `server/.env`.
2. En `server/.env` pega tu **Connection String** de MongoDB Atlas en `MONGODB_URI`:

```env
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster0.xxxxx.mongodb.net/nombredb?retryWrites=true&w=majority
JWT_SECRET=una_clave_segura
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

Sin `MONGODB_URI` el servidor no arranca; cuando tengas el URI de Atlas, solo actualiza esa variable.

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

