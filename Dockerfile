# Build stage for React Admin Panel
FROM node:20-alpine AS build
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm install
COPY apps/web/ ./
RUN npm run build

# Final stage for PocketBase
FROM alpine:latest
WORKDIR /app

# Install dependencies for PocketBase
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget

# Download and install PocketBase
# Using 0.23.0 as it seems to be the version the project is targeting (based on auth logic)
ENV PB_VERSION=0.23.0
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x pocketbase \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

# Copy built frontend to pb_public
COPY --from=build /app/dist ./pb_public

# Copy local pb_migrations if any
COPY apps/backend/pb_migrations ./pb_migrations

# Expose port
EXPOSE 8090

# Start PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/app/pb_data", "--publicDir=/app/pb_public"]
