# Stage 1: Build React frontend
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
COPY knowledge/ /app/knowledge/
COPY scripts/generate_knowledge_manifest.py /app/scripts/
RUN apk add --no-cache python3 rsync && \
    rm -rf public/knowledge && \
    mkdir -p public/knowledge && \
    rsync -a --delete \
      --exclude='*.md' \
      --exclude='_index.json' \
      --exclude='**/TEMPLATE.json' \
      /app/knowledge/ public/knowledge/ && \
    python3 /app/scripts/generate_knowledge_manifest.py
RUN npx vite build

# Stage 2: Python agent + nginx serving the React build
FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends nginx && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY knowledge/ ./knowledge/
COPY main.py .
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh .
RUN chmod +x start.sh

# Copy React build output to nginx web root
COPY --from=frontend-builder /app/frontend/dist /var/www/html

EXPOSE 8080
CMD ["./start.sh"]
