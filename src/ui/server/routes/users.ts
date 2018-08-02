// DEPRECATED
// FIXME: Only exists for backward compatibility until the REST interface is cleaned up
import * as express from 'express';
import { getRouter as getBaseRouter, RouterType } from './routerProvider';
import { IControllerFactory } from '../sharedKernel';
import { logger } from '../../../aspects';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    logger.verbose('Registering Route', { route: '/login' });
    router.use('/login', getBaseRouter(RouterType.LOGIN, controllerFactory));
    logger.verbose('Registering Route', { route: '/register' });
    router.use('/register', getBaseRouter(RouterType.REGISTER, controllerFactory));
    logger.verbose('Registering Route', { route: '/recovery' });
    router.use('/recovery', getBaseRouter(RouterType.RECOVERY, controllerFactory));
    logger.verbose('Registering Route', { route: '/reset' });
    router.use('/reset', getBaseRouter(RouterType.RESET, controllerFactory));
    logger.verbose('Registering Route', { route: '/activate' });
    router.use('/activate', getBaseRouter(RouterType.ACTIVATE, controllerFactory));
    logger.verbose('Registering Route', { route: '/adminactivate' });
    router.use('/adminactivate', getBaseRouter(RouterType.ADMINACTIVATE, controllerFactory));
    return router;
}

export {
    getRouter
};
