import { CoreConfig } from "../core/interfaces/CoreConfig";

export interface Config extends CoreConfig {
  geoloc: {
    apikey: string;
  };
}
