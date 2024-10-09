# Base image
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy all project files
COPY . .

# Expose port
EXPOSE 3000

# Run the app
CMD ["yarn", "start"]
