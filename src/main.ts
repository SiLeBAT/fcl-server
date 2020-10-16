import * as config from 'config';
import { logger, getContainer } from './aspects';
import { createServer, getServerContainerModule } from './ui/server/ports';
import {
    createDataStore,
    getPersistenceContainerModule,
    MailService,
    getMailContainerModule,
    MAIL_TYPES
} from './infrastructure/ports';
import {
    createApplication,
    FclApplication,
    getApplicationContainerModule
} from './app/ports';
import {
    SystemConfigurationService,
    LoginConfiguration,
    GeneralConfiguration,
    ServerConfiguration,
    MailConfiguration,
    AppConfiguration,
    DataStoreConfiguration
} from './main.model';

export class DefaultConfigurationService implements SystemConfigurationService {
    private loginConfigurationDefaults: LoginConfiguration = {
        threshold: 5,
        secondsDelay: 300
    };

    private generalConfigurationDefaults: GeneralConfiguration = {
        logLevel: 'info',
        supportContact: '',
        jwtSecret: ''
    };

    getServerConfiguration(): ServerConfiguration {
        return config.get('server');
    }

    getDataStoreConfiguration(): DataStoreConfiguration {
        return config.get('dataStore');
    }

    getMailConfiguration(): MailConfiguration {
        return config.get('mail');
    }

    getApplicationConfiguration(): AppConfiguration {
        const appConfiguration: AppConfiguration = config.get('application');

        if (!config.has('application.login')) {
            appConfiguration.login = {
                threshold: this.loginConfigurationDefaults.threshold,
                secondsDelay: this.loginConfigurationDefaults.secondsDelay
            };
        }

        if (!config.has('application.login.threshold')) {
            appConfiguration.login.threshold = this.loginConfigurationDefaults.threshold;
        }

        if (!config.has('application.login.secondsDelay')) {
            appConfiguration.login.secondsDelay = this.loginConfigurationDefaults.secondsDelay;
        }

        return appConfiguration;
    }

    getGeneralConfiguration(): GeneralConfiguration {
        let generalConfiguration: GeneralConfiguration = config.get('general');

        if (!config.has('general')) {
            generalConfiguration = {
                logLevel: this.generalConfigurationDefaults.logLevel,
                supportContact: this.generalConfigurationDefaults
                    .supportContact,
                jwtSecret: this.generalConfigurationDefaults.jwtSecret
            };
        }

        if (!config.has('general.logLevel')) {
            generalConfiguration.logLevel = this.generalConfigurationDefaults.logLevel;
        }

        return generalConfiguration;
    }
}

async function init() {
    const configurationService = new DefaultConfigurationService();
    const serverConfig: ServerConfiguration = configurationService.getServerConfiguration();
    const generalConfig: GeneralConfiguration = configurationService.getGeneralConfiguration();
    const dataStoreConfig: DataStoreConfiguration = configurationService.getDataStoreConfiguration();
    const appConfiguration: AppConfiguration = configurationService.getApplicationConfiguration();
    const mailConfiguration: MailConfiguration = configurationService.getMailConfiguration();

    createDataStore(dataStoreConfig.connectionString);

    const container = getContainer({ defaultScope: 'Singleton' });

    container.load(
        getApplicationContainerModule({
            ...appConfiguration,
            supportContact: generalConfig.supportContact,
            jwtSecret: generalConfig.jwtSecret
        }),
        getPersistenceContainerModule(),
        getServerContainerModule({
            ...serverConfig,
            jwtSecret: generalConfig.jwtSecret,
            logLevel: generalConfig.logLevel,
            supportContact: generalConfig.supportContact
        }),
        getMailContainerModule(mailConfiguration)
    );

    const application: FclApplication = createApplication(container);

    const mailService = container.get<MailService>(MAIL_TYPES.MailService);
    application.addNotificationHandler(
        mailService.getMailHandler().bind(mailService)
    );

    const server = createServer(container);
    server.startServer();

    process.on('uncaughtException', error => {
        logger.error(`Uncaught Exception. error=${error}`);
        process.exit(1);
    });
}

init().catch(error => {
    logger.error(`Unable to initialise application. error=${error}`);
    throw error;
});
