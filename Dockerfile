# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python agent + nginx serving the React build
FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends nginx && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY knowledge/faq.json ./knowledge/faq.json
COPY main.py .
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh .
RUN chmod +x start.sh

# Copy React build output to nginx web root
COPY --from=frontend-builder /app/frontend/dist /var/www/html

EXPOSE 8080
CMD ["./start.sh"]
