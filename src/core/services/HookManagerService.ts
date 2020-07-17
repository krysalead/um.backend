import { factory } from "../../core/services/LoggingService";
import { CORE_TYPES } from "../../core/interfaces/coreTypes";
import { provideSingleton, inject } from "../../ioc";
import {
  IAnalyticService,
  IHookManagerService,
} from "../../core/interfaces/services";
import { IProcessHook } from "../interfaces/services";

const logger = factory.getLogger("hook.HookManagerService");

@provideSingleton(CORE_TYPES.HookManagerService)
export class HookManagerService implements IHookManagerService {
  private hooks: IProcessHook[];
  constructor(
    @inject(CORE_TYPES.AnalyticService)
    private analyticService: IAnalyticService
  ) {
    this.hooks = [];
  }

  register(customer: string, eventName: string, hook: IProcessHook) {
    if (customer) {
      if (!this.hooks[customer]) {
        this.hooks[customer] = [];
      }
      if (!this.hooks[customer][eventName]) {
        this.hooks[customer][eventName] = [];
      }
      this.hooks[customer][eventName].push(hook);
    } else {
      if (!this.hooks[eventName]) {
        this.hooks[eventName] = [];
      }
      this.hooks[eventName].push(hook);
    }
    logger.info(`${customer} hook registered on event ${eventName}`);
  }

  async newEvent(customer: string, eventName: string, data: any): Promise<any> {
    logger.info(`Start processHooks`);
    //Add generic hooks
    let hooks = this.hooks[eventName] || [];
    //Add customer specific
    hooks.concat(
      this.hooks[customer] && this.hooks[customer][eventName]
        ? this.hooks[customer][eventName]
        : []
    );
    logger.debug(`running hooks for ${customer} with ${eventName} event`);
    let alteredData = await Promise.all(
      hooks.map(async (element: IProcessHook) => {
        try {
          return await element.onProcessStart(data, eventName);
        } catch (e) {
          logger.error("Hook failed to execute", e);
          return Promise.resolve(data);
        }
      })
    );
    logger.info(`End processHooks`);
    return alteredData[0] || data;
  }
}
