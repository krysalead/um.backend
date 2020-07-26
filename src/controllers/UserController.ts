import { SwimController } from "../core/controllers/SwimController";
import { provide, inject } from "../ioc";
import { Route, Post, Example, Body, Request, Get, Path } from "tsoa";
import { factory } from "../core/services/LoggingService";
import {
  AddUserResponse,
  AddUserRequest,
  ListUserResponse,
} from "../io/User.io";
import { TYPES } from "../interfaces/types";
import { IUserService } from "../interfaces/services";
import { IServiceStatus } from "../core/interfaces/services";
import { User } from "../models/User";

const logger = factory.getLogger("controller.user");

@Route("user")
@provide(UserController)
export class UserController extends SwimController {
  constructor(@inject(TYPES.UserService) private userService: IUserService) {
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
    // Error are catch at this level so we can answer propoerly. Note that for authentication check again TSOA is catching that earlier
    let status: IServiceStatus = { status: 0, message: "" };
    let user: User;
    try {
      user = await this.userService.addUser(addUserRequest);
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
