# Use the official Node.js image as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) into the container
COPY package*.json ./

# Install Expo CLI globally
RUN npm install -g expo-cli

# Install the app dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose port 8081 for Expo
EXPOSE 8081

# Start Expo development server
CMD ["npm", "start"]