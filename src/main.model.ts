import { APIDocConfig } from './ui/server/ports';

export interface ServerConfiguration {
    port: number;
    apiRoot: string;
    publicAPIDoc: APIDocConfig;
}

export interface DataStoreConfiguration {
    connectionString: string;
}

export interface GeneralConfiguration {
    jwtSecret: string;
    logLevel: string;
    supportContact: string;
}

export interface AppConfiguration {
    appName: string;
    jobRecipient: string;
    login: LoginConfiguration;
    clientUrl: string;
    gdprDate: string;
}

export interface LoginConfiguration {
    threshold: number;
    secondsDelay: number;
}

export interface MailConfiguration {
    fromAddress: string;
    replyToAddress: string;
}

export interface SystemConfigurationService {
    getServerConfiguration(): ServerConfiguration;
    getDataStoreConfiguration(): DataStoreConfiguration;
    getApplicationConfiguration(): AppConfiguration;
    getGeneralConfiguration(): GeneralConfiguration;
    getMailConfiguration(): MailConfiguration;
}
