FROM node:8.16.1-alpine
ARG MODE
# install git
RUN apk add git
RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY package.json .
COPY docker-entrypoint.js .
RUN npm install --quiet
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait
EXPOSE 4000
CMD /wait && npm start