# Dockerfile for the Python FastAPI backend
FROM python:3.11-slim AS build
WORKDIR /app

# Install build deps
RUN apt-get update && apt-get install -y build-essential gcc libpq-dev --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . /app

ENV PYTHONUNBUFFERED=1

# Expose port and start with uvicorn; Render sets $PORT
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]
