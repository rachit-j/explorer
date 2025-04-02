# Use the official Node.js image as a base
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application files into the container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Push Prisma schema to the database (create missing tables)
RUN npx prisma db push

# Build the Next.js application
RUN npm run build

# Expose port 3000 (default for Next.js)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
