# Deployment Guide

## Deployment Options

You can deploy Safe Portal IN in two ways:
- **Option A (Recommended): Fullstack on Vercel** — Deploys both React Vite frontend and Express serverless backend together on a single Vercel domain with zero CORS complications.
- **Option B: Frontend on Vercel / GitHub Pages + Backend on Render** — Deploys backend as a separate long-running container service.

---

## Option A: Fullstack on Vercel (Recommended)

### 1. MongoDB Atlas Setup (Required)
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere, required for serverless functions).
3. Under **Database Access**, create a user with read/write privileges.
4. Copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/safe-portal-in?retryWrites=true&w=majority`

### 2. Import Repository into Vercel
1. Sign in at [vercel.com](https://vercel.com) and click **Add New... → Project**.
2. Connect your GitHub repository `Anishsingh1907/safe-portal-in`.
3. **Important Settings**:
   - **Root Directory**: Leave as `.` (the project root, do NOT change to `frontend` so Vercel can deploy both folders).
   - **Framework Preset**: Vite (detected automatically).
   - **Build Command**: `npm run build --prefix frontend` (set automatically via `vercel.json`).
   - **Output Directory**: `frontend/dist` (set automatically via `vercel.json`).

### 3. Add Environment Variables in Vercel
In the Vercel project configuration (under **Environment Variables**), add:

| Name | Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | `your_super_secret_random_key_here` | Long random string (32+ chars) |
| `CLIENT_URL` | `https://your-project.vercel.app` | (Optional) Your production URL. All `.vercel.app` domains are allowed automatically. |
| `VITE_API_BASE_URL` | *(leave empty)* | (Optional) Defaults automatically to `/api` so requests stay on the same domain with no CORS issues. |

4. Click **Deploy**.
5. Once deployed, test your API health:
   `https://<your-vercel-domain>.vercel.app/api/health`
   It will return `{"status": "ok", "database": "connected"}`.

### 4. Seeding Initial Database Data
To populate demo destinations, services, and advisories in your MongoDB Atlas database:
From your local machine with `MONGODB_URI` set in `backend/.env`:
```bash
npm run seed
```

---

## Option B: Frontend on Vercel + Backend on Render

If you prefer keeping the backend on Render as a dedicated server:

### 1. Backend on Render
1. Sign in at [render.com](https://render.com) and apply `render.yaml` or create a Web Service pointing to the `backend` folder.
2. Set Environment Variables:
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = `https://<your-frontend>.vercel.app`
3. After deployment, your backend URL will be `https://<your-service>.onrender.com`.

### 2. Frontend on Vercel
1. In Vercel Project Settings → **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://<your-service>.onrender.com/api`
2. Trigger a redeployment so Vite compiles with the Render API URL.

---

## Local Development

```bash
# Install all dependencies (root, backend, and frontend)
npm install

# Run backend (http://localhost:5000)
npm run dev:backend

# Run frontend (http://localhost:5173 - automatically proxies /api to backend)
npm run dev:frontend
```
