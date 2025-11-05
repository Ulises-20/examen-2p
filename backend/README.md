# Backend - Examen API

Proyecto ASP.NET Core minimal API que expone los endpoints requeridos por la aplicación del Congreso TICs.

Endpoints:

- GET /api/listado
- GET /api/listado?q=:query
- GET /api/participante/{id}
- POST /api/registro

Cómo ejecutar (PowerShell):

```powershell
cd backend
dotnet run --urls "http://localhost:5000"
```

El servicio usará un store en memoria con algunos participantes de ejemplo.

## SQLite persistence

Este backend ahora usa EF Core con SQLite y crea un archivo de base de datos local `examen.db` dentro de la carpeta `backend`.

Notas:

- No es necesario instalar un servidor de base de datos externo.
- El proyecto crea la base y la tabla automáticamente en el primer arranque (db.Database.EnsureCreated()).

Si quieres resetear la base, borra `backend\examen.db` y reinicia la aplicación.
