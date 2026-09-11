# Deployment Guide

## Live URLs (after setup)

| Service | URL |
|---|---|
| Frontend (GitHub Pages) | https://anishsingh1907.github.io/safe-portal-in/ |
| Backend (Render) | https://safe-portal-in-api.onrender.com |
| GitHub Repo | https://github.com/Anishsingh1907/safe-portal-in |

## 1. Frontend — GitHub Pages (automatic)

Pushes to `main` trigger `.github/workflows/deploy-frontend.yml`, which builds the Vite app and publishes to GitHub Pages.

**One-time setup:** In your repo on GitHub go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

## 2. Backend — Render + MongoDB Atlas

The API needs a cloud MongoDB database and a Node host.

### MongoDB Atlas (free)

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow network access (`0.0.0.0/0` for demo).
3. Copy the connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/safe-portal-in`.

### Render (free tier)

1. Sign in at [render.com](https://render.com) with GitHub.
2. **New → Blueprint** → connect `Anishsingh1907/safe-portal-in` → apply `render.yaml`.
3. Set environment variables when prompted:
   - `MONGODB_URI` — your Atlas connection string
   - `CLIENT_URL` — `https://anishsingh1907.github.io/safe-portal-in`
4. After deploy, run the seed once (Render shell): `npm run seed`

### Wire frontend to backend

In GitHub repo **Settings → Secrets and variables → Actions → Variables**, add:

- `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com/api`

Then re-run the deploy workflow or push a commit.

## 3. Alternative: Vercel (frontend)

Import the repo at [vercel.com](https://vercel.com), set **Root Directory** to `frontend`, and add `VITE_API_BASE_URL` in Environment Variables.
