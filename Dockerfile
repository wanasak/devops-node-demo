# Use full Node 18 (Debian-based)
FROM node:18-alpine

# Set environment variables
ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PASSWORD=password

# Set working directory
WORKDIR /home/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]