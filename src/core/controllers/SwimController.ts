import { Controller } from 'tsoa';
import { ObjectID } from 'mongodb';
import { Logger } from 'typescript-logging';
import { IServiceStatus } from '../interfaces/services';

export class SwimController extends Controller {
  constructor(private logger: Logger) {
    super();
  }
  /**
   * Validate the id as a mongoDb id
   * @param id
   */
  protected isMongoObjectId(id: string): boolean {
    return ObjectID.isValid(id);
  }

  /**
   * Generate a log for a call to a service that failed, return the status with proper code and message
   * @param e
   */
  protected generateServiceFailureStatus(e: any): IServiceStatus {
    this.logger.error('Failed to call service', e);
    console.error('Caused by', e.stack);
    return {
      status: -1,
      message: 'Service call failed, contact admin'
    };
  }
}
