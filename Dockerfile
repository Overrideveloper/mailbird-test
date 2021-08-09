# Get the Node alpine image as the base image for the first stage of the multi-stage build
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
COPY Dockerfile README.md .gitignore .dockerignore nginx.conf /usr/src/app/

# Set NODE ENV to production
ENV NODE_ENV production

# Build the backend
RUN yarn --cwd /usr/src/app/backend run build
# Build the frontend
RUN yarn --cwd /usr/src/app/frontend run build:prod

# Remove the frontend and backend node_modules directories
# The frontend does not require its dependencies to be served
# Re-install only the backend prod dependencies
RUN rm -rf /usr/src/app/frontend/node_modules /usr/src/app/backend/node_modules && yarn --cwd /usr/src/app/backend install --prod

# Use a Node alpine image as a base image for the final stage of the multi-stage build
FROM node:lts-alpine@sha256:0c80f9449d2690eef49aad35eeb42ed9f9bbe2742cd4e9766a7be3a1aae2a310

# Install NGINX and concurrently
RUN apk update && apk add --no-cache nginx && yarn global add concurrently \
# Create non-root user
  && addgroup -S www && adduser -S www -G www \
# Make directories required by NGINX
  && mkdir -p /www \
# Make file required by NGINX
  && touch /www/nginx.pid \
# Set non-root user as owner of NGINX directories
  && chown -R www:www /www /var/lib/nginx \
# Set user permissions on NGINX directories
  && chmod -R 775 /www /var/lib/nginx

# Copy all the content from the first stage into the final stage
COPY --from=build /usr/src/app/ /usr/src/app/

# Copy NGINX configuration file to NGINX directory
COPY --from=build /usr/src/app/nginx.conf /www/nginx.conf
# Copy the bundled frontend files to the NGINX static root directory
COPY --from=build /usr/src/app/frontend/dist/ /www/html

# Switch to non-root user
USER www

# Expose the ports
EXPOSE 5000
EXPOSE 3000

# Run the backend server and NGINX server concurrently
CMD ["concurrently", "'node /usr/src/app/backend/dist/bin/www.js'", "'nginx -c '/www/nginx.conf''"]
