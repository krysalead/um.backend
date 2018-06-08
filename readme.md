# Rest-Server

This repository is the root of the rest server, it provide a squeleton of a Rest server in Node using Swagger, Hapi, Mongoose, Typescript, JWT, MongoDB, inversifyJS. Fork it and make your change following the below instruction and rebase when there is a new version so you will get the update.

## Prerequisit

- Node
  - MacOs https://treehouse.github.io/installation-guides/mac/node-mac.html
  - Windows https://treehouse.github.io/installation-guides/windows/node-windows.html
- MongoDb
  - https://treehouse.github.io/installation-guides/mac/mongo-mac.html
  - https://treehouse.github.io/installation-guides/windows/mongo-windows.html

## Where to start

Fork and clone this repository, open a terminal in the created folder and run the folowing command

```bash
npm install
mkdir -p ./data/db/
```

Open 3 terminals, one for the compilation, one for the db, one for the server

- npm run watch
- npm run dev
- mongod --dbpath ./data/db/

### Other command

- "build": Full build of the application
- "load": Perfform a load testing
- "tsoa-all": Generate the swagger and the associated routes
- "swagger": Generate the swagger only
- "routes": Generate the routes only
- "start": run the build and start the app
- "debug": Start the file change watch and wait for a debugger to connect
- "lint": Lint the code

## Private project?

If your project is not open source you may need to add a private repository to push your content

```bash
git remote add store URL_OF_YOUR_REPO
```

## Dependencies documentation

- Swagger annotation [https://github.com/lukeautry/tsoa](Tsoa)
- ORM [http://mongoosejs.com/docs/guide.html](Mongoose)
- Server [https://hapijs.com/api/16.6.3](Hapi.js)

## What you get

### Logging service

The way to log in your code is this one, behind the scene we use the [https://github.com/mreuvers/typescript-logging](typescript-logging) library

```Typescript
import { factory } from './LoggingService';

const logger = factory.getLogger('services.DatabaseService');
```

There is already setup 2 kind of category **services** and **controllers**, prefix your logger with one of this keyword and you will be able to change logging options for a specific level

### Database Service

So far we support only MongoDb, this service will start a connection to the database, see the DAO section to understand what you still need to do.

## Config service

Config service will give access to a JSON that hold your config, it can be find in src/config/production.ts. So how to enhance the configuration

- open interfaces/config.ts
- add your configuration sturcture as you like
- open the production.ts
- add your default value and use an en variable to get something from the server, never leave production information in this file.

## Where to code

It will be like a tutorial step by step what to do. From this point you can do as you wish, I follow my way of coding which can be different for everyone. So we start from the deeper in the code to the higher level.

### Models

Here we are defining which object our services will manipulate and exchange.

- create a file called Pizza.ts

```
export interface Pizza {
  name: string;
  topings: Ingredient[];
}

interface Ingredient{
  name: string;
  price: number;
  veganFriendly: boolean;
}
```

### DAO

This is where you will access your database. Each file should define a single document in the database

- first step, add the dependencies, mongoose and traceable which will add createdAt and updatedAt

```
import { Schema, Document, model } from 'mongoose';
import { Traceable,makeTraceable } from '../core/interfaces/Traceable';
```

- second step, define your object in TypeScript way, to be manipulated by the service, it must reflect the database object

```
interface DAOModelPizza {
  // references --------------------------------------------------------------

  // properties --------------------------------------------------------------
  name: string;
  topings: string[];
  price: number;
  vegan: boolean
}
```

- third step, define the mongoose schema, it is not nice but the only way I found so far

```
const schemaPizza = makeTraceable({
  // references --------------------------------------------------------------

  // properties --------------------------------------------------------------
  name: string;
  topings: string[];
  price: number;
  vegan: boolean
})
```

- fourth step, expose an instance

```
interface DAODocumentPizza
  extends DAOModelPizza,
    Traceable,
    Document {}

    // tslint:disable-next-line:variable-name
export const DAOPizza = model<DAODocumentPizza>(
  'Pizza',
  new Schema(schemaPizza)
);
```

### Interfaces

This is optional, depending if you like working with interfaces or not.

### Services

Right after implementing your DAO we will start implementing our services. A service should be something manipulating object and calling DAO for persistency. So we need to make then business oriented and atomic as much as possible so we can combined them later.

- In interfaces folder create a file called Types.ts, it will hold all the services name we expose in our app

```
export const TYPES = {
  OrderService: 'OrderService'
};
```

- In services folder create a file called OrderService.ts

```
import { factory } from '../core/services/LoggingService';
import { TYPES } from '../interfaces/types';
import { provideSingleton } from '../ioc';

const logger = factory.getLogger('service.Pizza');

@provideSingleton(TYPES.OrderService)
export class OrderService {
  /*Place an order in database and return the price*/
  public async order(pizza:Pizza[]): Promise<number> {
    throw new Error('Method not implemented.');
  }
}
```

Make a reference (import) to this class into the ./iocRegistration.ts

### IO

This folder gather all the interfaces of object that will be exchanged with the UI. It extends the IServiceStatus which will expose a status and a message (status 0 means no issue)

```
import Pizza from '../models/Pizza'
import { IServiceStatus } from '../core/interfaces/services';

export interface OrderRequest  {
  pizzas:Pizza[];
}

export interface OrderResponse extends IServiceStatus {
  data: number;
}
```

I used data has a data holder but you can use any name you want.

### Controllers

This folder is the frontline of your application, receiving the request from the UI. It will also expose and API via annotation and swagger.

```
import { factory } from '../core/services/LoggingService';
import {
  OrderRequest,
  OrderResponse
} from '../io/Order';
import { SwimController } from '../core/controllers/SwimController';

const logger = factory.getLogger('controller.Order');

@Route('order')
@provide(PizzaController)
export class InvitationController extends SwimController {
  constructor(
    @inject(TYPES.OrderService)
    private orderService: OrderService
  ) {
    super(logger);
  }

  @Post('order')
  @Example<OrderResponse>({
    status: 0,
    message: ''
  })
  public async orderPizza(
    @Body() request: OrderRequest
  ): Promise<OrderResponse> {
    logger.info('Start orderPizza');
    let status = null;
    try {
      status = await this.orderService.order(request.pizzas);
    } catch (e) {
      status = this.generateServiceFailureStatus(e);
    }
    logger.info('End orderPizza');
    return status;
  }
```

Make a reference (import) to this class into the ./iocRegistration.ts

## Client

This library doesn't aim to explain how to generate a client, there is many technology and way of doing it. I strongly recommend to use generators [https://github.com/OpenAPITools/openapi-generator](swagger codegen / OpenAPI Generator). You can always test with [https://www.getpostman.com/](Postman)
