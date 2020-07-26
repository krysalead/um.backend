FROM node:8.16.1-alpine
ARG MODE
# install git
RUN apk add git
RUN mkdir -p /usr/app/tools/sqlite/
WORKDIR /usr/app
COPY package.json .
COPY docker-entrypoint.js .
COPY tsconfig.json .
COPY index.js .
COPY scripts .
RUN npm install --quiet
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait
RUN wget https://sqlite.org/2020/sqlite-tools-linux-x86-3320300.zip -O /usr/app/tools/sqlite/sqlite3.zip
RUN unzip tools/sqlite/sqlite3.zip
# not working, says sh: /usr/app/sqlite-tools-linux-x86-3320300/sqlite3: not found
ENV SQLITE=/usr/app/sqlite-tools-linux-x86-3320300/sqlite3
EXPOSE 4000
CMD /wait && npm test && npm run tsc && npm start