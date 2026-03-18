FROM node:18-alpine

WORKDIR /app

# Copy everything from frontend
COPY frontend/ .

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
