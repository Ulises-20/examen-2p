## Root-level Dockerfile - builds and runs the backend located in ./backend
# This is a convenience fallback in case Render was configured to look for a Dockerfile
# at the repository root. It performs the same multi-stage build as backend/Dockerfile.

# Build stage
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential gcc --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app

EXPOSE 8000
ENV PYTHONUNBUFFERED=1
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]
# desde la raíz del repo (usa backend/Dockerfile)
docker build -t examen-backend -f backend/Dockerfile .# desde la raíz del repo (usa backend/Dockerfile)
docker build -t examen-backend -f backend/Dockerfile .