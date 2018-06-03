# Rest-Server

This repository is the root of the rest server, it provide a squeleton of a Rest server in Node using Swagger, Hapi, Mongoose, Typescript, JWT, MongoDB, inversifyJS. Fork it and make your change following the below instruction and rebase when there is a new version so you will get the update.

## Prerequisit

* Node
  * MacOs https://treehouse.github.io/installation-guides/mac/node-mac.html
  * Windows https://treehouse.github.io/installation-guides/windows/node-windows.html
* MongoDb
  * https://treehouse.github.io/installation-guides/mac/mongo-mac.html
  * https://treehouse.github.io/installation-guides/windows/mongo-windows.html

## Where to start

Fork and clone this repository, open a terminal in the created folder and run the folowing command

```bash
npm install
mkdir -p ./data/db/
```

Open 3 terminals, one for the compilation, one for the db, one for the server

* npm run watch
* npm run dev
* mongod --dbpath ./data/db/

### Other command

* "build": Full build of the application
* "watch": Watch change and redo a typescript compilation
* "load": Perfform a load testing
* "tsoa-all": Generate the swagger and the associated routes
* "swagger": Generate the swagger only
* "routes": Generate the routes only
* "start": run the build and start the app
* "dev": start the server in reload mode
* "debug": Start the file change watch and wait for a debugger to connect
* "lint": Lint the code

## Private project?

If your project is not open source you may need to add a private repository to push your content

```bash
git remote add store URL_OF_YOUR_REPO
```

## Dependencies documentation

* Swagger annotation [https://github.com/lukeautry/tsoa](Tsoa)
* ORM [http://mongoosejs.com/docs/guide.html](Mongoose)
* Server [https://hapijs.com/api](Hapi.js)

## What you get

### Logging service

### Database Service

## Config service

## Where to code

### Controllers

### Services

### Models

#### DAO

#### Interfaces

#### IO
