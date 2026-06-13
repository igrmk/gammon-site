FROM node:22.5.1-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim
WORKDIR /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist/ .

WORKDIR /app/backend
COPY backend/pyproject.toml backend/uv.lock backend/.python-version ./
RUN uv sync --frozen --no-dev

COPY backend/main.py .

ENV PYTHONUNBUFFERED=1
ENV PATH="/app/backend/.venv/bin:$PATH"
EXPOSE 8080
ENTRYPOINT ["python", "main.py"]
