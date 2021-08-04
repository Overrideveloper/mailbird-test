FROM node:lts-alpine@sha256:0c80f9449d2690eef49aad35eeb42ed9f9bbe2742cd4e9766a7be3a1aae2a310 AS build

WORKDIR /usr/src/app

COPY backend/package.json backend/yarn.lock /usr/src/app/backend/
COPY frontend/package.json frontend/yarn.lock /usr/src/app/frontend/

RUN yarn --cwd /usr/src/app/backend install && yarn --cwd /usr/src/app/frontend install

COPY backend/ /usr/src/app/backend/
COPY frontend/ /usr/src/app/frontend/
COPY Dockerfile nginx.conf .gitignore .dockerignore /usr/src/app/

RUN yarn --cwd /usr/src/app/backend run build
RUN yarn --cwd /usr/src/app/frontend run build
RUN rm -rf /usr/src/app/frontend/node_modules

FROM node:lts-alpine@sha256:0c80f9449d2690eef49aad35eeb42ed9f9bbe2742cd4e9766a7be3a1aae2a310

WORKDIR .

RUN apk update && apk add --no-cache nginx && yarn global add concurrently

COPY --from=build /usr/src/app/ /usr/src/app/

RUN adduser -D -g 'www' www && mkdir /www && chown -R www:www /var/lib/nginx && chown -R www:www /www && chown -R www:www /usr/src/app/backend

COPY --from=build /usr/src/app/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/frontend/dist/ /www

EXPOSE 80
EXPOSE 3000

CMD ["concurrently", "'node /usr/src/app/backend/dist/bin/www.js'", "'nginx -g 'pid /tmp/nginx.pid; daemon off;''"]
