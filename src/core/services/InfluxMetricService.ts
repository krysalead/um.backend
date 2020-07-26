import { inject } from "inversify";
import { CORE_TYPES } from "../constants";
import { provideSingleton } from "../../ioc";
import { IConfigService, IMetricService } from "../interfaces/services";

import {
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
  FluxTableMetaData,
} from "@influxdata/influxdb-client";
import { factory } from "./LoggingService";
import { MetricStats } from "../interfaces/Metric";
const logger = factory.getLogger("services.MetricService");

const { Kafka } = require("kafkajs");

@provideSingleton(CORE_TYPES.MetricService)
class InfluxMetricService implements IMetricService {
  writeApi: WriteApi;
  queryApi: QueryApi;
  counter: 0;
  constructor(
    @inject(CORE_TYPES.ConfigService) private configService: IConfigService
  ) {
    const influxInstance = new InfluxDB({
      url: configService.getConfig().metric.url,
      token: configService.getConfig().metric.token,
    });

    const kafka = new Kafka({
      clientId: "my-app",
      brokers: ["kafka1:9092", "kafka2:9092"],
    });
    this.queryApi = influxInstance.getQueryApi("8e23967877953738");
  }

  public push(
    type: string,
    name: string,
    value: any,
    tag?: string,
    tagValue?: string
  ) {}

  public flush() {
    return Promise.resolve();
  }

  public query(
    type: string,
    name: string,
    value: any,
    rangeStart: number,
    rangeStop: number,
    tag?: string,
    tagValue?: string
  ): Promise<MetricStats[]> {
    logger.info("Start query");
    let fluxQuery = `from(bucket:"${
      this.configService.getConfig().metric.bucket
    }") |> range(start: ${rangeStart}, stop:${rangeStop}) |> filter(fn: (r) => r._measurement == "${type}")`;
    if (tag) {
      fluxQuery += ` |> filter(fn: (r) => r.${tag} == "${tagValue}")`;
    }
    logger.debug(`fluxQuery: ${fluxQuery}`);
    logger.info("End query");
    return new Promise((resolve, reject) => {
      let data = [];
      this.queryApi.queryRows(fluxQuery, {
        next(row: string[], tableMeta: FluxTableMetaData) {
          data.push(tableMeta.toObject(row));
        },
        error(error: Error) {
          logger.error("query Finished with ERROR", error);
          reject(error);
        },
        complete() {
          logger.debug("query Finished with SUCCESS");
          resolve(
            data.map((m) => {
              delete m.result;
              delete m._start;
              delete m._stop;
              delete m.table;
              delete m._measurement;
              if (tag) {
                delete m[tag];
              }

              return m;
            })
          );
        },
      });
    });
  }
}
