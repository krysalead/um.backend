FROM node:8.16.1-alpine
ARG MODE
# install git
RUN apk add git
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
COPY docker-entrypoint.js .
RUN npm install --quiet
COPY . .
EXPOSE 4000
CMD [ "npm", "start"]