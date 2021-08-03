# Get the Node alpine image as 1st stage of a multistage build
FROM node:lts-alpine as build-stage

# Phase 1: Build and start the backend

# Set the working directory
WORKDIR /usr/local/app/backend
# Copy package.json
COPY ./backend/package.json .
# Install the dependencies to the root (to avoid duplicated dependencies in frontend and backend)
COPY ./backend/yarn.lock .
# Install the dependencies to the root
RUN yarn install --modules-folder /usr/local/app/node_modules
# Copy the backend source code to the working directory
COPY ./backend .
# Build the backend
RUN /usr/local/app/node_modules/.bin/tsc

# Phase 2.1: Build the frontend

# Set the working directory
WORKDIR /usr/local/app/frontend
# Copy package.json
COPY ./frontend/package.json .
# Copy yarn.lock to pin the dependencies' versions
COPY ./frontend/yarn.lock .
# Install the dependencies to the root (to avoid duplicated dependencies in frontend and backend)
RUN yarn install --modules-folder /usr/local/app/node_modules
# Copy the frontend source code to the working directory
COPY ./frontend .
# Build the frontend
RUN /usr/local/app/node_modules/.bin/ng build --prod

# Phase 2.2: Serve the frontend with NGINX

# Get the NGINX alpine image as 2nd stage of a multistage build
FROM nginx:stable-alpine as prod-stage
# Copy the frontend build output to the NGINX static hosting directory
COPY --from=build-stage /usr/local/app/frontend/dist/ /usr/share/nginx/html
# Expose the NGINX port
EXPOSE 80

# Phase 3: Run the backend and NGINX (with daemon off, so it will run in the foreground and prevent the container from exiting)
CMD ["sh", "-c", "node /usr/local/app/backend && nginx -g daemon off;"]
