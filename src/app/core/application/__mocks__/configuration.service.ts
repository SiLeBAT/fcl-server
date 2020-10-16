import {
    ConfigurationService,
    ApplicationConfiguration
} from '../../model/configuration.model';

class MockConfigurationService implements ConfigurationService {
    getApplicationConfiguration(): ApplicationConfiguration {
        return {
            login: {
                threshold: 5,
                secondsDelay: 300
            },
            appName: 'Mock',
            jobRecipient: 'test@test.com',
            supportContact: 'test',
            jwtSecret: 'test',
            apiUrl: 'test',
            gdprDate: 'test'
        };
    }
}

const configurationService = new MockConfigurationService();

function getMockConfigurationService(): ConfigurationService {
    return configurationService;
}
export { getMockConfigurationService };
