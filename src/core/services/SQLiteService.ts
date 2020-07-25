import { factory } from "./LoggingService";
import { CORE_TYPES } from "../constants";
import {
  IAnalyticService,
  ISQLService,
  IConfigService,
} from "../interfaces/services";
import { provideSingleton, inject } from "../../ioc";
import { ConnectionOptions, createConnection } from "typeorm";
import * as path from "path";
import { isUndefined, isDefined } from "../Utils";
import { DatabaseService } from "./DatabaseService";
const root: string = path.resolve(__dirname, "../../..");

const logger = factory.getLogger("service.SQLlite");

@provideSingleton(CORE_TYPES.SQLService)
export class SQLiteService extends DatabaseService implements ISQLService {
  connection;
  constructor(
    @inject(CORE_TYPES.AnalyticService)
    private analyticService: IAnalyticService,
    @inject(CORE_TYPES.ConfigService)
    private configService: IConfigService
  ) {
    super(configService);
  }
  reset(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  close() {
    throw new Error("Method not implemented.");
  }
  public async init() {
    await this.getConnection();
  }
  /**
   * Build a connection with the configuration from the config service
   * If no configuration provided it raises an exception
   * @returns The connection
   */
  private async getConnection() {
    if (this.connection) {
      return this.connection;
    }
    if (isUndefined(this.configService.getConfig().database.sql)) {
      throw new Error("SQLLite database configuration is missing");
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
      logging: this.configService.getConfig().database.sql.logging,
    };
    this.connection = await createConnection(options);
    logger.info("SQLlite up and running");
  }

  /**
   * The Tables in the database are suffixed with a 's'
   * @param entityType the entity for which we would like to do the query
   * @returns the name of the entity and a 's'
   */
  private getTableFromEntity(entityType: any) {
    return entityType.entityName + "s";
  }

  async executreRawSQL(query: string, entityType: any): Promise<any> {
    return await this.connection.query(
      query.replace("$table", this.getTableFromEntity(entityType))
    );
  }

  async getByPk(entityType: any, pkName: any, pkValue: any): Promise<any> {
    logger.info("Get by Primary Key");
    if (isUndefined(this.connection)) {
      throw "SQLService init method must be called first";
    }
    const entity = await this.connection
      .getRepository(entityType)
      .createQueryBuilder(this.getTableFromEntity(entityType))
      .where(`${entityType.entityName}.${pkName}=:id`)
      .setParameter("id", pkValue)
      .getOne();
    return entity;
  }

  /**
   * Insert a single entity inside the database
   * @param entityType
   * @param entity
   */
  async insertSingleEntity(entityType: any, entity: any): Promise<any> {
    logger.info("insertSingleEntity");
    if (isUndefined(this.connection)) {
      throw "SQLService init method must be called first";
    }
    return await this.connection
      .createQueryBuilder()
      .insert()
      .into(this.getTableFromEntity(entityType))
      .values([entity])
      .execute();
  }

  async getEntities(
    entityType: any,
    fieldsValues?: { field: string; value: string }[]
  ): Promise<any> {
    logger.info("getEntities");
    if (isUndefined(this.connection)) {
      throw "SQLService init method must be called first";
    }
    let builder = this.connection
      .getRepository(entityType)
      .createQueryBuilder(this.getTableFromEntity(entityType));
    if (isDefined(fieldsValues)) {
      builder.where(
        fieldsValues.reduce((acc, fieldValue, index) => {
          const { field } = fieldValue;
          let clause = `${this.getTableFromEntity(
            entityType
          )}.${field}=:val${index}`;
          if (acc != "") clause = ` OR ${clause}`;
          return acc + clause;
        }, "")
      );
      fieldsValues.forEach((fieldValue, index) => {
        const { value } = fieldValue;
        builder.setParameter(`val${index}`, value);
      });
    }
    return builder.getMany();
  }
}
