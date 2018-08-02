import * as express from 'express';
import { getRouter as getV1Router } from './v1';
import { getRouter as getUserRouter } from './users';
import { logger } from '../../../aspects';

function init(server: express.Express) {
    const apiRoute = express.Router();
    logger.verbose('Registering Route', { route: '/v1' });
    apiRoute.use('/v1', getV1Router(server.get('controllerFactory')));
    logger.verbose('Registering Route', { route: '/api' });
    server.use('/api', apiRoute);
    logger.verbose('Registering Route', { route: '/users' });
    server.use('/users', getUserRouter(server.get('controllerFactory')));
    logger.info('Finished initalising server routes');
}

export const routes = {
    init
};
