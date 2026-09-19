# ==========================================
# STAGE 1: Build React Frontend (Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Build Spring Boot Backend
# ==========================================
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw

# Resolve dependencies for caching
RUN ./mvnw dependency:go-offline -B || true

COPY src src
RUN ./mvnw clean package -DskipTests

# ==========================================
# STAGE 3: Production Runtime (Nginx + JRE 17)
# ==========================================
FROM eclipse-temurin:17-jre-alpine

# Install Nginx and gettext (provides envsubst)
RUN apk add --no-cache nginx gettext sed

WORKDIR /app

# Copy static frontend build to Nginx directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy Spring Boot application JAR
COPY --from=backend-builder /app/target/*.jar /app/app.jar

# Copy Nginx template and startup script
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /app/start.sh

# Sanitize line endings for Linux and grant execution permissions
RUN sed -i 's/\r$//' /app/start.sh && \
    chmod +x /app/start.sh && \
    rm -f /etc/nginx/conf.d/default.conf

# Render binds dynamically to $PORT at runtime
EXPOSE 80

ENTRYPOINT ["/app/start.sh"]
