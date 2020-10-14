// npm
import {
    ApplicationConfiguration,
    ConfigurationService
} from '../model/configuration.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultConfigurationService implements ConfigurationService {
    constructor(
        @inject(APPLICATION_TYPES.ApplicationConfiguration)
        private appConfiguration: ApplicationConfiguration
    ) {}

    getApplicationConfiguration(): ApplicationConfiguration {
        return this.appConfiguration;
    }
}
