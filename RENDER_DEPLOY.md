# Deploying examen-2p to Render

This repository contains two distinct parts:

- frontend/: Vite + React app (root of repo). Built artifacts are produced to `dist/`.
- backend/: FastAPI Python app (SQLite). The Python app entrypoint is `backend/app.py` and dependencies are in `backend/requirements.txt`.

This document explains two recommended Render setups: (A) Docker-based backend (recommended) and (B) non-Docker backend, plus the separate frontend static site.

---

## A) Backend as Docker service (recommended)

1. In Render, create a new Web Service.
2. Select GitHub repo: `Ulises-20/examen-2p`, branch `main`.
3. Choose Environment: Docker (Render will build using the Dockerfile in the repo).
4. Set the "Root Directory" to `backend` (so Render looks there). Alternatively, keep root and set Dockerfile path to `backend/Dockerfile`.
5. Leave Build Command and Start Command empty (Render runs Docker build automatically).
6. Set Environment Variables in Render (optional but recommended):

- `PYTHONUNBUFFERED=1`
- `FRONTEND_URL` = `https://<your-frontend-domain>` (use this later to restrict CORS if desired)

7. Health check: `/api/listado`
8. After deploy, Render will provide a public URL like `https://congreso-tics-backend.onrender.com`.

Notes:

- The Dockerfile builds a Python image with the FastAPI app and runs it using Uvicorn. Render provides a runtime environment variable `$PORT` and the Dockerfile/entrypoint uses it to instruct uvicorn which port to bind.

## B) Backend as Render Web Service (no Docker)

If you prefer not to use Docker, use these settings:

- Service Type: Web Service
- Root Directory: `backend`
- Build Command:
  ```bash
  dotnet restore
  dotnet publish -c Release -o publish
  ```
- Start Command:
  ```bash
  ASPNETCORE_URLS="http://0.0.0.0:$PORT" dotnet publish/ExamenApi.dll
  ```
- Environment variables: `DOTNET_ENVIRONMENT=Production` and optionally `FRONTEND_URL`.

Make sure the Start Command points to the correct DLL name; this project produces `ExamenApi.dll` into the `publish/` folder.

## C) Frontend as Static Site (Render Static Site)

1. Create a new Static Site on Render.
2. Select the same GitHub repo and branch `main`.
3. Root Directory: leave empty (project root) unless you use a monorepo layout.
4. Build Command:

```bash
yarn --frozen-lockfile install && yarn build
```

5. Publish Directory: `dist`
6. Set Environment Variables for the frontend:
   - `VITE_API_BASE_URL` = `https://<your-backend-domain>/api`
     (After backend deployment, set this to the backend URL Render provided.)
7. Deploy. After the build, Render will serve static files from `dist/`.

## D) CORS and environment configuration

- The backend currently allows any origin for CORS (for development). For production, restrict to your frontend domain by adding an environment variable `FRONTEND_URL` and read it in `Program.cs` to apply a stricter CORS policy.

## E) SQLite caveats

- SQLite is file-based. On Render, the container filesystem may not be persisted across deploys or scaled instances. For demos it's OK, but for production you should migrate to a managed DB (Postgres) and update EF Core provider to Npgsql.

## F) Example Render form values (quick copy)

Backend (Docker):

- Name: congreso-tics-backend
- Branch: main
- Region: Oregon (US West)
- Root Directory: backend
- Environment: Docker
- (No build/start commands needed)
- Env vars: DOTNET_ENVIRONMENT=Production, FRONTEND_URL=https://<your-front>.onrender.com

Frontend (Static Site):

- Name: congreso-tics-frontend
- Branch: main
- Build command: yarn --frozen-lockfile install && yarn build
- Publish directory: dist
- Env vars: VITE_API_BASE_URL=https://congreso-tics-backend.onrender.com/api

## G) Next steps I can help with

- Add a small `backend/start.sh` and `Procfile` if you prefer non-Docker deployments.
- Implement `FRONTEND_URL`-based CORS in `Program.cs` and document the variable in Render.
- Create a `docker-compose.yml` for local testing (frontend + backend).
- Migrate EF Core to Postgres and add migrations.

If you want, I will now:

- (1) commit the `backend/Dockerfile` (done),
- (2) add a `backend/start.sh` and adjust `Program.cs` to optionally read `FRONTEND_URL` and use it for CORS.

Tell me which of the optional follow-ups you'd like me to implement next.
