import { inject } from "inversify";
import { CORE_TYPES } from "../constants";
import { provideSingleton } from "../../ioc";
import { IConfigService, IMetricService } from "../interfaces/services";
import { isFloat, isDefined } from "../Utils";
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
  kafkaProducer;
  counter: 0;
  constructor(
    @inject(CORE_TYPES.ConfigService) private configService: IConfigService
  ) {
    let config = configService.getConfig().metric;
    if (isDefined(config.kafka)) {
      const kafka = new Kafka({
        clientId: config.kafka.clientId,
        brokers: config.kafka.brokers.split(","),
      });
      this.kafkaProducer = kafka.producer();
    }
    if (isDefined(config.influx)) {
      const influxInstance = new InfluxDB({
        url: config.influx.url,
        token: config.influx.token,
      });
      this.writeApi = influxInstance.getWriteApi(
        config.influx.organization,
        config.influx.bucket
      );
      this.queryApi = influxInstance.getQueryApi(config.influx.organization);
    }
  }

  public async push(
    type: string,
    name: string,
    value: any,
    tag?: string,
    tagValue?: string
  ) {
    logger.info(`Start push: ${type}`);
    let config = this.configService.getConfig().metric;
    if (isDefined(this.kafkaProducer)) {
      logger.info(`Push with kafka`);
      let dataPoint = { type, name, value, tag, tagValue };
      await this.kafkaProducer.connect();
      logger.debug(`Sending point: ${dataPoint}`);
      await this.kafkaProducer.send({
        topic: config.kafka.topic,
        messages: [{ value: JSON.stringify(dataPoint) }],
      });
    }
    if (isDefined(this.writeApi)) {
      logger.info(`Push with influx`);
      const dataPoint = new Point(type);
      if (tag != undefined && tagValue != undefined) {
        dataPoint.tag(tag, tagValue);
      }
      if (name != undefined && value != undefined && isFloat(value)) {
        dataPoint.floatField(name, value);
      } else {
        dataPoint.stringField(name, value);
      }

      this.writeApi.writePoint(dataPoint);
      logger.debug(`Sent point: ${dataPoint}`);
      this.counter++;
      if (this.counter > 10) {
        this.counter = 0;
        this.writeApi.flush();
      }
    }
    logger.info(`End push`);
  }

  public close() {
    logger.info(`Start flush`);
    return this.writeApi
      .close()
      .then(() => {
        logger.info("Closing and flushing pending data");
        logger.info(`End flush`);
      })
      .catch((e) => {
        logger.error("failure to flush", e);
      });
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
      this.configService.getConfig().metric.influx.bucket
    }") |> range(start: ${rangeStart}, stop:${rangeStop}) |> filter(fn: (r) => r._measurement == "${type}")`;
    if (tag) {
      fluxQuery += ` |> filter(fn: (r) => r.${tag} == "${tagValue}")`;
    }
    logger.debug(`fluxQuery: ${fluxQuery}`);
    return new Promise((resolve, reject) => {
      let data = [];
      this.queryApi.queryRows(fluxQuery, {
        next(row: string[], tableMeta: FluxTableMetaData) {
          data.push(tableMeta.toObject(row));
        },
        error(error: Error) {
          logger.error("query Finished with ERROR", error);
          logger.info("End query");
          reject(error);
        },
        complete() {
          logger.debug("query Finished with SUCCESS");
          logger.info("End query");
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
