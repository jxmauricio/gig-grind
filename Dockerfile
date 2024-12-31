
#
FROM node:23-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies 
RUN npm install 

# Copy the rest of the application code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose the port that Next.js runs on
EXPOSE 3000

# Start the Next.js application in production mode
CMD ["npm", "run", "start"]