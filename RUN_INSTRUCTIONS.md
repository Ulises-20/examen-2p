# Run instructions - Congreso TICs

Frontend (React + Vite)

```powershell
# from repo root
yarn install
yarn dev
```

Backend (ASP.NET Core minimal API)

```powershell
cd backend
dotnet run --urls "http://localhost:5000"
```

Notes

- Vite dev server proxies `/api` to `http://localhost:5000` so the frontend can call the backend using relative `/api/...` paths.
- The project includes a basic PWA manifest and `sw.js`. For full PWA behavior, build for production and serve the `dist` folder.
