import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker

# Support two import modes:
# - When running from the repo root (python -m uvicorn backend.app:app) the
#   package name is `backend` and we can import `backend.models`.
# - When Render's service root is set to the `backend` folder, the working
#   directory is already `backend` and importing `backend.models` will fail.
#   In that case import the local `models` module directly.
try:
    from backend.models import Base, Participant
except Exception:
    from models import Base, Participant
from pydantic import BaseModel

DB_PATH = os.path.join(os.path.dirname(__file__), 'examen.db')
# Default to local sqlite file for development; allow overriding with DATABASE_URL env var
DEFAULT_DATABASE_URL = f'sqlite:///{DB_PATH}'
DATABASE_URL = os.environ.get('DATABASE_URL', DEFAULT_DATABASE_URL)

# Create engine with sqlite-specific connect_args when using sqlite, otherwise
# create a regular engine (for MySQL/Postgres on Render).
# Normalize DATABASE_URL for psycopg v3 compatibility:
# - If the user provided a URL that uses the psycopg2 driver (postgresql+psycopg2://)
#   convert it to the psycopg v3 driver name (postgresql+psycopg://) so SQLAlchemy
#   imports the correct DBAPI when using `psycopg` (v3).
if DATABASE_URL and 'psycopg2' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('psycopg2', 'psycopg')

if DATABASE_URL.startswith('sqlite'):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # For MySQL use a resilient engine configuration
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title='Examen API - Python')

# CORS
FRONTEND_URL = os.environ.get('FRONTEND_URL')
if FRONTEND_URL:
    origins = [FRONTEND_URL]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ParticipantIn(BaseModel):
    nombre: str
    apellidos: str
    email: str
    twitter: str
    ocupacion: str
    avatar: str | None = ''
    acepto: bool = True


def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(Participant).count()
        if count == 0:
            p1 = Participant(Nombre='Carlos', Apellidos='Perez', Email='carlos.perez@example.com', Twitter='carlosp', Ocupacion='Estudiante', Avatar='https://i.pravatar.cc/150?img=3', Acepto=True)
            p2 = Participant(Nombre='Ana', Apellidos='Lopez', Email='ana.lopez@example.com', Twitter='analo', Ocupacion='Docente', Avatar='https://i.pravatar.cc/150?img=5', Acepto=True)
            db.add_all([p1, p2])
            db.commit()
    finally:
        db.close()


@app.on_event('startup')
def on_startup():
    # Log DB url for debugging (but avoid printing credentials in logs)
    safe_db = DATABASE_URL
    try:
        if '://' in safe_db and '@' in safe_db:
            # hide password
            parts = safe_db.split('@')
            safe_db = parts[0].split('//')[0] + '//****@' + parts[1]
    except Exception:
        pass
    print(f"Using DATABASE_URL={safe_db}")
    seed_db()


def to_dict(p: Participant):
    return {
        'id': p.Id,
        'nombre': p.Nombre,
        'apellidos': p.Apellidos,
        'email': p.Email,
        'twitter': p.Twitter,
        'ocupacion': p.Ocupacion,
        'avatar': p.Avatar,
        'acepto': p.Acepto,
    }


@app.get('/api/listado')
def listado(q: str | None = None):
    db = SessionLocal()
    try:
        if not q:
            rows = db.query(Participant).all()
        else:
            # SQLite doesn't provide a `concat` function. Use SQLAlchemy's string
            # concatenation (which emits the appropriate || operator for SQLite)
            # and compare the lower-cased result against a lower-cased pattern.
            pattern = f"%{q.lower()}%"
            full_name_lower = func.lower(Participant.Nombre + ' ' + Participant.Apellidos)
            rows = db.query(Participant).filter(full_name_lower.like(pattern)).all()
        return [to_dict(r) for r in rows]
    finally:
        db.close()


@app.get('/api/participante/{id}')
def get_participante(id: int):
    db = SessionLocal()
    try:
        p = db.get(Participant, id)
        if not p:
            raise HTTPException(status_code=404, detail='Not found')
        return to_dict(p)
    finally:
        db.close()


@app.post('/api/registro', status_code=201)
def registro(item: ParticipantIn, request: Request):
    db = SessionLocal()
    try:
        p = Participant(
            Nombre=item.nombre,
            Apellidos=item.apellidos,
            Email=item.email,
            Twitter=item.twitter,
            Ocupacion=item.ocupacion,
            Avatar=item.avatar or '',
            Acepto=bool(item.acepto),
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        return to_dict(p)
    finally:
        db.close()


@app.put('/api/participante/{id}')
def update_participante(id: int, item: ParticipantIn):
    db = SessionLocal()
    try:
        p = db.get(Participant, id)
        if not p:
            raise HTTPException(status_code=404, detail='Not found')
        p.Nombre = item.nombre
        p.Apellidos = item.apellidos
        p.Email = item.email
        p.Twitter = item.twitter
        p.Ocupacion = item.ocupacion
        p.Avatar = item.avatar or ''
        p.Acepto = bool(item.acepto)
        db.commit()
        return to_dict(p)
    finally:
        db.close()
