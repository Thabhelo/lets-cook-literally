FROM python:3.11-slim

# Install uv for fast dependency installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy the pyproject file
COPY backend/pyproject.toml backend/pyproject.toml

# Install dependencies into the system site-packages
RUN uv pip install --system -r backend/pyproject.toml

# Copy the rest of the application
COPY . .

# Expose port (Cloud Run defaults to 8080 or respects PORT env var)
EXPOSE 8080

# Start uvicorn from the backend folder
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
