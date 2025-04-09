FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]
