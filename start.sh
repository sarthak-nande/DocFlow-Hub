#!/bin/sh
set -e

# Default PORT if not provided by environment (Render sets PORT dynamically)
export PORT=${PORT:-80}
export SERVER_PORT=${SERVER_PORT:-8080}

echo "Starting DocFlow-Hub..."
echo "Render PORT: $PORT"
echo "Spring Boot SERVER_PORT: $SERVER_PORT"

# Process Nginx configuration template with environment variables
envsubst '$PORT' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Ensure uploads directory exists
mkdir -p /app/uploads/docflow-files

# Start Spring Boot backend in background
java -jar /app/app.jar &

# Start Nginx web server in foreground
echo "Starting Nginx reverse proxy on port $PORT..."
nginx -g 'daemon off;'
