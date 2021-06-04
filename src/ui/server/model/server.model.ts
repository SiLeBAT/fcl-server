export interface APIDocConfig {
    [keys: string]: string[];
}
export interface AppServerConfiguration {
    port: number;
    apiRoot: string;
    publicAPIDoc: APIDocConfig;
    jwtSecret: string;
    logLevel: string;
    supportContact: string;
}
