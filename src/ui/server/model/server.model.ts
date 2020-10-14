export interface APIDocConfig {
    [keys: string]: string[];
}
export interface AppServerConfiguration {
    port: number;
    publicAPIDoc: APIDocConfig;
    jwtSecret: string;
    logLevel: string;
    supportContact: string;
}
