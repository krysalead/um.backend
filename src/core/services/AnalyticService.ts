import { Visitor } from "universal-analytics";
import { CORE_TYPES } from "../constants";
import { provideSingleton, inject } from "../../ioc";
import { IAnalyticService, IConfigService } from "../interfaces/services";
import { get } from "../services/CLSService";

@provideSingleton(CORE_TYPES.AnalyticService)
class AnalyticService implements IAnalyticService {
  isEnabled = false;
  constructor(
    @inject(CORE_TYPES.ConfigService) private configService: IConfigService
  ) {
    this.isEnabled = this.configService.getConfig().analytics.id != null;
  }

  _getVisitor() {
    let userId = get("userId");
    let option;
    if (userId) {
      option = {
        uid: userId,
      };
    }
    return new Visitor(this.configService.getConfig().analytics.id, option);
  }

  sendEvent(eventCategory: string, eventAction: string) {
    if (this.isEnabled) {
      this._getVisitor().event(eventCategory, eventAction).send();
    }
  }
}
