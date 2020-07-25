import { IUserService } from "../interfaces/services";
import { User } from "../models/User";
import { provideSingleton, inject } from "../ioc";
import { TYPES } from "../interfaces/types";
import { CORE_TYPES, REGEXP } from "../core/constants";
import { ISQLService } from "../core/interfaces/services";
import {
  UserEntity,
  EMAIL_COL_NAME,
  LAST_NAME_COL_NAME,
  FIRST_NAME_COL_NAME,
} from "../dao/UserEntity";
import { factory } from "../core/services/LoggingService";
import { isUndefined } from "../core/Utils";

const logger = factory.getLogger("service.user");

@provideSingleton(TYPES.UserService)
export class UserService implements IUserService {
  constructor(@inject(CORE_TYPES.SQLService) private sqlService: ISQLService) {}
  async addUser(user: User): Promise<User> {
    logger.info("Start addUser");
    await this.sqlService.insertSingleEntity(UserEntity, user);
    logger.info("End addUser");
    return user;
  }

  async listUser(search?: string): Promise<User[]> {
    logger.info("Start listUser");
    let list: User[];
    if (isUndefined(search)) {
      list = await this.sqlService.getEntities(UserEntity);
    } else {
      if (RegExp(REGEXP.EMAIL).test(search)) {
        list = await this.sqlService.getEntities(UserEntity, [
          { field: EMAIL_COL_NAME, value: search },
        ]);
      } else {
        list = await this.sqlService.getEntities(UserEntity, [
          { field: LAST_NAME_COL_NAME, value: search },
          { field: FIRST_NAME_COL_NAME, value: search },
        ]);
      }
    }
    logger.info("End listUser");
    return list;
  }
}
