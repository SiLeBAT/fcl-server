import { Response } from 'express';
import { logger } from '../../../aspects';
import { SystemInfoController } from '../model/controller.model';
import { SystemInformationDTO, GDPRDateDTO } from '../model/response.model';
import { AbstractController } from './abstract.controller';
import { controller, httpGet, response } from 'inversify-express-utils';
import { inject } from 'inversify';
import { ROUTE } from '../model/enums';
import SERVER_TYPES from '../server.types';
import { AppServerConfiguration } from '../model/server.model';
import { UnknownPackageConfigurationError } from '../model/domain.error';
import { APPLICATION_TYPES } from '../../../app/application.types';
import { ConfigurationService } from '../../../app/core/model/configuration.model';
const pjson = require('../../../../package.json');

enum INFO_ROUTE {
    ROOT = '/info',
    GDPR_DATE = '/gdpr-date',
}
@controller(ROUTE.VERSION + INFO_ROUTE.ROOT)
export class DefaultSystemInfoController
    extends AbstractController
    implements SystemInfoController
{
    private supportContact = '';
    constructor(
        @inject(SERVER_TYPES.AppServerConfiguration)
        configuration: AppServerConfiguration,
        @inject(APPLICATION_TYPES.ConfigurationService)
        private configurationService: ConfigurationService
    ) {
        super();
        this.supportContact = configuration.supportContact;
    }

    @httpGet('/')
    async getSystemInfo(@response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getSystemInfo.name}, Request received`
        );
        try {
            if (!(pjson.version && pjson.fclConfig.lastChange)) {
                throw new UnknownPackageConfigurationError(
                    "Version number or date of last change can't be determined."
                );
            }
            const dto: SystemInformationDTO = {
                version: pjson.version,
                lastChange: pjson.fclConfig.lastChange,
                supportContact: this.supportContact,
            };
            logger.info(
                `${this.constructor.name}.${this.getSystemInfo.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getSystemInfo.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    @httpGet(INFO_ROUTE.GDPR_DATE)
    async getGDPRDate(@response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getGDPRDate.name}, Request received`
        );
        try {
            const gdprDate =
                this.configurationService.getApplicationConfiguration()
                    .gdprDate;

            logger.info(
                `${this.constructor.name}.${this.getGDPRDate.name}, gdprDate: ${gdprDate}`
            );

            if (!gdprDate) {
                throw new UnknownPackageConfigurationError(
                    "Date of the data protection policy can't be determined."
                );
            }
            const dto: GDPRDateDTO = {
                gdprDate: gdprDate,
            };
            logger.info(
                `${this.constructor.name}.${this.getGDPRDate.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getGDPRDate.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    private handleError(res: Response) {
        this.fail(res, 'Unable to retrieve system information');
    }
}
