# =========================
# FRONTEND BUILD STAGE
# =========================
FROM node:22 AS frontend-builder

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

WORKDIR /frontend

# Copy only package files for caching
COPY frontend/package.json frontend/yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy rest of frontend
COPY frontend/ .

# Build React app (output to /frontend/dist or /frontend/build)
RUN yarn build


# =========================
# BACKEND STAGE
# =========================
FROM python:3.12-slim AS backend

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
 && rm -rf /var/lib/apt/lists/*


COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY awivec ./awivec
COPY backend ./backend

RUN uv sync --all-groups
# Copy frontend build output into backend static files
COPY --from=frontend-builder /frontend/build ./frontend/build

# Expose port
EXPOSE 8000

# Default command
CMD ["uv", "run", "fastapi", "run", "backend/app/main.py", "--host", "0.0.0.0", "--port", "8000"]

