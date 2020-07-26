import { provideSingleton } from "../ioc";
import { TYPES } from "../interfaces/types";
import { IGeoIpService } from "../interfaces/services";
import { Location } from "../interfaces/location";
import { inject } from "inversify";
import { CORE_TYPES } from "../core/constants";
import { IConfigService } from "../core/interfaces/services";
import { factory } from "../core/services/LoggingService";
const ipapi = require("ipapi.co");

const logger = factory.getLogger("service.geoipservice");

@provideSingleton(TYPES.GeoIpService)
export class GeopIpService implements IGeoIpService {
  constructor(
    @inject(CORE_TYPES.ConfigService) private configService: IConfigService
  ) {}
  getCountry(ip: any): Promise<Location> {
    logger.info(
      "Start getCountry " + this.configService.getConfig().geoloc.apikey
    );
    return new Promise((resolve, reject) => {
      ipapi.location(
        (res) => {
          if (!res.error) {
            resolve(res);
          } else {
            logger.error(
              `Failed to get country for the ip:${ip},${res.detail}`
            );
            reject(null);
          }
          logger.info("End getCountry");
        },
        ip,
        this.configService.getConfig().geoloc.apikey
      );
    });
  }
}
