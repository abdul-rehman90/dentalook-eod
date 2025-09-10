FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Copy service-entry.sh and make it executable
COPY service-entry.sh /app/service-entry.sh
RUN chmod +x /app/service-entry.sh


ENV PORT=3000

EXPOSE 3000

# Run the app through entry script
ENTRYPOINT ["sh", "/app/service-entry.sh"]
