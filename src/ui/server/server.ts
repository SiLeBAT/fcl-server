import * as path from 'path';
import * as express from 'express';
import * as helmet from 'helmet';
import * as compression from 'compression';
// import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';
import * as swaggerUi from 'swagger-ui-express';
import { InversifyExpressServer } from 'inversify-express-utils';

// local
import { logger } from './../../aspects';
import { validateToken } from './middleware/token-validator.middleware';
import { Logger } from '../../aspects/logging';
import { SERVER_ERROR_CODE, ROUTE } from './model/enums';
import { AppServerConfiguration } from './model/server.model';
import { injectable, Container } from 'inversify';
import SERVER_TYPES from './server.types';

export interface AppServer {
    startServer(): void;
}

@injectable()
export class DefaultAppServer implements AppServer {
    private server: InversifyExpressServer;

    private publicDir = 'public';

    constructor(container: Container) {
        this.initialise(container);
    }

    startServer() {
        const app = this.server.build();
        app.listen(app.get('port'), () =>
            app.get('logger').info('API running', { port: app.get('port') })
        );
    }

    private initialise(container: Container) {
        this.server = new InversifyExpressServer(container);
        const serverConfig = container.get<AppServerConfiguration>(
            SERVER_TYPES.AppServerConfiguration
        );
        this.server.setConfig((app) => {
            app.use(helmet());
            app.use(compression());
            app.set('port', serverConfig.port);
            app.set('logger', logger);

            // tslint:disable-next-line: deprecation
            app.use(express.json({ limit: '50mb' }));
            app.use(
                // tslint:disable-next-line: deprecation
                express.urlencoded({
                    extended: false,
                })
            );

            app.use((req, res, next) => {
                res.setHeader('X-Frame-Options', 'deny');
                res.setHeader(
                    'Cache-Control',
                    'no-cache, no-store, must-revalidate'
                );
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('X-XSS-Protection', '1; mode=block');
                res.setHeader('X-Content-Type-Options', 'nosniff');
                next();
            });

            app.use(cors());
            app.use(
                morgan(Logger.mapLevelToMorganFormat(serverConfig.logLevel))
            );
            app.use(express.static(path.join(__dirname, this.publicDir)));
            app.use(
                '/api-docs' + ROUTE.VERSION,
                swaggerUi.serve,
                swaggerUi.setup(undefined, {
                    swaggerUrl: ROUTE.VERSION,
                })
            );
            app.use(
                ROUTE.VERSION + '/*',
                validateToken(serverConfig.jwtSecret)
            );
        });

        this.server.setErrorConfig((app) => {
            app.use(
                (
                    // tslint:disable-next-line
                    err: any,
                    req: express.Request,
                    res: express.Response,
                    next: express.NextFunction
                ) => {
                    if (err.status === 401) {
                        app.get('logger').warn(
                            `Log caused error with status 401. error=${err}`
                        );
                        res.status(401)
                            .send({
                                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                                message: err.message,
                            })
                            .end();
                    }
                }
            );

            app.get('*', (req: express.Request, res: express.Response) => {
                res.sendFile(
                    path.join(__dirname, this.publicDir + '/index.html')
                );
            });
        });
    }
}

function createServer(container: Container): AppServer {
    return new DefaultAppServer(container);
}

export { createServer };
