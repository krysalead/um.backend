import { factory } from "./LoggingService";
import { CORE_TYPES } from "../interfaces/coreTypes";
import { IAnalyticService, ISQLService } from "../interfaces/services";
import { provideSingleton, inject } from "../../ioc";
import { ConnectionOptions, createConnection } from "typeorm";
import { IConfigService } from "../../interfaces/services";
import * as path from "path";
const root: string = path.resolve(__dirname, "../../..");

const logger = factory.getLogger("service.SQLlite");

@provideSingleton(CORE_TYPES.SQLService)
export class SQLiteService implements ISQLService {
  connection;
  constructor(
    @inject(CORE_TYPES.AnalyticService)
    private analyticService: IAnalyticService,
    @inject(CORE_TYPES.ConfigService)
    private configService: IConfigService
  ) {}
  public async init() {
    await this.getConnection();
  }
  private async getConnection() {
    if (this.connection) {
      return this.connection;
    }
    const pathToDb = path.resolve(
      root,
      this.configService.getConfig().database.sql.path
    );
    logger.info("Connecting SQLite to " + pathToDb);
    const options: ConnectionOptions = {
      type: "sqlite",
      database: pathToDb,
      entities: this.configService.getConfig().database.sql.entities,
      logging: this.configService.getConfig().database.sql.logging
    };
    this.connection = await createConnection(options);
    logger.info("SQLlite up and running");
  }

  async getByPk(entityType: any, pkName: any, pkValue: any): Promise<any> {
    const entityRepository = this.connection.getRepository(entityType);
    const entity = await entityRepository
      .createQueryBuilder(entityType.entityName)
      .where(`${entityType.entityName}.${pkName}=:id`)
      .setParameter("id", pkValue)
      .getOne();
    return entity;
  }
}
