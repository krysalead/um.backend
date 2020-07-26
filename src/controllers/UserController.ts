import { SwimController } from "../core/controllers/SwimController";
import { provide, inject } from "../ioc";
import { Route, Post, Example, Body, Request, Get, Path } from "tsoa";
import { factory } from "../core/services/LoggingService";
import * as hapi from "hapi";
import {
  AddUserResponse,
  AddUserRequest,
  ListUserResponse,
} from "../io/User.io";
import { TYPES, ERROR_CODES } from "../interfaces/types";
import { IUserService, IGeoIpService } from "../interfaces/services";
import { IServiceStatus } from "../core/interfaces/services";
import { User } from "../models/User";

const logger = factory.getLogger("controller.user");

@Route("user")
@provide(UserController)
export class UserController extends SwimController {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.GeoIpService) private geolocService: IGeoIpService
  ) {
    super(logger);
  }

  @Post()
  @Example<AddUserResponse>({
    status: 0,
    message: "",
    data: {
      id: 1,
      lastName: "john",
      firstName: "Doe",
      email: "jdoe@yahoo.fr",
    },
  })
  public async addUser(
    @Body() addUserRequest: AddUserRequest,
    @Request() request: any
  ): Promise<AddUserResponse> {
    logger.info("Start addUser");
    // No need of validation of the model as the TSOA framework is validating the input based on the typescript model specs
    //Prepare a default valid return.
    // We return a Status and a message and the data is aside, allowing extension of the response without breaking the model
    // Error are caught at this level so we can answer properly to client. Note that for authentication check again TSOA is catching that earlier
    let status: IServiceStatus = { status: 0, message: "" };
    let user: User;
    try {
      const country = await this.geolocService.getCountry(
        request.info.remoteAddress
      );
      logger.debug("Connection from:" + JSON.stringify(country));
      // reserved is for localhost bypass
      if (country.country === "FR" || country.reserved) {
        user = await this.userService.addUser(addUserRequest);
      } else {
        status = {
          status: ERROR_CODES.NOT_FROM_FRANCE,
          message: "You must be in France to add users",
        };
      }
    } catch (e) {
      logger.error("Failed to add a user", e);
      status = this.generateServiceFailureStatus(e);
    }
    logger.info("End addUser");
    return { ...status, data: user };
  }

  @Get("search/{searchFilter}")
  @Example<ListUserResponse>({
    status: 0,
    message: "",
    data: [
      {
        id: 1,
        lastName: "john",
        firstName: "Doe",
        email: "jdoe@yahoo.fr",
      },
    ],
  })
  public async searchUser(
    @Path("searchFilter") searchFilter: string
  ): Promise<ListUserResponse> {
    logger.info("Start searchUser");
    let status: IServiceStatus = { status: 0, message: "" };
    let user: User[];
    try {
      user = await this.userService.listUser(searchFilter);
    } catch (e) {
      logger.error("Failed to search for users", e);
      status = this.generateServiceFailureStatus(e);
    }
    logger.info("End searchUser");
    return { ...status, data: user };
  }
  @Get()
  @Example<ListUserResponse>({
    status: 0,
    message: "",
    data: [
      {
        id: 1,
        lastName: "john",
        firstName: "Doe",
        email: "jdoe@yahoo.fr",
      },
    ],
  })
  public async listUser(): Promise<ListUserResponse> {
    logger.info("Start listUser");
    let status: IServiceStatus = { status: 0, message: "" };
    let user: User[];
    try {
      user = await this.userService.listUser();
    } catch (e) {
      logger.error("Failed to list user", e);
      status = this.generateServiceFailureStatus(e);
    }
    logger.info("End listUser");
    return { ...status, data: user };
  }
}
