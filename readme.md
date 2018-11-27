# Swim-Server

> Don't drawn, just swim

Swim server is a rest server made easy and clean, it provides a skeleton of a REST server in Node using Swagger, Hapi, Mongoose, Typescript, JWT, MongoDB, inversifyJS. It is highly customizable and flexible. Fork it and make your changes following the below instructions and rebase when there is a new version so you will get the updates.
You can change it as you want and if you wish share what you did with others with a pull-request.

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
- mongod --dbpath ./data/db/
- npm run dev

### Other command

- "build": Full build of the application
- "load": Perfform a load testing
- "tsoa-all": Generate the swagger and the associated routes
- "swagger": Generate the swagger only
- "routes": Generate the routes to handle requests only
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
- Database Mock [https://github.com/Mockgoose/Mockgoose](Mockgoose)
- IOC [https://github.com/inversify/InversifyJS](InversifyJs)

## What you get

### Logging service

The way to logging in your code is this one, behind the scene we use the [https://github.com/mreuvers/typescript-logging](typescript-logging) library

```Typescript
import { factory } from './LoggingService';

const logger = factory.getLogger('services.DatabaseService');
```

There is already setup 2 kinds of category **service** and **controller**, prefix your logger with one of this keyword and you will be able to change logging options for a specific level. (ie. service.Database or controller.Auth)

When there is an incoming request we attached an id with a unique id which will be displayed in each log for tracability.

### Database Service

So far we support only MongoDb, this service will start a connection to the database, see the DAO section to understand what you still need to do.
You can mock the database using mockgoose just switching mockDb to true in the configuration.

There is a Continus-local-storage in place in each request

```
import {set,get} from '../core/services/CLSService'

set('user',currentUser);
...
let currentUser = get('user');
```

## Config service

Config service will give access to a JSON that hold your config, it can be find in src/config/production.ts. So how to enhance the configuration

- open interfaces/config.ts
- add your configuration sturcture as you like
- open the production.ts
- add your default value and use a env variable to get something real value for each server, never leave production information in this file.

Switching the configuration is simple as setting ENV environement variable

```
ENV=test npm run dev
```

Will start the dev environement using the test configuration

## Where to code

It will be like a tutorial step by step what to do. From this point you can do as you wish, I follow my way of coding which can be different for everyone. So we start from the deeper in the code to the higher level.

### Models

Here we are defining which object our services will manipulate and exchange.

- create a file called Pizza.ts

```TypeScript
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

```TypeScript
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

```TypeScript
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

```TypeScript
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

```TypeScript
import { factory } from '../core/services/LoggingService';
import { TYPES } from '../interfaces/types';
import { provideSingleton } from '../ioc';

const logger = factory.getLogger('service.Pizza');

@provideSingleton(TYPES.OrderService)
export class OrderService {
  /*Place an order in database and return the price*/
  public async order(pizza:Pizza[]): Promise<number> {
    throw Boom.badRequest('Not implemented yet');
  }
}
```

Make a reference (import) to this class into the ./iocRegistration.ts

In order to manage errors you can use [https://github.com/hapijs/boom#overview](boom),

### IO

This folder gather all the interfaces of object that will be exchanged with the UI. It extends the IServiceStatus which will expose a status and a message (status 0 means no issue)

```TypeScript
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

```TypeScript
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

## Authentication

This server comes with the normal login/password validation. Then it uses the JWT approach for the rest of the calls

To generate a strong secret please run this command and use the output as secret.

```
node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
```

Put is in the configuration file under

```
auth: {
    JWTSecret:...
}
```

You will need to provide an implementation of IAppUserService to the IOC so that you will be able to hook on all the calls done by the authentication service

They mainly allow to do some additional calls to database or Middleware

- beforeLogin(userAuth: UserAuth): Promise<any>;
- afterLogin(userAuth: UserAuth): Promise<any>;
- beforeRegister(userAuth: UserAuth): Promise<any>;
- afterRegister(userAuth: UserAuth): Promise<any>;
  This one is special it will return what you expect to encode in the token but it will be wrapped with other information
- getTokenPayload(userAuth: UserAuth): Promise<any>;

## Client

This library doesn't aim to explain how to generate a client, there is many technology and way of doing it. I strongly recommend to use generators [https://github.com/OpenAPITools/openapi-generator](swagger codegen / OpenAPI Generator). You can always test with [https://www.getpostman.com/](Postman)

## Unit testing

Obviously you can write unit test and it is highly recommended. So each test will have the same name as the service/controller you want to test (It is just a convention nothing mandatory). It should contains the ~~spec~~ keyword to be run by the runner. We use mocha and chai to do unit tests, they are pre-installed once you do the npm install.

```javascript
import { hello } from './hello-world';
import { expect } from 'chai';

describe('Hello function', () => {
  it('should return hello world', () => {
    const result = hello();
    expect(result).to.equal('Hello world!');
  });
});
```

Read more about testing on [http://www.chaijs.com/](chai) web site

## E2e testing

End to end testing is the way to ensure your flows are working properly. It can be done easily on UI using selenium, here we will use restShooter library that allows to run a scenario and propagate state of the previous step into the next. It allows also to check content of the answers to verify that we have the behavior we coded.

```
npm run e2e
```

### Configuration

For the server it is strongly recommended to run on test environement with database mocked.
Open dev.cfg (you create more and change your package.json to have different runner for different campaign)

```JSON
{
  "server": "localhost",
  "port": 4000,
  "baseUrl": "/v1",
  "protocol": "http",
  "scenario": [
    "/orderPizza.scn"
  ],
  "content": "JSON",
  "report": "dist/e2e_report.log",
  "debug": false,
  "getSession":function(response,data,stepConfig){
    return data.token;
  },
	"setSession":function(requestOptions,stepConfig,previousSession){
    requestOptions.headers['x-access-token']=previousSession;
  }
}
```

### Test description

Very self explainatory keys in this JSON.
You can run numerous scenario, they will run one by one

If we have a deeper look at the scenario (orderPizza.scn), the runner will perform the following actions, login and order

```JSON
{
	"name":"OrderPizza",
	"steps":[
    "user/login.stp",
    "pizza/order.stp"
	]
}
```

The name is used for reporting and output.
the steps are either files or json that describe what to do.

```JSON
{
	"name":"login",
	"url":"/auth/login",
	"method":"POST",
	"data":"{\"login\":\"user@test.com\",\"password\":\"userpassword\"}",
	"checks":[{
		"path":"token",
		"test":"exist"
	}]
}
```

user and password can be stored in data file which can be injected in database, you can also create a register form and use replacement to share user and password.

```JSON
{
	"name":"order",
	"url":"/pizza/order",
	"method":"POST",
	"data":"{\"pizzas\":[{\"name\",\"Hawaiian\"}]}",
	"checks":[{
		"path":"data",
		"test":"exist"
	}]
}
```

for more details on the checks see the documentation [https://github.com/krysalead/RestShooter](rest-shooter)

### Data

Sometimes your server needs to have a minimum amount of data to be loaded before doing some actions. In order to achieve that you have a preRun section in your e2e run config. It is a javascript function that will be called before each scenario

```javascript
"preRun":function(scenario){
    var pilote = require("./pilote");
    var mergeJSON = require("merge-json") ;
    //If you return a promise the process will be stopped until the promise is resolved and fully stopped if rejected
    return pilote.log("################### Scenario "+scenario.name+" Started #############################").then(()=>{
     return pilote.injectData('e2e/data/test.json');
    }).then((data)=>{
      if(scenario.data){
        return pilote.injectData(scenario.data).then((extraData)=>{
          return {testData:mergeJSON.merge(data,extraData)};
        });
      }else{
        return {testData:data};
      }
    });
  },
```

e2e folder contains something called pilote which is a client with the following possible action

- log: this will log something in the log of the server
- injectData: this will inject a given JSON into the database (see the data structure for the injection)
- resetDatabase: This function will clean the database to start fresh

Here is an example of JSON that can be injected. The top level key must be the name of the DAO you want to use and it is an array where each object must follow the structure of your DAO.

```JSON
{
  "userAuthDAO": [{
    "login": "admin@test.com",
    "password": "adminpassword|password",
    "channel": "EmailPass",
    "role": ["admin"]
  }]
}
```

/!\ This file must not be stored on a public repository if you put some real data inside.

- password pipe will store the password as a password in database
- replacement work here as well you can reference a previously inserted document like \${userAuthDAO.\_id} to get the id in database

###Call for help

Hey, this is already a good start but there is more to go. I need your help for few things.

- Handle another database than MongoDb (starting a connection, mocking in test)
- Test with express (change the code generator, create the authentication)
- Add more login channel (Facebook, Google, instagram...)
- Improve the rest-shooter (Checks on numbers, data to be a json not a string)

Very simple to contribute, just commit and do a PR
