# Stage 1: Build the frontend using node
FROM    node:18-alpine AS build

# Add a work directory
WORKDIR /usr/src/slhasher/frontend

# Cache and Install dependencies
COPY    package*.json ./
COPY    yarn.lock .
RUN     npm install

# Copy all files
COPY    . . 

# Build application
RUN     npm run build

# Stage 2: Serve the build files with Nginx
FROM    nginx:alpine

# Copy the build files from the previous stage
COPY    --from=build /usr/src/slhasher/frontend/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY    nginx.conf /etc/nginx/conf.d/default.conf

# Start Nginx
CMD     ["nginx", "-g", "daemon off;"]

# Expose port 80 to serve the frontend
EXPOSE  80