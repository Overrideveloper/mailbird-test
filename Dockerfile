# Get the Node alpine image as the base image for the build stage of the multi-stage build
FROM node:lts-alpine@sha256:0c80f9449d2690eef49aad35eeb42ed9f9bbe2742cd4e9766a7be3a1aae2a310 AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy the backend package.json and yarn.lock files
COPY backend/package.json backend/yarn.lock /usr/src/app/backend/
# Copy the frontend package.json and yarn.lock files
COPY frontend/package.json frontend/yarn.lock /usr/src/app/frontend/

# Install the all the backend and frontend dependencies
RUN yarn --cwd /usr/src/app/backend install && yarn --cwd /usr/src/app/frontend install

# Copy the rest of the backend files into its directory
COPY backend/ /usr/src/app/backend/
# Copy the rest of the frontend files into its directory
COPY frontend/ /usr/src/app/frontend/
# Copy the rest of the project files into the root of the working directory
COPY Dockerfile README.md .gitignore .dockerignore /usr/src/app/

# Build the backend code
RUN yarn --cwd /usr/src/app/backend run build
# Build the frontend code
RUN yarn --cwd /usr/src/app/frontend run build

# Remove the frontend and backend node_modules directories
# The frontend does not require its dependencies to be served
# Re-install only the backend prod dependencies
RUN rm -rf /usr/src/app/frontend/node_modules /usr/src/app/backend/node_modules && yarn --cwd /usr/src/app/backend install --prod

# Use the Node alpine image as the base image for the final stage of the multi-stage build
FROM node:lts-alpine@sha256:0c80f9449d2690eef49aad35eeb42ed9f9bbe2742cd4e9766a7be3a1aae2a310

# Set the working directory
WORKDIR .

# Install NGINX and concurrently
RUN apk update && apk add --no-cache nginx && yarn global add concurrently

# Copy all the content from the first stage into the final stage
COPY --from=build /usr/src/app/ /usr/src/app/

# Add a non-root user and group
# Set the ownership of the NGINX config, NGINX static root directory and backend directory to the non-root user
RUN adduser -D -g 'www' www && mkdir /www && chown -R www:www /var/lib/nginx && chown -R www:www /www && chown -R www:www /usr/src/app/backend

# Copy the NGINX config file to the NGINX config directory 
COPY --from=build /usr/src/app/frontend/nginx.conf /etc/nginx/nginx.conf
# Copy the bundled frontend files to the NGINX static root directory
COPY --from=build /usr/src/app/frontend/dist/ /www

# Expose the NGINX port
EXPOSE 80
# Expose the backend port
EXPOSE 3000

# Run the backend server and NGINX server concurrently
CMD ["concurrently", "'node /usr/src/app/backend/dist/bin/www.js'", "'nginx -g 'pid /tmp/nginx.pid; daemon off;''"]
