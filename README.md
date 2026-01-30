# Task Manager - React + Node.js/Express + MongoDB Atlas

Task management app migrated from a static (legacy) version to a full-stack architecture:

| Layer         | Technology              | Location    |
|---------------|--------------------------|-------------|
| **Frontend**  | React (Next.js)          | `client/`   |
| **Backend**   | Node.js + Express.js     | `server/`   |
| **Database**  | MongoDB Atlas            | URI in `.env` |

- **Legacy** (reference): `index.html` + `style.css` + `app.js` (no server, uses `localStorage`)
- **New app**: React in `client/` + Express in `server/` + MongoDB Atlas

## Project structure

```
legacyappdominguez/
├── client/                 # Frontend React (Next.js)
│   ├── src/app/            # Pages and layout
│   └── src/lib/api.js      # API client (login, fetch, export)
├── server/                  # Backend Node.js + Express
│   ├── src/
│   │   ├── index.js        # Entry point, DB connection and startup
│   │   ├── app.js          # Express, CORS, routes
│   │   ├── db.js           # MongoDB connection (MONGODB_URI)
│   │   ├── seed.js         # Initial data (users, projects)
│   │   ├── models/         # Mongoose: User, Task, Project, Comment, History, Notification
│   │   ├── routes/         # API: auth, users, projects, tasks, history, notifications, reports, export
│   │   └── middleware/     # authRequired (JWT)
│   └── .env                # MONGODB_URI, JWT_SECRET, PORT, CORS_ORIGIN (create from env.example)
├── index.html, app.js, style.css   # Legacy app (reference)
└── README.md
```

## Requirements

- Node.js 18+
- A MongoDB Atlas database (connection string)

## Configure MongoDB Atlas (backend)

1. Copy `server/env.example` to `server/.env`.
2. In `server/.env`, paste your MongoDB Atlas **Connection String** in `MONGODB_URI`:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=a_secure_secret
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

Without `MONGODB_URI` the server will not start; once you have the Atlas URI, just update that variable.

## Run backend (Express)

```bash
cd server
npm install
npm run dev
```

API health check: `GET /api/health`

## Configure frontend (Next.js)

Optional: create `client/.env.local` manually if your API is not at `http://localhost:5000`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Reference: `client/env.example`

## Run frontend (Next.js)

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:3000`

## Default credentials

- Username: `admin`
- Password: `admin`
